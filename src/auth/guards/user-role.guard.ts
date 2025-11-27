import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserRole } from 'src/users/enums/user-role.enum';
import { Reflector } from '@nestjs/core';
import { User } from 'src/users/entities/user.entity';
import { ROLES_KEY } from '../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const validRoles: UserRole[] = this.reflector.get(ROLES_KEY, context.getHandler());

    if (validRoles.length === 0) return true;
    if (!validRoles) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user) throw new UnauthorizedException('User not found');

    
    if (validRoles.includes(user.role)) return true;
    

    throw new ForbiddenException(`User ${user.fullName} does not have the required role: ${validRoles.join(', ')}`);
  }
}
