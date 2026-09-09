import { Module } from '@nestjs/common';
import { UnclassifiedItemsService } from './unclassified-items.service';
import { UnclassifiedItemsController } from './unclassified-items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnclassifiedItem } from './entities/unclassified-item.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [UnclassifiedItemsController],
  providers: [UnclassifiedItemsService],
  imports: [TypeOrmModule.forFeature([UnclassifiedItem]), AuthModule],
  exports: [UnclassifiedItemsService, TypeOrmModule],
})
export class UnclassifiedItemsModule {}
