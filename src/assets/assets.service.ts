import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Asset } from './entities/asset.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class AssetsService {

  private readonly logger = new Logger('AssetsService');

  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
  ) {}

  async create(createAssetDto: CreateAssetDto) {
    try {
      const asset = this.assetRepository.create(createAssetDto);
      await this.assetRepository.save(asset);
      return asset;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      const assets = await this.assetRepository.find({
        take: limit,
        skip: offset
      });
      return assets;
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
      const asset = await this.assetRepository.preload({
        id,
        ...updateAssetDto
      });
      if (!asset) {
        throw new NotFoundException('Asset not found');
      }
      return asset;
    } catch (error) {
      this.logger.error(error);
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
}
