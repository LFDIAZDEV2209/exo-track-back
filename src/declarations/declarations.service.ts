import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateDeclarationDto } from './dto/create-declaration.dto';
import { UpdateDeclarationDto } from './dto/update-declaration.dto';
import { Declaration } from './entities/declaration.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class DeclarationsService {

  private readonly logger = new Logger('DeclarationsService');

  constructor(
    @InjectRepository(Declaration)
    private readonly declarationRepository: Repository<Declaration>,
  ) {}

  async create(createDeclarationDto: CreateDeclarationDto) {
    try {
      const declaration = await this.declarationRepository.save(createDeclarationDto);
      return declaration;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async findAll(paginationDto: PaginationDto, userId?: string) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      
      const whereCondition: any = {};
      if (userId) {
        whereCondition.user = { id: userId };
      }
      
      const [declarations, total] = await this.declarationRepository.findAndCount({
        where: whereCondition,
        take: limit,
        skip: offset,
        relations: ['user'] // Opcional: incluir la relación del usuario
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
      await this.declarationRepository.delete({});
      return { message: 'All declarations deleted successfully' };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
