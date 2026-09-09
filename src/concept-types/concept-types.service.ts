import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateConceptTypeDto } from './dto/create-concept-type.dto';
import { UpdateConceptTypeDto } from './dto/update-concept-type.dto';
import { ConceptType } from './entities/concept-type.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomItem } from 'src/custom-items/entities/custom-item.entity';

@Injectable()
export class ConceptTypesService {

  private readonly logger = new Logger('ConceptTypesService');

  constructor(
    @InjectRepository(ConceptType)
    private readonly conceptTypeRepository: Repository<ConceptType>,
    @InjectRepository(CustomItem)
    private readonly customItemRepository: Repository<CustomItem>,
  ) {}

  async create(createConceptTypeDto: CreateConceptTypeDto) {
    try {
      const conceptType = this.conceptTypeRepository.create({
        ...createConceptTypeDto,
        // Los tipos creados por API siempre son personalizados
        isSystem: false,
      });
      await this.conceptTypeRepository.save(conceptType);
      return conceptType;
    } catch (error) {
      this.logger.error(error);
      // Nombre duplicado (unique constraint)
      if (error?.code === '23505' || error?.driverError?.code === '23505') {
        throw new ConflictException('Ya existe un tipo de concepto con ese nombre');
      }
      throw new BadRequestException(error);
    }
  }

  async findAll() {
    try {
      return await this.conceptTypeRepository.find({
        order: { name: 'ASC' },
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async findOne(id: string) {
    try {
      const conceptType = await this.conceptTypeRepository.findOneBy({ id });
      if (!conceptType) {
        throw new NotFoundException('Concept type not found');
      }
      return conceptType;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }

  async update(id: string, updateConceptTypeDto: UpdateConceptTypeDto) {
    try {
      const conceptType = await this.findOne(id);
      if (updateConceptTypeDto.name !== undefined) {
        conceptType.name = updateConceptTypeDto.name;
      }
      if (updateConceptTypeDto.description !== undefined) {
        conceptType.description = updateConceptTypeDto.description;
      }
      if (updateConceptTypeDto.isActive !== undefined) {
        conceptType.isActive = updateConceptTypeDto.isActive;
      }
      await this.conceptTypeRepository.save(conceptType);
      return conceptType;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error?.code === '23505' || error?.driverError?.code === '23505') {
        throw new ConflictException('Ya existe un tipo de concepto con ese nombre');
      }
      throw new BadRequestException(error);
    }
  }

  async remove(id: string) {
    try {
      const conceptType = await this.findOne(id);
      // Bloqueo seguro: no eliminar tipos con ítems asociados
      const itemsCount = await this.customItemRepository.count({
        where: { conceptType: { id } },
      });
      if (itemsCount > 0) {
        throw new ConflictException(
          `No se puede eliminar el tipo porque tiene ${itemsCount} registro(s) asociado(s). Re-cataloga o elimina esos registros primero.`,
        );
      }
      await this.conceptTypeRepository.delete(conceptType.id);
      return { message: 'Concept type deleted successfully' };
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }
}
