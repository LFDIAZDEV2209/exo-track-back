import { Module } from '@nestjs/common';
import { CustomItemsService } from './custom-items.service';
import { CustomItemsController } from './custom-items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomItem } from './entities/custom-item.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [CustomItemsController],
  providers: [CustomItemsService],
  imports: [TypeOrmModule.forFeature([CustomItem]), AuthModule],
  exports: [CustomItemsService, TypeOrmModule],
})
export class CustomItemsModule {}
