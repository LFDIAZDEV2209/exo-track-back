import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AssetsService } from 'src/assets/assets.service';
import { LiabilitiesService } from 'src/liabilities/liabilities.service';
import { IncomesService } from 'src/incomes/incomes.service';
import { Declaration } from 'src/declarations/entities/declaration.entity';
import { initialData } from './data/seed-data';
import { User } from 'src/users/entities/user.entity';
import { DeclarationsService } from 'src/declarations/declarations.service';

@Injectable()
export class SeedService {

  private readonly logger = new Logger('SeedService');

  constructor(
    private readonly usersService: UsersService,
    private readonly assetsService: AssetsService,
    private readonly liabilitiesService: LiabilitiesService,
    private readonly incomesService: IncomesService,
    private readonly declarationsService: DeclarationsService,
  ) {}

  async runSeed() {
    this.logger.log('Starting seed execution');
    
    try {
      // 1. Limpiar base de datos (opcional - descomentar si quieres limpiar antes de insertar)
      await this.cleanDatabase();

      // 2. Insertar usuarios
      this.logger.log('Inserting users...');
      const users = await this.insertUsers();
      this.logger.log(`${users.length} users inserted`);

      // 3. Insertar declaraciones usando los userId generados
      this.logger.log('Inserting declarations...');
      const declarations = await this.insertDeclarations(users);
      this.logger.log(`${declarations.length} declarations inserted`);

      // 4. Insertar assets, liabilities e incomes usando los declarationId generados
      this.logger.log('Inserting assets, liabilities and incomes...');
      await this.insertFinancialData(declarations);
      this.logger.log('Financial data inserted');

      this.logger.log('Seed execution completed successfully');
      return {
        message: 'Seed executed successfully',
        users: users.length,
        declarations: declarations.length
      };
    } catch (error) {
      this.logger.error('Error during seed execution', error);
      throw error;
    }
  }

  private async insertUsers(): Promise<User[]> {
    const users: User[] = [];
    
    for (const userData of initialData.users) {
      const user = await this.usersService.create(userData);
      users.push(user);
    }
    
    return users;
  }

  private async insertDeclarations(users: User[]): Promise<Declaration[]> {
    const declarations: Declaration[] = [];
    const declarationsData = initialData.declarations;
    
    // Asignar usuarios a declaraciones (distribuir entre los usuarios)
    for (let i = 0; i < declarationsData.length; i++) {
      const declarationData = declarationsData[i];
      const userIndex = i % users.length; // Distribuir declaraciones entre usuarios
      const userId = users[userIndex].id;
      
      // TypeORM acepta la relación directamente con { id: userId }
      const declaration = await this.declarationsService.create({
        user: { id: userId } as User,
        taxableYear: declarationData.taxableYear,
        status: declarationData.status,
        description: declarationData.description
      } as any);
      
      declarations.push(declaration);
    }
    
    return declarations;
  }

  private async insertFinancialData(declarations: Declaration[]): Promise<void> {
    const assetsData = initialData.assets;
    const liabilitiesData = initialData.liabilities;
    const incomesData = initialData.incomes;
    
    // Insertar assets
    for (let i = 0; i < assetsData.length; i++) {
      const assetData = assetsData[i];
      const declarationIndex = i % declarations.length;
      const declarationId = declarations[declarationIndex].id;
      
      await this.assetsService.create({
        ...assetData,
        declarationId
      });
    }
    
    // Insertar liabilities
    for (let i = 0; i < liabilitiesData.length; i++) {
      const liabilityData = liabilitiesData[i];
      const declarationIndex = i % declarations.length;
      const declarationId = declarations[declarationIndex].id;
      
      await this.liabilitiesService.create({
        ...liabilityData,
        declarationId
      });
    }
    
    // Insertar incomes
    for (let i = 0; i < incomesData.length; i++) {
      const incomeData = incomesData[i];
      const declarationIndex = i % declarations.length;
      const declarationId = declarations[declarationIndex].id;
      
      await this.incomesService.create({
        ...incomeData,
        declarationId
      });
    }
  }

  // Método opcional para limpiar la base de datos antes de insertar
  // IMPORTANTE: El orden es crucial debido a las foreign keys
  private async cleanDatabase(): Promise<void> {
    this.logger.log('Cleaning database...');
    
    // Eliminar en orden inverso a las dependencias (primero las tablas dependientes)
    await this.assetsService.deleteAll();
    await this.liabilitiesService.deleteAll();
    await this.incomesService.deleteAll();
    await this.declarationsService.deleteAll();
    await this.usersService.deleteAll();
    
    this.logger.log('Database cleaned successfully');
  }
}
