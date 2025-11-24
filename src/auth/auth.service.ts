import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {

  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly usersService: UsersService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    try {

      const { password, ...userData } = createUserDto;

      const user = await this.usersService.create({
        ...userData, 
        // Solo incluir password si existe, si no, no se incluye en el objeto
        ...(password && { password: bcrypt.hashSync(password, 10) }),
      });
      return {
        message: 'User created successfully',
        user,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const { documentNumber, password } = loginUserDto;
      const user = await this.usersService.findByDocumentNumber(documentNumber);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials document number');
      }
      const isPasswordValid = await bcrypt.compare(password as string, user.password as string);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials password');
      }
      return {
        message: 'Login successful',
        user,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
