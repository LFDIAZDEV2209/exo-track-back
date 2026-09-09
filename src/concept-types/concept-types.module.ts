import { Module } from '@nestjs/common';
import { ConceptTypesService } from './concept-types.service';
import { ConceptTypesController } from './concept-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConceptType } from './entities/concept-type.entity';
import { CustomItem } from 'src/custom-items/entities/custom-item.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ConceptTypesController],
  providers: [ConceptTypesService],
  imports: [TypeOrmModule.forFeature([ConceptType, CustomItem]), AuthModule],
  exports: [ConceptTypesService, TypeOrmModule],
})
export class ConceptTypesModule {}
