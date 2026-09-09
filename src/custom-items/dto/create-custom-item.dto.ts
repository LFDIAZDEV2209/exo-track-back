import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateCustomItemDto {

    @IsUUID()
    @IsNotEmpty()
    declarationId: string;

    @IsUUID()
    @IsNotEmpty()
    conceptTypeId: string;

    @IsString()
    @IsNotEmpty()
    concept: string;

    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    amount: number;

    @IsOptional()
    @IsUUID()
    subtypeId?: string;
}
