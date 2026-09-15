import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateDeclarationDto } from './dto/create-declaration.dto';
import { UpdateDeclarationDto } from './dto/update-declaration.dto';
import { CreateFromExogenaDto, ExogenaCustomItemDto, ExogenaItemDto } from './dto/create-from-exogena.dto';
import { MoveItemDto, MoveableFromKind, MoveableToKind } from './dto/move-item.dto';
import { Declaration } from './entities/declaration.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityTarget, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Not, IsNull, MoreThanOrEqual } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { FindAllDeclarationsDto } from './dto/find-all-declarations.dto';
import { DeclarationStatus } from './enums/declaration-status.enum';
import { Asset } from 'src/assets/entities/asset.entity';
import { Income } from 'src/incomes/entities/income.entity';
import { Liability } from 'src/liabilities/entities/liability.entity';
import { CustomItem } from 'src/custom-items/entities/custom-item.entity';
import { UnclassifiedItem } from 'src/unclassified-items/entities/unclassified-item.entity';
import { ConceptType } from 'src/concept-types/entities/concept-type.entity';
import { ConceptSubtype } from 'src/concept-subtypes/entities/concept-subtype.entity';
import { ConceptSubtypesService } from 'src/concept-subtypes/concept-subtypes.service';
import { ItemScope } from 'src/shared/enums/item-scope.enum';
import { Source } from 'src/shared/enums/source.enum';

@Injectable()
export class DeclarationsService {

  private readonly logger = new Logger('DeclarationsService');

  constructor(
    @InjectRepository(Declaration)
    private readonly declarationRepository: Repository<Declaration>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly conceptSubtypesService: ConceptSubtypesService,
  ) {}

