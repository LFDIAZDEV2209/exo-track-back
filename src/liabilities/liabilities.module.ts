import { Module } from '@nestjs/common';
import { LiabilitiesService } from './liabilities.service';
import { LiabilitiesController } from './liabilities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Liability } from './entities/liability.entity';

@Module({
  controllers: [LiabilitiesController],
  providers: [LiabilitiesService],
  imports: [TypeOrmModule.forFeature([Liability])],
  exports: [LiabilitiesService, TypeOrmModule],
})
export class LiabilitiesModule {}
