import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository, Not, IsNull } from 'typeorm';
import { Asset } from './entities/asset.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';
import { Declaration } from 'src/declarations/entities/declaration.entity';
import { FindAllByDeclarationDto } from 'src/shared/dtos/find-all-by-declaration.dto';

@Injectable()
export class AssetsService {

  private readonly logger = new Logger('AssetsService');

  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
  ) {}

  async create(createAssetDto: CreateAssetDto) {
    try {
      const asset = this.assetRepository.create({
        ...createAssetDto,
        declaration: { id: createAssetDto.declarationId } as Declaration
      });
      await this.assetRepository.save(asset);
      return asset;
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
      
      const [assets, total] = await this.assetRepository.findAndCount({
        where: whereCondition,
        take: limit,
        skip: offset
      });
      
      return {
        data: assets,
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
      let asset: Asset | null = null;
      if (isUUID(term)) {
        asset = await this.assetRepository.findOneBy({ id: term });
      } else {
        asset = await this.assetRepository.findOne({
          where: {
            concept: Like(`%${term}%`)
          }
        });
      }
      if (!asset) {
        throw new NotFoundException('Asset not found');
      }
    return asset;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async update(id: string, updateAssetDto: UpdateAssetDto) {
    try {
      const asset = await this.findOne(id);
      
      // Solo actualizar concept y amount (no se permite cambiar declarationId)
      if (updateAssetDto.concept !== undefined) {
        asset.concept = updateAssetDto.concept;
      }
      if (updateAssetDto.amount !== undefined) {
        asset.amount = updateAssetDto.amount;
      }
      
      // Guardar los cambios en la base de datos
      await this.assetRepository.save(asset);
      
      return asset;
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
      const asset = await this.findOne(id);
      await this.assetRepository.delete(asset.id);
      return { message: 'Asset deleted successfully' };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async deleteAll() {
    try {
      await this.assetRepository.delete({ id: Not(IsNull()) });
      return { message: 'All assets deleted successfully' };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
