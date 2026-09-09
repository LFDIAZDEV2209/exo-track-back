import { IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID } from 'class-validator';

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
}
