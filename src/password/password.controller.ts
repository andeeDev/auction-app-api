import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetTokenDto, ResetPasswordDto } from './dto';
import { PasswordService } from './password.service';
import { RabbitMqService } from '../rabbit-mq/rabbit-mq.service';

@Controller('password')
export class PasswordController {
    constructor(private rabbitMqService: RabbitMqService, private passwordService: PasswordService) {}

    @MessagePattern('verification')
    async sendPasswordResetCode(@Payload() body): Promise<any> {
        return this.passwordService.sendResetVerificationCode(body.email);
    }

    @MessagePattern('token')
    async getToken(@Payload() { email, code }: GetTokenDto): Promise<any> {
        return this.passwordService.getToken(email, code);
    }

    @MessagePattern('reset')
    async reset(@Payload() resetPasswordDto: ResetPasswordDto): Promise<void> {
        return this.passwordService.resetPassword(resetPasswordDto);
    }
}
