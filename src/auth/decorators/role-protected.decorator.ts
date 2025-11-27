import { SetMetadata } from '@nestjs/common';
import type { UserRole } from 'src/users/enums/user-role.enum';

export const ROLES_KEY = 'role';
export const RoleProtected = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
