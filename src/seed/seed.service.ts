import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AssetsService } from 'src/assets/assets.service';
import { LiabilitiesService } from 'src/liabilities/liabilities.service';
import { IncomesService } from 'src/incomes/incomes.service';
import { CustomItemsService } from 'src/custom-items/custom-items.service';
import { UnclassifiedItemsService } from 'src/unclassified-items/unclassified-items.service';
import { Declaration } from 'src/declarations/entities/declaration.entity';
import { initialData } from './data/seed-data';
import { User } from 'src/users/entities/user.entity';
import { DeclarationsService } from 'src/declarations/declarations.service';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { DeclarationStatus } from 'src/declarations/enums/declaration-status.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {

  private readonly logger = new Logger('SeedService');

  constructor(
    private readonly usersService: UsersService,
    private readonly assetsService: AssetsService,
    private readonly liabilitiesService: LiabilitiesService,
    private readonly incomesService: IncomesService,
    private readonly customItemsService: CustomItemsService,
    private readonly unclassifiedItemsService: UnclassifiedItemsService,
    private readonly declarationsService: DeclarationsService,
  ) {}

  async runSeed() {
    this.logger.log('Starting seed execution');
    
    try {
      // 1. Limpiar base de datos
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
      // ✅ Hashear el password si tiene un valor, si no, dejarlo vacío para que @BeforeInsert() lo genere
      const userToCreate = {
        ...userData,
        password: userData.password 
          ? bcrypt.hashSync(userData.password, 10) // Hashear si tiene valor
          : undefined // Dejar undefined si está vacío para que @BeforeInsert() lo genere
      };
      
      const user = await this.usersService.create(userToCreate);
      users.push(user);
      
      // 🔍 Log para debug: mostrar qué password se usó
      if (userData.password) {
        this.logger.debug(`User ${userData.fullName} created with custom password`);
      } else {
        this.logger.debug(`User ${userData.fullName} created with auto-generated password`);
      }
    }
    
    return users;
  }

  private async insertDeclarations(users: User[]): Promise<Declaration[]> {
    const declarations: Declaration[] = [];
    
    // ✅ Filtrar solo usuarios con role USER (excluir ADMIN)
    const userUsers = users.filter(user => user.role === UserRole.USER);
    
    // ✅ Años de 2011 a 2025 (15 años)
    const years = [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
    
    // ✅ Asignar declaraciones de manera ordenada: cada usuario recibe todos los años en orden
    // Usuario 0: 2011, 2012, ..., 2025
    // Usuario 1: 2011, 2012, ..., 2025
    // etc.
    for (let userIndex = 0; userIndex < userUsers.length; userIndex++) {
      const user = userUsers[userIndex];
      
      for (let yearIndex = 0; yearIndex < years.length; yearIndex++) {
        const year = years[yearIndex];
        const status = year === 2025 ? DeclarationStatus.PENDING : DeclarationStatus.COMPLETED;
        
        const declaration = await this.declarationsService.create({
          userId: user.id,
          taxableYear: year,
          status: status,
          description: `Declaración de renta ${year}`
        });
        
        declarations.push(declaration);
      }
    }
    
    return declarations;
  }

  private async insertFinancialData(declarations: Declaration[]): Promise<void> {
    // ✅ Conceptos variados para assets, liabilities e incomes
    const assetConcepts = [
      'Casa de habitación', 'Apartamento', 'Vehículo', 'Terreno', 'Oficina comercial',
      'Local comercial', 'Bodega industrial', 'Inversión en acciones', 'Inversión en fondos',
      'Inversión en bonos', 'Vehículo SUV', 'Vehículo sedán', 'Vehículo pickup',
      'Vehículo deportivo', 'Terreno urbano', 'Terreno rural', 'Casa de campo',
      'Edificio comercial', 'Planta industrial', 'Maquinaria', 'Equipos de oficina'
    ];
    
    const liabilityConcepts = [
      'Préstamo hipotecario', 'Tarjeta de crédito', 'Préstamo vehicular',
      'Préstamo personal', 'Préstamo estudiantil', 'Préstamo comercial',
      'Hipoteca', 'Crédito de consumo', 'Línea de crédito', 'Préstamo empresarial'
    ];
    
    const incomeConcepts = [
      'Salario', 'Arrendamientos', 'Honorarios profesionales', 'Dividendos',
      'Intereses', 'Rentas', 'Comisiones', 'Consultoría', 'Ventas', 'Servicios profesionales'
    ];
    
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalIncomes = 0;
    
    // ✅ Generar datos financieros para cada declaración
    for (const declaration of declarations) {
      // ✅ Generar 25-35 assets por declaración (muchos más datos)
      const numAssets = Math.floor(Math.random() * 11) + 25; // 25-35 assets
      for (let i = 0; i < numAssets; i++) {
        const concept = assetConcepts[Math.floor(Math.random() * assetConcepts.length)];
        // Montos variados según el concepto
        let amount = 0;
        if (concept.includes('Casa') || concept.includes('Apartamento')) {
          amount = Math.floor(Math.random() * 200000000) + 150000000; // 150M - 350M
        } else if (concept.includes('Vehículo')) {
          amount = Math.floor(Math.random() * 50000000) + 30000000; // 30M - 80M
        } else if (concept.includes('Terreno')) {
          amount = Math.floor(Math.random() * 100000000) + 50000000; // 50M - 150M
        } else if (concept.includes('Oficina') || concept.includes('Local') || concept.includes('Bodega')) {
          amount = Math.floor(Math.random() * 300000000) + 150000000; // 150M - 450M
        } else if (concept.includes('Inversión')) {
          amount = Math.floor(Math.random() * 30000000) + 10000000; // 10M - 40M
        } else {
          amount = Math.floor(Math.random() * 100000000) + 20000000; // 20M - 120M
        }
        
        await this.assetsService.create({
          declarationId: declaration.id,
          concept,
          amount
        });
        totalAssets++;
      }
      
      // ✅ Generar 15-25 liabilities por declaración (muchos más datos)
      const numLiabilities = Math.floor(Math.random() * 11) + 15; // 15-25 liabilities
      for (let i = 0; i < numLiabilities; i++) {
        const concept = liabilityConcepts[Math.floor(Math.random() * liabilityConcepts.length)];
        // Montos variados según el concepto
        let amount = 0;
        if (concept.includes('hipotecario') || concept.includes('Hipoteca')) {
          amount = Math.floor(Math.random() * 50000000) + 100000000; // 100M - 150M
        } else if (concept.includes('vehicular')) {
          amount = Math.floor(Math.random() * 20000000) + 25000000; // 25M - 45M
        } else if (concept.includes('Tarjeta')) {
          amount = Math.floor(Math.random() * 15000000) + 5000000; // 5M - 20M
        } else if (concept.includes('personal') || concept.includes('estudiantil')) {
          amount = Math.floor(Math.random() * 10000000) + 5000000; // 5M - 15M
        } else {
          amount = Math.floor(Math.random() * 30000000) + 10000000; // 10M - 40M
        }
        
        await this.liabilitiesService.create({
          declarationId: declaration.id,
          concept,
          amount
        });
        totalLiabilities++;
      }
      
      // ✅ Generar 10-20 incomes por declaración (muchos más datos)
      const numIncomes = Math.floor(Math.random() * 11) + 10; // 10-20 incomes
      for (let i = 0; i < numIncomes; i++) {
        const concept = incomeConcepts[Math.floor(Math.random() * incomeConcepts.length)];
        // Montos variados según el concepto
        let amount = 0;
        if (concept === 'Salario') {
          amount = Math.floor(Math.random() * 30000000) + 40000000; // 40M - 70M
        } else if (concept === 'Arrendamientos') {
          amount = Math.floor(Math.random() * 20000000) + 20000000; // 20M - 40M
        } else if (concept.includes('Honorarios') || concept.includes('Consultoría') || concept.includes('Servicios')) {
          amount = Math.floor(Math.random() * 25000000) + 15000000; // 15M - 40M
        } else if (concept === 'Dividendos' || concept === 'Intereses') {
          amount = Math.floor(Math.random() * 15000000) + 10000000; // 10M - 25M
        } else {
          amount = Math.floor(Math.random() * 20000000) + 10000000; // 10M - 30M
        }
        
        await this.incomesService.create({
          declarationId: declaration.id,
          concept,
          amount
        });
        totalIncomes++;
      }
    }
    
    this.logger.log(`Generated ${totalAssets} assets, ${totalLiabilities} liabilities, and ${totalIncomes} incomes`);
  }

  // Método para limpiar la base de datos antes de insertar
  // IMPORTANTE: El orden es crucial debido a las foreign keys
  async cleanDatabase(): Promise<void> {
    this.logger.log('Cleaning database...');
    
    // Eliminar en orden inverso a las dependencias (primero las tablas dependientes).
    // Los tipos de concepto se preservan: son configuración del administrador.
    await this.assetsService.deleteAll();
    await this.liabilitiesService.deleteAll();
    await this.incomesService.deleteAll();
    await this.customItemsService.deleteAll();
    await this.unclassifiedItemsService.deleteAll();
    await this.declarationsService.deleteAll();
    await this.usersService.deleteAll();
    
    this.logger.log('Database cleaned successfully');
  }
}
