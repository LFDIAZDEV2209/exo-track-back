import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(
    error: unknown,
    user: TUser | false,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (error || !user) {
      const response = context.switchToHttp().getResponse<Response>();
      const request = context.switchToHttp().getRequest<Request>();

      // El token inválido no debe sobrevivir al 401 y provocar reintentos inútiles.
      if (request.cookies?.auth_token) {
        response.clearCookie('auth_token', { path: '/' });
      }
    }

    return super.handleRequest(error, user, _info, context);
  }
}
