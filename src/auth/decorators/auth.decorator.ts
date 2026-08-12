import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleProtected } from './role-protected.decorator';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { UserRoleGuard } from '../guards/user-role.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export function Auth(...roles: UserRole[]) {
    return applyDecorators(
        RoleProtected(...roles),
        UseGuards(JwtAuthGuard, UserRoleGuard),
    );
}
