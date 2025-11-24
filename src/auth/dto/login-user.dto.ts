import { IsNotEmpty, IsString } from "class-validator";

export class LoginUserDto {
    @IsString()
    @IsNotEmpty()
    documentNumber: string;

    @IsString()
    @IsNotEmpty()
    password?: string;
}
