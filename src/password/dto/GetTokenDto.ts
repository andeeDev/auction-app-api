import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class GetTokenDto {
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    code: string;
}
