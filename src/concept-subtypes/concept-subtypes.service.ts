import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateConceptSubtypeDto } from './dto/create-concept-subtype.dto';
import { UpdateConceptSubtypeDto } from './dto/update-concept-subtype.dto';
import { FindAllConceptSubtypesDto } from './dto/find-all-concept-subtypes.dto';
import { ConceptSubtype } from './entities/concept-subtype.entity';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ItemScope } from 'src/shared/enums/item-scope.enum';
import { ConceptType } from 'src/concept-types/entities/concept-type.entity';
import { Asset } from 'src/assets/entities/asset.entity';
import { Income } from 'src/incomes/entities/income.entity';
import { Liability } from 'src/liabilities/entities/liability.entity';
import { CustomItem } from 'src/custom-items/entities/custom-item.entity';

@Injectable()
export class ConceptSubtypesService {

  private readonly logger = new Logger('ConceptSubtypesService');

  constructor(
    @InjectRepository(ConceptSubtype)
    private readonly subtypeRepository: Repository<ConceptSubtype>,
  ) {}

  /**
   * Valida coherencia scope ↔ conceptTypeId. Centraliza la regla para
   * create + seed (el update no permite cambiarlos).
   */
  private async resolveConceptType(
    manager: EntityManager,
    scope: ItemScope,
    conceptTypeId?: string,
  ): Promise<ConceptType | null> {
    if (scope === ItemScope.CUSTOM) {
      if (!conceptTypeId) {
        throw new BadRequestException('conceptTypeId is required when scope is custom');
      }
      const conceptType = await manager.findOneBy(ConceptType, { id: conceptTypeId });
      if (!conceptType) {
        throw new NotFoundException('Concept type not found');
      }
      return conceptType;
    }
    if (conceptTypeId) {
      throw new BadRequestException('conceptTypeId is only allowed when scope is custom');
    }
    return null;
  }

  /**
   * Resuelve y valida un subtipo para asignarlo a un ítem:
   * existe, activo, mismo ámbito y (si custom) mismo tipo.
   * Reutilizado por los 4 servicios de ítems y por move-item.
   */
  async resolveForItem(
    manager: EntityManager,
    subtypeId: string,
    expectedScope: ItemScope,
    expectedConceptTypeId?: string,
  ): Promise<ConceptSubtype> {
    const subtype = await manager.findOne(ConceptSubtype, {
      where: { id: subtypeId },
      relations: { conceptType: true },
    });
    if (!subtype) {
      throw new NotFoundException('Concept subtype not found');
    }
    if (!subtype.isActive) {
      throw new BadRequestException('Cannot use an inactive concept subtype');
    }
    if (subtype.scope !== expectedScope) {
      throw new BadRequestException(
        `Subtype "${subtype.name}" belongs to ${subtype.scope}, not ${expectedScope}`,
      );
    }
    if (expectedScope === ItemScope.CUSTOM && subtype.conceptType?.id !== expectedConceptTypeId) {
      throw new BadRequestException('Subtype does not belong to this concept type');
    }
    return subtype;
  }

  async create(createDto: CreateConceptSubtypeDto) {
    try {
      return await this.subtypeRepository.manager.transaction(async (manager) => {
        const conceptType = await this.resolveConceptType(manager, createDto.scope, createDto.conceptTypeId);

        // Postgres no bloquea duplicados con concept_type_id NULL (NULLs distintos):
        // chequeo explícito case-insensitive.
        const duplicate = await manager
          .createQueryBuilder(ConceptSubtype, 'subtype')
          .where('subtype.scope = :scope', { scope: createDto.scope })
          .andWhere('LOWER(subtype.name) = LOWER(:name)', { name: createDto.name })
          .andWhere(
            conceptType ? 'subtype.conceptType = :typeId' : 'subtype.conceptType IS NULL',
            conceptType ? { typeId: conceptType.id } : {},
          )
          .getExists();
        if (duplicate) {
          throw new ConflictException('Ya existe un subtipo con ese nombre en este ámbito');
        }

        const subtype = manager.create(ConceptSubtype, {
          name: createDto.name,
          description: createDto.description ?? undefined,
          scope: createDto.scope,
          conceptType: conceptType ?? undefined,
          isActive: createDto.isActive ?? true,
        });
        await manager.save(subtype);
        return subtype;
      });
    } catch (error) {
      this.logger.error(error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      if (error?.code === '23505' || error?.driverError?.code === '23505') {
        throw new ConflictException('Ya existe un subtipo con ese nombre en este ámbito');
      }
      throw new BadRequestException(error);
    }
  }

  async findAll(findAllDto: FindAllConceptSubtypesDto) {
    try {
      const whereCondition: any = {};
      if (findAllDto.scope) {
        whereCondition.scope = findAllDto.scope;
      }
      if (findAllDto.conceptTypeId) {
        whereCondition.conceptType = { id: findAllDto.conceptTypeId };
      }
      if (findAllDto.isActive !== undefined) {
        whereCondition.isActive = findAllDto.isActive;
      }
      return await this.subtypeRepository.find({
        where: whereCondition,
        relations: { conceptType: true },
        order: { name: 'ASC' },
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async findOne(id: string) {
    try {
      const subtype = await this.subtypeRepository.findOne({
        where: { id },
        relations: { conceptType: true },
      });
      if (!subtype) {
        throw new NotFoundException('Concept subtype not found');
      }
      return subtype;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }

  async update(id: string, updateDto: UpdateConceptSubtypeDto) {
    try {
      const subtype = await this.findOne(id);
      if (updateDto.name !== undefined && updateDto.name !== subtype.name) {
        const duplicate = await this.subtypeRepository
          .createQueryBuilder('subtype')
          .where('subtype.scope = :scope', { scope: subtype.scope })
          .andWhere('LOWER(subtype.name) = LOWER(:name)', { name: updateDto.name })
          .andWhere('subtype.id != :id', { id })
          .getExists();
        if (duplicate) {
          throw new ConflictException('Ya existe un subtipo con ese nombre en este ámbito');
        }
        subtype.name = updateDto.name;
      }
      if (updateDto.description !== undefined) {
        subtype.description = updateDto.description;
      }
      if (updateDto.isActive !== undefined) {
        subtype.isActive = updateDto.isActive;
      }
      await this.subtypeRepository.save(subtype);
      return subtype;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }

  async remove(id: string) {
    try {
      const subtype = await this.findOne(id);
      // Bloqueo seguro: contar referencias en las 4 tablas de ítems
      const counts = await Promise.all([
        this.subtypeRepository.manager.countBy(Asset, { subtype: { id } }),
        this.subtypeRepository.manager.countBy(Income, { subtype: { id } }),
        this.subtypeRepository.manager.countBy(Liability, { subtype: { id } }),
        this.subtypeRepository.manager.countBy(CustomItem, { subtype: { id } }),
      ]);
      const total = counts.reduce((sum, count) => sum + count, 0);
      if (total > 0) {
        throw new ConflictException(
          `No se puede eliminar el subtipo porque tiene ${total} registro(s) asociado(s). Re-cataloga esos registros primero.`,
        );
      }
      await this.subtypeRepository.delete(subtype.id);
      return { message: 'Concept subtype deleted successfully' };
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }
}
