import { Type } from 'class-transformer';
import {
    IsArray,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';

export class ExogenaItemDto {

    @IsString()
    @IsNotEmpty()
    concept: string;

    @IsNumber()
    @IsPositive()
    amount: number;

    @IsOptional()
    @IsString()
    sourceDetail?: string;

    // Subtipo a asignar (mismo ámbito del arreglo destino). Se valida en el servicio.
    @IsOptional()
    @IsUUID()
    subtypeId?: string;

    // Tercero reportante (DIAN). Solo se persiste en ítems no catalogados.
    @IsOptional()
    @IsString()
    reporterName?: string;

    @IsOptional()
    @IsString()
    reporterNit?: string;
}

export class ExogenaCustomItemDto extends ExogenaItemDto {

    @IsUUID()
    @IsNotEmpty()
    conceptTypeId: string;
}

export class CreateFromExogenaDto {

    @IsUUID()
    userId: string;

    @IsInt()
    @Min(2000)
    @Max(2100)
    taxableYear: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ExogenaItemDto)
    assets?: ExogenaItemDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ExogenaItemDto)
    incomes?: ExogenaItemDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ExogenaItemDto)
    liabilities?: ExogenaItemDto[];

    // Conceptos exógenos sin clasificación: se persisten como no catalogados,
    // nunca se descartan.
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ExogenaItemDto)
    unclassified?: ExogenaItemDto[];

    // Conceptos exógenos clasificados directo a tipos personalizados
    // (ej. Retefuente). Se persisten en custom_items en la misma transacción.
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ExogenaCustomItemDto)
    custom?: ExogenaCustomItemDto[];
}
