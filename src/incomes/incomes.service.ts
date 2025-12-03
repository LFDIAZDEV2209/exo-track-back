import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository, Not, IsNull } from 'typeorm';
import { Income } from './entities/income.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';
import { Declaration } from 'src/declarations/entities/declaration.entity';
import { FindAllByDeclarationDto } from 'src/shared/dtos/find-all-by-declaration.dto';

@Injectable()
export class IncomesService {

  private readonly logger = new Logger('IncomesService');

  constructor(
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>,
  ) {}

  async create(createIncomeDto: CreateIncomeDto) {
    try {
      const income = this.incomeRepository.create({
        ...createIncomeDto,
        declaration: { id: createIncomeDto.declarationId } as Declaration
      });
      await this.incomeRepository.save(income);
      return income;
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
      
      const [incomes, total] = await this.incomeRepository.findAndCount({
        where: whereCondition,
        take: limit,
        skip: offset
      });
      
      return {
        data: incomes,
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
      let income: Income | null = null;
      if (isUUID(term)) {
        income = await this.incomeRepository.findOneBy({ id: term });
      } else {
        income = await this.incomeRepository.findOne({
          where: {
            concept: Like(`%${term}%`)
          }
        });
      }
      if (!income) {
        throw new NotFoundException('Income not found');
      }
      return income;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async update(id: string, updateIncomeDto: UpdateIncomeDto) {
    try {
      const income = await this.findOne(id);
      
      // Solo actualizar concept y amount (no se permite cambiar declarationId)
      if (updateIncomeDto.concept !== undefined) {
        income.concept = updateIncomeDto.concept;
      }
      if (updateIncomeDto.amount !== undefined) {
        income.amount = updateIncomeDto.amount;
      }
      
      // Guardar los cambios en la base de datos
      await this.incomeRepository.save(income);
      
      return income;
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
      const income = await this.findOne(id);
      await this.incomeRepository.delete(income.id);
      return { message: 'Income deleted successfully' };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error.message);
    }
  }

  async deleteAll() {
    try {
      await this.incomeRepository.delete({ id: Not(IsNull()) });
      return { message: 'All incomes deleted successfully' };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
