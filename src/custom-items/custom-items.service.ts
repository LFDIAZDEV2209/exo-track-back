import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateCustomItemDto } from './dto/create-custom-item.dto';
import { UpdateCustomItemDto } from './dto/update-custom-item.dto';
import { FindAllCustomItemsDto } from './dto/find-all-custom-items.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { isUUID } from 'class-validator';
import { CustomItem } from './entities/custom-item.entity';
import { Declaration } from 'src/declarations/entities/declaration.entity';
import { ConceptType } from 'src/concept-types/entities/concept-type.entity';
import { ConceptSubtypesService } from 'src/concept-subtypes/concept-subtypes.service';
import { ItemScope } from 'src/shared/enums/item-scope.enum';

@Injectable()
export class CustomItemsService {

  private readonly logger = new Logger('CustomItemsService');

  constructor(
    @InjectRepository(CustomItem)
    private readonly customItemRepository: Repository<CustomItem>,
    private readonly conceptSubtypesService: ConceptSubtypesService,
  ) {}

  async create(createCustomItemDto: CreateCustomItemDto) {
    try {
      const conceptType = await this.customItemRepository.manager.findOneBy(ConceptType, {
        id: createCustomItemDto.conceptTypeId,
      });
      if (!conceptType) {
        throw new NotFoundException('Concept type not found');
      }
      if (!conceptType.isActive) {
        throw new BadRequestException('Cannot add items to an inactive concept type');
      }
      const item = this.customItemRepository.create({
        concept: createCustomItemDto.concept,
        amount: createCustomItemDto.amount,
        declaration: { id: createCustomItemDto.declarationId } as Declaration,
        conceptType: { id: createCustomItemDto.conceptTypeId } as ConceptType,
      });
      if (createCustomItemDto.subtypeId) {
        item.subtype = await this.conceptSubtypesService.resolveForItem(
          this.customItemRepository.manager,
          createCustomItemDto.subtypeId,
          ItemScope.CUSTOM,
          createCustomItemDto.conceptTypeId,
        );
      }
      await this.customItemRepository.save(item);
      return item;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }

  async findAll(findAllDto: FindAllCustomItemsDto, declarationId?: string) {
    try {
      const { limit = 10, offset = 0, conceptTypeId } = findAllDto;

      const whereCondition: any = {};
      if (declarationId || findAllDto.declarationId) {
        whereCondition.declaration = { id: declarationId || findAllDto.declarationId };
      }
      if (conceptTypeId) {
        whereCondition.conceptType = { id: conceptTypeId };
      }

      const [items, total] = await this.customItemRepository.findAndCount({
        where: whereCondition,
        relations: { conceptType: true, subtype: true },
        take: limit,
        skip: offset,
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
      let item: CustomItem | null = null;
      if (isUUID(id)) {
        item = await this.customItemRepository.findOne({
          where: { id },
          relations: { conceptType: true },
        });
      }
      if (!item) {
        throw new NotFoundException('Custom item not found');
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

  async update(id: string, updateCustomItemDto: UpdateCustomItemDto) {
    try {
      const item = await this.findOne(id);

      if (updateCustomItemDto.conceptTypeId !== undefined) {
        const conceptType = await this.customItemRepository.manager.findOneBy(ConceptType, {
          id: updateCustomItemDto.conceptTypeId,
        });
        if (!conceptType) {
          throw new NotFoundException('Concept type not found');
        }
        if (!conceptType.isActive) {
          throw new BadRequestException('Cannot move items to an inactive concept type');
        }
        item.conceptType = conceptType;
      }
      // Solo actualizar concept y amount (no se permite cambiar declarationId)
      if (updateCustomItemDto.concept !== undefined) {
        item.concept = updateCustomItemDto.concept;
      }
      if (updateCustomItemDto.amount !== undefined) {
        item.amount = updateCustomItemDto.amount;
      }
      // subtypeId: uuid reasigna (contra el tipo vigente), null lo quita, ausente no toca
      if (updateCustomItemDto.subtypeId !== undefined) {
        item.subtype = updateCustomItemDto.subtypeId
          ? await this.conceptSubtypesService.resolveForItem(
              this.customItemRepository.manager,
              updateCustomItemDto.subtypeId,
              ItemScope.CUSTOM,
              item.conceptType?.id,
            )
          : null;
      }

      await this.customItemRepository.save(item);

      return item;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }

  async remove(id: string) {
    try {
      const item = await this.findOne(id);
      await this.customItemRepository.delete(item.id);
      return { message: 'Custom item deleted successfully' };
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
      await this.customItemRepository.delete({ id: Not(IsNull()) });
      return { message: 'All custom items deleted successfully' };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
