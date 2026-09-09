import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

// Campos ordenables expuestos por GET /users (whitelist: evita inyección SQL vía orderBy)
export const USER_SORT_FIELDS = [
  'fullName',
  'documentNumber',
  'email',
  'createdAt',
  'totalDeclarations',
] as const;

export type UserSortField = (typeof USER_SORT_FIELDS)[number];

export const SORT_ORDERS = ['ASC', 'DESC'] as const;

export type SortOrder = (typeof SORT_ORDERS)[number];

export class FindAllUsersDto extends PaginationDto {
  // Búsqueda parcial (insensible a mayúsculas) en nombre, cédula y email
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }: { value: unknown }): string | undefined =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  search?: string;

  // Filtro por estado del usuario
  @IsOptional()
  @Transform(({ value }: { value: unknown }): unknown => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  // Ordenamiento por columna (whitelist estricta)
  @IsOptional()
  @IsIn(USER_SORT_FIELDS as unknown as string[])
  sortBy?: UserSortField;

  @IsOptional()
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsIn(SORT_ORDERS as unknown as string[])
  order?: SortOrder;
}
