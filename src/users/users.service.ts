import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isEmail, isNumber, isUUID } from 'class-validator';
import { Like } from 'typeorm';

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
      return user;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    
    const { limit = 10, offset = 0 } = paginationDto;
    
    const users = await this.userRepository.find({
      take: limit,
      skip: offset
      // TODO: Relations
    });
    return users;
  }

  async findOne(term: string) {
    try {
      let user: User | null = null;
      
      // 1. Buscar por UUID
      if (isUUID(term)) {
        user = await this.userRepository.findOneBy({ id: term });
      }
      // 2. Buscar por documentNumber (validar si es número)
      else if (!isNaN(Number(term)) && term.trim() !== '') {
        user = await this.userRepository.findOneBy({ documentNumber: parseInt(term, 10) });
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
        queryBuilder.where('user.documentNumber = :term', { term: parseInt(term, 10) });
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
}
