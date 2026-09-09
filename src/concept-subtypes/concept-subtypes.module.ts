import { Module } from '@nestjs/common';
import { ConceptSubtypesService } from './concept-subtypes.service';
import { ConceptSubtypesController } from './concept-subtypes.controller';
import { CatalogSeedService } from './catalog-seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConceptSubtype } from './entities/concept-subtype.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ConceptSubtypesController],
  providers: [ConceptSubtypesService, CatalogSeedService],
  imports: [TypeOrmModule.forFeature([ConceptSubtype]), AuthModule],
  exports: [ConceptSubtypesService, TypeOrmModule],
})
export class ConceptSubtypesModule {}
