import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    try {

      const { password, ...userData } = createUserDto;

      const user = await this.usersService.create({
        ...userData, 
        // Solo incluir password si existe, si no, no se incluye en el objeto
        ...(password && { password: bcrypt.hashSync(password, 10) }),
      });
      
      // 🔍 Debug: Verificar que user.id existe
      if (!user.id) {
        this.logger.error('User ID is missing after creation');
        throw new BadRequestException('User creation failed');
      }
      
      this.logger.debug(`User created with ID: ${user.id}`);
      
      return {
        message: 'User created successfully',
        ...user,
        token: this.getJwtToken({ id: user.id }),
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
      
      // 🔍 Debug: Verificar que user.id existe
      if (!user.id) {
        this.logger.error('User ID is missing');
        throw new UnauthorizedException('User ID not found');
      }
      
      this.logger.debug(`User logged in with ID: ${user.id}`);
      
      return {
        message: 'Login successful',
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  private getJwtToken(payload: JwtPayload): string {

     const token = this.jwtService.sign(payload);
     
     return token;

  }
}
