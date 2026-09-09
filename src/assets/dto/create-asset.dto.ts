import { IsNotEmpty, IsOptional, IsString, IsNumber, IsPositive, IsUUID } from "class-validator";

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

    @IsOptional()
    @IsUUID()
    subtypeId?: string;
}
