import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from "class-validator";
import { Source } from "src/shared/enums/source.enum";

export class CreateLiabilityDto {

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
