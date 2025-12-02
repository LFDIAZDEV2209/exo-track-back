import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isEmail, isNumber, isUUID } from 'class-validator';
import { Like } from 'typeorm';
import { Not, IsNull } from 'typeorm';
import { UserRole } from 'src/shared/enums/user-role.enum'

@Injectable()
export class UsersService {

  private readonly logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {

    try {
      const user = this.userRepository.create(createUserDto);
      await this.userRepository.save(user);
      // Eliminar el password del usuario antes de retornarlo
      delete (user as any).password;
      return user;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      
      // ✅ Obtener usuarios con role USER y contar sus declaraciones
      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.declarations', 'declaration')
        .select([
          'user.id',
          'user.documentNumber',  // ✅ Usar el nombre de la propiedad (TypeORM lo mapea)
          'user.fullName',
          'user.email',
          'user.phoneNumber',
          'user.createdAt'
        ])
        .addSelect('COUNT(declaration.id)', 'totalDeclarations')
        .where('user.role = :role', { role: UserRole.USER })
        .groupBy('user.id')
        .addGroupBy('user.documentNumber')
        .addGroupBy('user.fullName')
        .addGroupBy('user.email')
        .addGroupBy('user.phoneNumber')
        .addGroupBy('user.createdAt');
      
      // ✅ Obtener total correcto (contar usuarios únicos, no grupos)
      const totalQuery = this.userRepository
        .createQueryBuilder('user')
        .where('user.role = :role', { role: UserRole.USER });
      const total = await totalQuery.getCount();
      
      // Aplicar paginación
      const users = await queryBuilder
        .take(limit)
        .skip(offset)
        .getRawMany();
      
      // ✅ Formatear la respuesta - getRawMany() devuelve: user_id, user_document_number, user_full_name, etc.
      const formattedUsers = users.map((user) => ({
        id: user.user_id,
        documentNumber: user.user_document_number,  // ✅ snake_case de la BD
        fullName: user.user_full_name,
        email: user.user_email,
        phoneNumber: user.user_phone_number,
        totalDeclarations: parseInt(user.totalDeclarations) || 0,
        createdAt: user.user_created_at || new Date()
      }));
      
      return {
        data: formattedUsers,
        total,
        limit,
        offset
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async findOne(term: string) {
    try {
      let user: User | null = null;
      
      // 1. Buscar por UUID
      if (isUUID(term)) {
        user = await this.userRepository.findOneBy({ id: term });
      }
      // 2. Buscar por documentNumber
      else if (term.trim() !== '') {
        user = await this.userRepository.findOneBy({ documentNumber: term });
      }
      // 3. Buscar por email
      else if (isEmail(term)) {
        user = await this.userRepository.findOneBy({ email: term });
      }
      // 4. Buscar por fullName (búsqueda parcial con LIKE)
      else {
        user = await this.userRepository.findOne({
          where: {
            fullName: Like(`%${term}%`)
          }
        });
      }
      
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.preload({
        id: id,
        ...updateUserDto
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async remove(id: string) {
    try {
      const user = await this.findOne(id);
      await this.userRepository.delete(user.id);
      return { message: 'User deleted successfully' };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async search(term: string, paginationDto?: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto || {};
      
      const queryBuilder = this.userRepository.createQueryBuilder('user');
      
      if (isUUID(term)) {
        queryBuilder.where('user.id = :term', { term });
      } else if (!isNaN(Number(term)) && term.trim() !== '') {
        queryBuilder.where('user.documentNumber = :term', { term });
      } else if (isEmail(term)) {
        queryBuilder.where('user.email = :term', { term });
      } else {
        queryBuilder.where('user.fullName LIKE :term', { term: `%${term}%` });
      }
      
      const [users, total] = await queryBuilder
        .take(limit)
        .skip(offset)
        .getManyAndCount();
      
      return {
        data: users,
        total,
        limit,
        offset
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async deleteAll() {
    try {
      await this.userRepository.delete({ id: Not(IsNull()) });
      return { message: 'All users deleted successfully' };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async findByDocumentNumber(documentNumber: string) {
    return this.userRepository.findOne({
      where: { documentNumber },
      select: { id: true, fullName: true, documentNumber: true, password: true }
    });
  }

  async getStats() {
    try {
      // Total de users con role USER
      const totalUsers = await this.userRepository.count({
        where: { role: UserRole.USER }
      });
      
      // Total de users activos con role USER
      const totalActiveUsers = await this.userRepository.count({
        where: { 
          role: UserRole.USER,
          isActive: true 
        }
      });
      
      // Promedio de declaraciones por cliente
      const usersWithDeclarations = await this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.declarations', 'declaration')
        .where('user.role = :role', { role: UserRole.USER })
        .select('user.id', 'userId')
        .addSelect('COUNT(declaration.id)', 'declarationCount')
        .groupBy('user.id')
        .getRawMany();
      
      const totalDeclarations = usersWithDeclarations.reduce(
        (sum, user) => sum + parseInt(user.declarationCount || '0'), 
        0
      );
      
      const averageDeclarationsPerUser = totalUsers > 0 
        ? totalDeclarations / totalUsers 
        : 0;
      
      return {
        totalUsers,
        totalActiveUsers,
        averageDeclarationsPerUser: Math.round(averageDeclarationsPerUser * 100) / 100 // Redondear a 2 decimales
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
