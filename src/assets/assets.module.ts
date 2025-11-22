import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { Asset } from './entities/asset.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [AssetsController],
  providers: [AssetsService],
  imports: [TypeOrmModule.forFeature([Asset])],
})
export class AssetsModule {}
