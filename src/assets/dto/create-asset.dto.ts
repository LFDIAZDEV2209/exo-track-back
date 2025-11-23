import { IsNotEmpty, IsString, IsNumber, IsPositive, IsUUID } from "class-validator";

export class CreateAssetDto {

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
