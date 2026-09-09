import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ItemScope } from 'src/shared/enums/item-scope.enum';

export class CreateConceptSubtypeDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    @Transform(({ value }: { value: unknown }): unknown =>
        typeof value === 'string' ? value.trim() : value,
    )
    name: string;

    @IsEnum(ItemScope)
    scope: ItemScope;

    // Requerido solo cuando scope === 'custom' (se valida en el servicio)
    @IsOptional()
    @IsUUID()
    conceptTypeId?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    @Transform(({ value }: { value: unknown }): unknown => {
        if (value === null || value === undefined) return value;
        return typeof value === 'string' ? value.trim() || null : value;
    })
    description?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
