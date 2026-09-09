import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { isUUID } from 'class-validator';
import { UnclassifiedItem } from './entities/unclassified-item.entity';
import { FindAllByDeclarationDto } from 'src/shared/dtos/find-all-by-declaration.dto';

@Injectable()
export class UnclassifiedItemsService {

  private readonly logger = new Logger('UnclassifiedItemsService');

  constructor(
    @InjectRepository(UnclassifiedItem)
    private readonly unclassifiedItemRepository: Repository<UnclassifiedItem>,
  ) {}

  async findAll(findAllDto: FindAllByDeclarationDto, declarationId?: string) {
    try {
      const { limit = 10, offset = 0 } = findAllDto;

      const whereCondition: any = {};
      if (declarationId || findAllDto.declarationId) {
        whereCondition.declaration = { id: declarationId || findAllDto.declarationId };
      }

      const [items, total] = await this.unclassifiedItemRepository.findAndCount({
        where: whereCondition,
        order: { createdAt: 'ASC' },
        take: limit,
        skip: offset
      });

      return {
        data: items,
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
      let item: UnclassifiedItem | null = null;
      if (isUUID(id)) {
        item = await this.unclassifiedItemRepository.findOneBy({ id });
      }
      if (!item) {
        throw new NotFoundException('Unclassified item not found');
      }
      return item;
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
      const item = await this.findOne(id);
      await this.unclassifiedItemRepository.delete(item.id);
      return { message: 'Unclassified item deleted successfully' };
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }

  async deleteAll() {
    try {
      await this.unclassifiedItemRepository.delete({ id: Not(IsNull()) });
      return { message: 'All unclassified items deleted successfully' };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
