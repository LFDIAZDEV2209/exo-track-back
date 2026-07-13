import { Controller, Post, Body, Get, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { Auth } from './decorators/auth.decorator';
import { User } from 'src/users/entities/user.entity';
import { GetUser } from './decorators/get-user.decorator';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  // @Auth(UserRole.ADMIN)
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginUserDto);
    res.cookie('auth_token', result.token, COOKIE_OPTIONS);
    return result;
  }

  @Post('logout')
  @Auth()
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('auth_token', { path: '/' });
    return { message: 'Logout successful' };
  }

  @Get('check-auth-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = this.authService.checkAuthStatus(user);
    res.cookie('auth_token', result.token, COOKIE_OPTIONS);
    return result;
  }
}
