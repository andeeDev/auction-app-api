import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { RabbitMqService } from '../rabbit-mq/rabbit-mq.service';
import AuthDto from './dto/AuthDto';
import { ILoginResult } from '../utils/types/ILoginResult';

@Controller('auth')
export class AuthController {
    constructor(private readonly rabbitMqService: RabbitMqService, private readonly authService: AuthService) {}

    @MessagePattern('login')
    login(@Payload() body: AuthDto): Promise<ILoginResult> {
        return this.authService.login(body);
    }

    @MessagePattern('register')
    register(@Payload() body: AuthDto): Promise<User> {
        return this.authService.register(body);
    }

    @MessagePattern('confirm')
    confirmAccount(@Payload('email') email: string, @Payload('code') code: string): Promise<ILoginResult> {
        return this.authService.verifyUser(email, code);
    }
}
