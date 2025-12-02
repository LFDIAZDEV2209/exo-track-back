import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateLiabilityDto } from './dto/create-liability.dto';
import { UpdateLiabilityDto } from './dto/update-liability.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository, Not, IsNull } from 'typeorm';
import { Liability } from './entities/liability.entity';
import { isUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Declaration } from 'src/declarations/entities/declaration.entity';

@Injectable()
export class LiabilitiesService {

  private readonly logger = new Logger('LiabilitiesService');

  constructor(
    @InjectRepository(Liability)
    private readonly liabilityRepository: Repository<Liability>,
  ) {}

  async create(createLiabilityDto: CreateLiabilityDto) {
    try {
      const liability = this.liabilityRepository.create({
        ...createLiabilityDto,
        declaration: { id: createLiabilityDto.declarationId } as Declaration
      });
      await this.liabilityRepository.save(liability);
      return liability;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async findAll(paginationDto: PaginationDto, declarationId?: string) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      
      const whereCondition: any = {};
      if (declarationId) {
        whereCondition.declaration = { id: declarationId };
      }
      
      const [declarations, total] = await this.liabilityRepository.findAndCount({
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

  async findOne(term: string) {
    try {
      let liability: Liability | null = null;
      if (isUUID(term)) {
        liability = await this.liabilityRepository.findOneBy({ id: term });
      } else {
        liability = await this.liabilityRepository.findOne({
          where: {
            concept: Like(`%${term}%`)
          }
        });
      }
      if (!liability) {
        throw new NotFoundException('Liability not found');
      }
      return liability;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async update(id: string, updateLiabilityDto: UpdateLiabilityDto) {
    try {
      const liability = await this.liabilityRepository.preload({
        id,
        ...updateLiabilityDto
      });
      if (!liability) {
        throw new NotFoundException('Liability not found');
      }
      await this.liabilityRepository.save(liability);
      return liability;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async remove(id: string) {
    try {
      const liability = await this.findOne(id);
      await this.liabilityRepository.delete(liability.id);
      return { message: 'Liability deleted successfully' };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error.message);
    }
  }

  async deleteAll() {
    try {
      await this.liabilityRepository.delete({ id: Not(IsNull()) });
      return { message: 'All liabilities deleted successfully' };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
