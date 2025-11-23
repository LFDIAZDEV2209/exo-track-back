import { IsInt, IsUUID, IsEnum, IsString, IsOptional } from "class-validator";
import { DeclarationStatus } from "../enums/declaration-status.enum";

export class CreateDeclarationDto {
    @IsUUID()
    userId: string;

    @IsInt()
    taxableYear: number;

    @IsEnum(DeclarationStatus)
    status: DeclarationStatus;

    @IsString()
    @IsOptional()
    description: string;
}