  async create(createDeclarationDto: CreateDeclarationDto) {
    try {
      const declaration = this.declarationRepository.create({
        ...createDeclarationDto,
        user: { id: createDeclarationDto.userId } as User
      });
      await this.declarationRepository.save(declaration);
      return declaration;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  // Tablas movibles por kind (whitelist interna: nunca llega input crudo aquí).
  // MoveableFromKind es el superconjunto (incluye 'unclassified' como origen).
  private static readonly ITEM_ENTITIES: Record<MoveableFromKind, EntityTarget<any>> = {
    asset: Asset,
    income: Income,
    liability: Liability,
    custom: CustomItem,
    unclassified: UnclassifiedItem,
  };

  // Solo UnclassifiedItem tiene columnas de reportante (reporter_name/nit):
  // al salir de esa tabla se pliegan a source_detail para no perder
  // información de la DIAN. Idempotente si ya estaban incluidas.
  // Parámetros unknown: el origen del move es any por diseño.
  private static foldReporterIntoSourceDetail(
    sourceDetail: unknown,
    reporterName: unknown,
    reporterNit: unknown,
  ): string | undefined {
    const base = typeof sourceDetail === 'string' ? sourceDetail.trim() : '';
    const name = typeof reporterName === 'string' ? reporterName.trim() : '';
    const nit = typeof reporterNit === 'string' ? reporterNit.trim() : '';
    let label = '';
    if (name && nit) {
      label = `${name} (NIT ${nit})`;
    } else if (name) {
      label = name;
    } else if (nit) {
      label = `NIT ${nit}`;
    }
    if (label && ((name && base.includes(name)) || (nit && base.includes(nit)))) {
      return base || undefined;
    }
    const parts = [label, base].filter((part) => part.length > 0);
    return parts.length > 0 ? parts.join(' | ') : undefined;
  }

  /**
   * Crea una declaración junto con sus patrimonios, ingresos, deudas,
   * ítems personalizados y conceptos no catalogados en una sola
   * transacción (origen EXOGENA). Usa inserts por lotes por cada tipo
   * de ítem para minimizar los round-trips a la base de datos.
   * Nada se descarta: lo no clasificado se persiste en
   * unclassified_items y lo custom va directo a custom_items.
   */
  async createFromExogena(createFromExogenaDto: CreateFromExogenaDto) {
    const { userId, taxableYear, description, assets = [], incomes = [], liabilities = [], unclassified = [], custom = [] } = createFromExogenaDto;

    try {
      const result = await this.dataSource.transaction(async (manager) => {
        const declaration = manager.create(Declaration, {
          user: { id: userId } as User,
          taxableYear,
          status: DeclarationStatus.PENDING,
          description: description ?? `Declaración de renta ${taxableYear} - Exógena DIAN`,
        });
        const savedDeclaration = await manager.save(declaration);

        // Resuelve una sola vez cada subtipo referenciado (por ámbito del arreglo).
        // Referencia inválida => 400 y rollback total (fail fast, nada a medias).
        const resolveSubtypes = async (items: ExogenaItemDto[], scope: ItemScope) => {
          const ids = [...new Set(items.map((item) => item.subtypeId).filter((id): id is string => !!id))];
          const resolved = new Map<string, ConceptSubtype>();
          for (const id of ids) {
            resolved.set(
              id,
              await this.conceptSubtypesService.resolveForItem(manager, id, scope),
            );
          }
          return resolved;
        };
        const [assetSubtypes, incomeSubtypes, liabilitySubtypes] = await Promise.all([
          resolveSubtypes(assets, ItemScope.ASSET),
          resolveSubtypes(incomes, ItemScope.INCOME),
          resolveSubtypes(liabilities, ItemScope.LIABILITY),
        ]);

        // Tipos custom referenciados: deben existir y estar activos.
        // Referencia inválida => 400 y rollback total (fail fast).
        const customTypeIds = [...new Set(custom.map((item) => item.conceptTypeId))];
        const customTypes = new Map<string, ConceptType>();
        for (const typeId of customTypeIds) {
          const found = await manager.findOneBy(ConceptType, { id: typeId });
          if (!found) {
            throw new NotFoundException('Concept type not found');
          }
          if (!found.isActive) {
            throw new BadRequestException('Cannot import items to an inactive concept type');
          }
          customTypes.set(typeId, found);
        }

        // Subtipos custom por par (subtypeId + conceptTypeId): el subtipo
        // debe pertenecer al mismo tipo destino. Clave compuesta para no
        // mezclar el mismo subtipo entre tipos distintos.
        const customSubtypeKeys = [
          ...new Set(
            custom
              .filter((item): item is ExogenaCustomItemDto & { subtypeId: string } => !!item.subtypeId)
              .map((item) => `${item.subtypeId}|${item.conceptTypeId}`),
          ),
        ];
        const customSubtypes = new Map<string, ConceptSubtype>();
        for (const key of customSubtypeKeys) {
          const [subtypeId, conceptTypeId] = key.split('|');
          customSubtypes.set(
            key,
            await this.conceptSubtypesService.resolveForItem(
              manager,
              subtypeId,
              ItemScope.CUSTOM,
              conceptTypeId,
            ),
          );
        }

        const mapItems = (items: ExogenaItemDto[], subtypes: Map<string, ConceptSubtype>) =>
          items.map((item) => ({
            concept: item.concept,
            amount: item.amount,
            source: Source.EXOGENA,
            sourceDetail: item.sourceDetail ?? undefined,
            subtype: item.subtypeId ? subtypes.get(item.subtypeId) : undefined,
            declaration: { id: savedDeclaration.id } as Declaration,
          }));

        const mapUnclassified = (items: ExogenaItemDto[]) =>
          items.map((item) => ({
            concept: item.concept,
            amount: item.amount,
            source: Source.EXOGENA,
            sourceDetail: item.sourceDetail ?? undefined,
            reporterName: item.reporterName?.trim() || undefined,
            reporterNit: item.reporterNit?.trim() || undefined,
            declaration: { id: savedDeclaration.id } as Declaration,
          }));

        // CustomItem no tiene columnas de reportante: se pliega a
        // source_detail para no perder información de la DIAN.
        const foldCustomSourceDetail = (item: ExogenaCustomItemDto): string | undefined =>
          DeclarationsService.foldReporterIntoSourceDetail(
            item.sourceDetail,
            item.reporterName,
            item.reporterNit,
          );

        const mapCustom = (items: ExogenaCustomItemDto[]) =>
          items.map((item) => ({
            concept: item.concept,
            amount: item.amount,
            source: Source.EXOGENA,
            sourceDetail: foldCustomSourceDetail(item),
            subtype: item.subtypeId
              ? customSubtypes.get(`${item.subtypeId}|${item.conceptTypeId}`)
              : undefined,
            declaration: { id: savedDeclaration.id } as Declaration,
            conceptType: { id: item.conceptTypeId } as ConceptType,
          }));

        const [assetsResult, incomesResult, liabilitiesResult, unclassifiedResult, customResult] = await Promise.all([
          assets.length > 0 ? manager.insert(Asset, mapItems(assets, assetSubtypes)) : null,
          incomes.length > 0 ? manager.insert(Income, mapItems(incomes, incomeSubtypes)) : null,
          liabilities.length > 0 ? manager.insert(Liability, mapItems(liabilities, liabilitySubtypes)) : null,
          unclassified.length > 0 ? manager.insert(UnclassifiedItem, mapUnclassified(unclassified)) : null,
          custom.length > 0 ? manager.insert(CustomItem, mapCustom(custom)) : null,
        ]);

        return {
          declaration: savedDeclaration,
          counts: {
            assets: assetsResult?.identifiers.length ?? 0,
            incomes: incomesResult?.identifiers.length ?? 0,
            liabilities: liabilitiesResult?.identifiers.length ?? 0,
            unclassified: unclassifiedResult?.identifiers.length ?? 0,
            custom: customResult?.identifiers.length ?? 0,
          },
        };
      });

      return result;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  /**
   * Mueve (re-cataloga) un ítem entre tablas: asset/income/liability/custom
   * y desde unclassified hacia cualquiera de ellas. Catalogar un concepto
   * no clasificado es un caso particular de este movimiento.
   *
   * Todo ocurre en una sola transacción: inserta en destino y elimina el
   * origen. Si algo falla, no se pierde ni se duplica información.
   */
  async moveFinancialItem(declarationId: string, moveItemDto: MoveItemDto) {
    const { itemId, from, to, customTypeId, subtypeId } = moveItemDto;

    if (from === to && to !== 'custom') {
      throw new BadRequestException('Source and destination must be different');
    }
    if (to === 'custom' && !customTypeId) {
      throw new BadRequestException('customTypeId is required when destination is a custom type');
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        const sourceRepository = manager.getRepository(DeclarationsService.ITEM_ENTITIES[from]);
        // UnclassifiedItem no tiene relación subtype: pedirla hace fallar
        // el findOne y todo move desde sin catalogar responde 400.
        const source = await sourceRepository.findOne({
          where: { id: itemId },
          relations: {
            declaration: true,
            ...(from === 'unclassified' ? {} : { subtype: true }),
            ...(from === 'custom' ? { conceptType: true } : {}),
          },
        });
        if (!source) {
          throw new NotFoundException(`${from} item not found`);
        }
        if (source.declaration?.id !== declarationId) {
          throw new BadRequestException('Item does not belong to this declaration');
        }

        let conceptType: ConceptType | undefined;
        if (to === 'custom') {
          const found = await manager.findOneBy(ConceptType, { id: customTypeId });
          if (!found) {
            throw new NotFoundException('Concept type not found');
          }
          if (!found.isActive) {
            throw new BadRequestException('Cannot move items to an inactive concept type');
          }
          conceptType = found;
        }

        // Subtipo destino: explícito > conservado si compatible > limpio.
        // Ámbitos distintos (o tipos custom distintos) limpian el subtipo.
        const toScope = to === 'custom' ? ItemScope.CUSTOM : (to as unknown as ItemScope);
        const destConceptTypeId = to === 'custom' ? conceptType!.id : undefined;
        let subtype: ConceptSubtype | null = null;
        if (subtypeId) {
          subtype = await this.conceptSubtypesService.resolveForItem(
            manager,
            subtypeId,
            toScope,
            destConceptTypeId,
          );
        } else if (
          source.subtype &&
          source.subtype.scope === toScope &&
          (toScope !== ItemScope.CUSTOM || source.subtype.conceptType?.id === destConceptTypeId)
        ) {
          subtype = source.subtype;
        }
        const subtypeCleared = !!source.subtype && !subtype && !subtypeId;

        const destinationRepository = manager.getRepository(DeclarationsService.ITEM_ENTITIES[to]);
        // Origen any por diseño: se estrecha a unknown para el plegado.
        const unclassifiedSource: {
          sourceDetail?: unknown;
          reporterName?: unknown;
          reporterNit?: unknown;
        } = from === 'unclassified' ? source : {};
        const destination = destinationRepository.create({
          concept: source.concept,
          amount: source.amount,
          source: source.source,
          // Al catalogar un sin clasificar, su reportante DIAN se pliega
          // a source_detail: el destino no tiene columnas reporter.
          sourceDetail:
            from === 'unclassified'
              ? DeclarationsService.foldReporterIntoSourceDetail(
                  unclassifiedSource.sourceDetail,
                  unclassifiedSource.reporterName,
                  unclassifiedSource.reporterNit,
                )
              : (source.sourceDetail ?? undefined),
          subtype: subtype ?? undefined,
          declaration: { id: declarationId } as Declaration,
          ...(to === 'custom' ? { conceptType: { id: conceptType!.id } as ConceptType } : {}),
        });
        const saved = await destinationRepository.save(destination);
        await sourceRepository.delete(itemId);

        return {
          item: {
            ...saved,
            ...(to === 'custom' ? { conceptType } : {}),
          },
          from,
          to,
          subtypeCleared,
        };
      });
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }

  async findAll(findAllDto: FindAllDeclarationsDto) {
    try {
      const { limit = 10, offset = 0, userId } = findAllDto;
      
      const whereCondition: any = {};
      if (userId) {
        whereCondition.user = { id: userId }; // ✅ Solo filtrar, no traer la relación
      }
      
      const [declarations, total] = await this.declarationRepository.findAndCount({
        where: whereCondition,
        take: limit,
        skip: offset
        // ✅ Sin relations: ['user'] - no traemos los datos del usuario
      });
      
      return {
        data: declarations,
        total,
        limit,
        offset
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async findOne(id: string) {
    try {
      const declaration = await this.declarationRepository.findOneBy({ id });
      if (!declaration) {
        throw new NotFoundException('Declaration not found');
      }
      return declaration;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async update(id: string, updateDeclarationDto: UpdateDeclarationDto) {
    try {
      const declaration = await this.findOne(id);
      if (!declaration) {
        throw new NotFoundException('Declaration not found');
      }
      await this.declarationRepository.save({
        ...declaration,
        ...updateDeclarationDto
      });
      return declaration;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async remove(id: string) {
    try {
      const declaration = await this.findOne(id);
      if (!declaration) {
        throw new NotFoundException('Declaration not found');
      }
      await this.declarationRepository.delete(declaration.id);
      return { message: 'Declaration deleted successfully' };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async deleteAll() {
    try {
      await this.declarationRepository.delete({ id: Not(IsNull()) });
      return { message: 'All declarations deleted successfully' };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getStats() {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Total de declaraciones
      const totalDeclarations = await this.declarationRepository.count();
      
      // Total pendientes
      const totalPending = await this.declarationRepository.count({
        where: { status: DeclarationStatus.PENDING }
      });
      
      // Finalizadas el mes actual
      const completedThisMonth = await this.declarationRepository.count({
        where: {
          status: DeclarationStatus.COMPLETED,
          updatedAt: MoreThanOrEqual(startOfMonth)
        }
      });
      
      // Tasa de finalización (completadas / total) en porcentaje
      const completionRate = totalDeclarations > 0 
        ? ((totalDeclarations - totalPending) / totalDeclarations) * 100 
        : 0;
      
      return {
        totalDeclarations,
        totalPending,
        completedThisMonth,
        completionRate: Math.round(completionRate * 100) / 100 // Redondear a 2 decimales
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getRecentActivity(limit: number = 5) {
    try {
      const declarations = await this.declarationRepository.find({
        relations: ['user'],
        order: { updatedAt: 'DESC' },
        take: limit,
        select: {
          id: true,
          taxableYear: true,
          status: true,
          description: true,
          updatedAt: true,
          user: {
            id: true,
            fullName: true,
            documentNumber: true
          }
        }
      });
      
      return declarations.map(declaration => ({
        id: declaration.id,
        taxableYear: declaration.taxableYear,
        status: declaration.status,
        description: declaration.description || `Declaración ${declaration.taxableYear}`,
        updatedAt: declaration.updatedAt,
        user: {
          id: declaration.user?.id,
          fullName: declaration.user?.fullName || 'Usuario desconocido',
          documentNumber: declaration.user?.documentNumber
        }
      }));
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getTaxableYearsByUser(userId: string): Promise<number[]> {
    try {
      if (!userId) {
        throw new BadRequestException('userId is required');
      }
  
      // Verificar que el usuario existe (opcional, pero recomendado)
      const userExists = await this.declarationRepository
        .createQueryBuilder('declaration')
        .where('declaration.user_id = :userId', { userId })
        .getCount();
  
      if (userExists === 0) {
        // Si no tiene declaraciones, retornar array vacío
        return [];
      }
  
      // Obtener años únicos directamente de la BD
      const result = await this.declarationRepository
        .createQueryBuilder('declaration')
        .select('DISTINCT declaration.taxableYear', 'taxableYear')
        .where('declaration.user_id = :userId', { userId })
        .orderBy('declaration.taxableYear', 'DESC')
        .getRawMany();
  
      return result.map(row => row.taxableYear);
    } catch (error) {
      this.logger.error(`Error getting taxable years for user ${userId}: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al obtener los años gravables: ${error.message}`);
    }
  }
}
