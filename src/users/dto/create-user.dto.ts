import { IsEmail, IsNotEmpty, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateUserDto {

    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsString()
    @IsNotEmpty()
    @IsPositive()
    documentNumber: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @IsString()
    @IsOptional()
    password: string;
}
