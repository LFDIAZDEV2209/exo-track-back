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
}
