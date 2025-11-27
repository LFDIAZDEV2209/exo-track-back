import { Module } from '@nestjs/common';
import { IncomesService } from './incomes.service';
import { IncomesController } from './incomes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Income } from './entities/income.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [IncomesController],
  providers: [IncomesService],
  imports: [TypeOrmModule.forFeature([Income]), AuthModule],
  exports: [IncomesService, TypeOrmModule],
})
export class IncomesModule {}
