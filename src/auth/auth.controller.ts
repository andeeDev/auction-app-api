import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserCreateDto } from './dto/UserCreateDto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('/login')
    login(@Body() body: UserCreateDto): Promise<any> {
        return this.authService.login(body);
    }

    @Post('/register')
    register(@Body() body: UserCreateDto): Promise<any> {
        return this.authService.register(body);
    }

    @Post('/account/confirm')
    confirmAccount(
        @Body('email') email: string,
        @Body('code') code: string,
    ): Promise<any> {
        return this.authService.verifyUser(email, code);
    }
}
