import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleProtected } from './role-protected.decorator';
import { UserRole } from 'src/users/enums/user-role.enum';
import { UserRoleGuard } from '../guards/user-role.guard';
import { AuthGuard } from '@nestjs/passport';

export function Auth(...roles: UserRole[]) {
    return applyDecorators(
        RoleProtected(...roles),
        UseGuards(AuthGuard(), UserRoleGuard),
    );
}