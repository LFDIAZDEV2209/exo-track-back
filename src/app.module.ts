import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { DeclarationsModule } from './declarations/declarations.module';
import { AssetsModule } from './assets/assets.module';
import { LiabilitiesModule } from './liabilities/liabilities.module';
import { IncomesModule } from './incomes/incomes.module';
import { ConceptTypesModule } from './concept-types/concept-types.module';
import { CustomItemsModule } from './custom-items/custom-items.module';
import { UnclassifiedItemsModule } from './unclassified-items/unclassified-items.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
      ssl: process.env.DB_SSL === 'true'
    }),

    UsersModule,

    DeclarationsModule,

    AssetsModule,

    LiabilitiesModule,

    IncomesModule,

    ConceptTypesModule,

    CustomItemsModule,

    UnclassifiedItemsModule,

    CommonModule,

    SeedModule,

    AuthModule

  ],
})
export class AppModule {}
