import { Module } from '@nestjs/common';
import { DeclarationsService } from './declarations.service';
import { DeclarationsController } from './declarations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Declaration } from './entities/declaration.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ConceptSubtypesModule } from 'src/concept-subtypes/concept-subtypes.module';

@Module({
  controllers: [DeclarationsController],
  providers: [DeclarationsService],
  imports: [TypeOrmModule.forFeature([Declaration]), AuthModule, ConceptSubtypesModule],
  exports: [DeclarationsService, TypeOrmModule],
})
export class DeclarationsModule {}
