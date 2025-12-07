import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateDeclarationDto } from './dto/create-declaration.dto';
import { UpdateDeclarationDto } from './dto/update-declaration.dto';
import { Declaration } from './entities/declaration.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Not, IsNull, MoreThanOrEqual } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { FindAllDeclarationsDto } from './dto/find-all-declarations.dto';
import { DeclarationStatus } from './enums/declaration-status.enum';

@Injectable()
export class DeclarationsService {

  private readonly logger = new Logger('DeclarationsService');

  constructor(
    @InjectRepository(Declaration)
    private readonly declarationRepository: Repository<Declaration>,
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
