import { IsNotEmpty, IsString, IsUUID, IsNumber, IsPositive } from "class-validator";

export class CreateIncomeDto {

    @IsUUID()
    @IsNotEmpty()
    declarationId: string;

    @IsString()
    @IsNotEmpty()
    concept: string;

    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    amount: number;
}
