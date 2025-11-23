import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateUserDto {

    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    documentNumber: number;

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
