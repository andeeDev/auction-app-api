import { Body, Controller } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { UserCreateDto } from './dto/UserCreateDto';
import { RabbitMqService } from '../rabbit-mq/rabbit-mq.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly rabbitMqService: RabbitMqService, private readonly authService: AuthService) {}

    @MessagePattern('login')
    login(@Payload() body /*: UserCreateDto */, @Ctx() context: RmqContext): Promise<any> {
        return this.authService.login(body, context);
    }

    @MessagePattern('register')
    register(@Payload() body: UserCreateDto): Promise<any> {
        return this.authService.register(body);
    }

    @MessagePattern('confirm')
    confirmAccount(@Payload('email') email: string, @Body('code') code: string): Promise<any> {
        return this.authService.verifyUser(email, code);
    }
}
