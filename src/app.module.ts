import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RabbitMqModule } from './rabbit-mq/rabbit-mq.module';
import { PasswordModule } from './password/password.module';

@Module({
    imports: [AuthModule, UsersModule, RabbitMqModule, PasswordModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
