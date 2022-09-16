import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetTokenDto, ResetPasswordDto, SendResetCodeDto } from './dto';
import { PasswordService } from './password.service';
import { RabbitMqService } from '../rabbit-mq/rabbit-mq.service';
import { GetTokenRes, ResetPasswordRes, SendVerificationCodeRes } from '../utils/types/returnTypes/password';

@Controller('password')
export class PasswordController {
    constructor(private rabbitMqService: RabbitMqService, private passwordService: PasswordService) {}

    @MessagePattern('verification')
    async sendPasswordResetCode(@Payload() body: SendResetCodeDto): Promise<SendVerificationCodeRes> {
        return this.passwordService.sendResetVerificationCode(body.email);
    }

    @MessagePattern('token')
    async getToken(@Payload() { email, code }: GetTokenDto): Promise<GetTokenRes> {
        return this.passwordService.getToken(email, code);
    }

    @MessagePattern('reset')
    async reset(@Payload() resetPasswordDto: ResetPasswordDto): Promise<ResetPasswordRes> {
        return this.passwordService.resetPassword(resetPasswordDto);
    }
}
