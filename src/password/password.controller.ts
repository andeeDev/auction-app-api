import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { SendResetCodeDto, GetTokenDto, ResetPasswordDto } from './dto';
import { PasswordService } from './password.service';

@Controller('password')
export class PasswordController {
    constructor(private passwordService: PasswordService) {}

    @Post('verification')
    async sendPasswordResetCode(@Body() { email }: SendResetCodeDto, @Res() response: Response): Promise<void> {
        return this.passwordService.sendResetVerificationCode(email, response);
    }

    @Post('token')
    async getToken(@Body() { email, code }: GetTokenDto): Promise<any> {
        return this.passwordService.getToken(email, code);
    }

    @Post('reset')
    async reset(@Body() resetPasswordDto: ResetPasswordDto, @Res() response: Response): Promise<void> {
        return this.passwordService.resetPassword(resetPasswordDto, response);
    }
}
