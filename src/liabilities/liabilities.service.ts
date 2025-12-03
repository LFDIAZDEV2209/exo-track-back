import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateLiabilityDto } from './dto/create-liability.dto';
import { UpdateLiabilityDto } from './dto/update-liability.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository, Not, IsNull } from 'typeorm';
import { Liability } from './entities/liability.entity';
import { isUUID } from 'class-validator';
import { Declaration } from 'src/declarations/entities/declaration.entity';
import { FindAllByDeclarationDto } from 'src/shared/dtos/find-all-by-declaration.dto';

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

  async findAll(findAllDto: FindAllByDeclarationDto, declarationId?: string) {
    try {
      const { limit = 10, offset = 0 } = findAllDto;
      
      const whereCondition: any = {};
      if (declarationId || findAllDto.declarationId) {
        whereCondition.declaration = { id: declarationId || findAllDto.declarationId };
      }
      
      const [liabilities, total] = await this.liabilityRepository.findAndCount({
        where: whereCondition,
        take: limit,
        skip: offset
      });
      
      return {
        data: liabilities,
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
      const liability = await this.findOne(id);
      
      // Solo actualizar concept y amount (no se permite cambiar declarationId)
      if (updateLiabilityDto.concept !== undefined) {
        liability.concept = updateLiabilityDto.concept;
      }
      if (updateLiabilityDto.amount !== undefined) {
        liability.amount = updateLiabilityDto.amount;
      }
      
      // Guardar los cambios en la base de datos
      await this.liabilityRepository.save(liability);
      
      return liability;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
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
