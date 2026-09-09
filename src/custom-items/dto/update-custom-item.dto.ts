import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class UpdateCustomItemDto {

    @IsOptional()
    @IsUUID()
    conceptTypeId?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    concept?: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    amount?: number;

    // uuid reasigna, null explícito lo quita, ausente no toca
    @IsOptional()
    @IsUUID()
    subtypeId?: string | null;
}
