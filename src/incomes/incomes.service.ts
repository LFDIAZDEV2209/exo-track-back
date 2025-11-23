import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Income } from './entities/income.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class IncomesService {

  private readonly logger = new Logger('IncomesService');

  constructor(
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>,
  ) {}

  async create(createIncomeDto: CreateIncomeDto) {
    try {
      const income = this.incomeRepository.create(createIncomeDto);
      await this.incomeRepository.save(income);
      return income;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      const incomes = await this.incomeRepository.find({
        take: limit,
        skip: offset
      });
      return incomes;
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
      const income = await this.incomeRepository.preload({
        id,
        ...updateIncomeDto
      });
      if (!income) {
        throw new NotFoundException('Income not found');
      }
      return income;
    } catch (error) {
      this.logger.error(error);
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
}
