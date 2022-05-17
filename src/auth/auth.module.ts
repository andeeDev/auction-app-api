import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { authConstants } from './constants';
import { RabbitMqModule } from '../rabbit-mq/rabbit-mq.module';

@Module({
    imports: [
        UsersModule,
        PassportModule,
        RabbitMqModule,
        JwtModule.register({
            secret: authConstants.secret,
            signOptions: { issuer: authConstants.issuer, expiresIn: authConstants.tokenExpirationTime },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
