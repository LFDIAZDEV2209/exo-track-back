import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { Asset } from './entities/asset.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConceptSubtypesModule } from 'src/concept-subtypes/concept-subtypes.module';

@Module({
  controllers: [AssetsController],
  providers: [AssetsService],
  imports: [TypeOrmModule.forFeature([Asset]), ConceptSubtypesModule],
  exports: [AssetsService, TypeOrmModule],
})
export class AssetsModule {}
