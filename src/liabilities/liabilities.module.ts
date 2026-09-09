import { Module } from '@nestjs/common';
import { LiabilitiesService } from './liabilities.service';
import { LiabilitiesController } from './liabilities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Liability } from './entities/liability.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ConceptSubtypesModule } from 'src/concept-subtypes/concept-subtypes.module';

@Module({
  controllers: [LiabilitiesController],
  providers: [LiabilitiesService],
  imports: [TypeOrmModule.forFeature([Liability]), AuthModule, ConceptSubtypesModule],
  exports: [LiabilitiesService, TypeOrmModule],
})
export class LiabilitiesModule {}
