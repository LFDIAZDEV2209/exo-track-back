import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { UsersModule } from 'src/users/users.module';
import { DeclarationsModule } from 'src/declarations/declarations.module';
import { AssetsModule } from 'src/assets/assets.module';
import { LiabilitiesModule } from 'src/liabilities/liabilities.module';
import { IncomesModule } from 'src/incomes/incomes.module';
import { CustomItemsModule } from 'src/custom-items/custom-items.module';
import { UnclassifiedItemsModule } from 'src/unclassified-items/unclassified-items.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    UsersModule,
    DeclarationsModule,
    AssetsModule,
    LiabilitiesModule,
    IncomesModule,
    CustomItemsModule,
    UnclassifiedItemsModule,
    AuthModule
 ]
})
export class SeedModule {}
