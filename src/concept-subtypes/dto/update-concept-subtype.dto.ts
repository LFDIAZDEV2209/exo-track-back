import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

// NOTA: scope y conceptTypeId son inmutables (definen la identidad del subtipo).
// Para "cambiar" de ámbito se crea uno nuevo y se re-catalogan los ítems.
export class UpdateConceptSubtypeDto {

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    @Transform(({ value }: { value: unknown }): unknown =>
        typeof value === 'string' ? value.trim() : value,
    )
    name?: string;

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
