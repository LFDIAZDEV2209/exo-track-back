import { Module } from '@nestjs/common';
import { DeclarationsService } from './declarations.service';
import { DeclarationsController } from './declarations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Declaration } from './entities/declaration.entity';

@Module({
  controllers: [DeclarationsController],
  providers: [DeclarationsService],
  imports: [TypeOrmModule.forFeature([Declaration])],
  exports: [DeclarationsService, TypeOrmModule],
})
export class DeclarationsModule {}
