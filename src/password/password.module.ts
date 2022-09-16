import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PasswordController } from './password.controller';
import { PasswordService } from './password.service';
import { UsersModule } from '../users/users.module';
import { RabbitMqModule } from '../rabbit-mq/rabbit-mq.module';

@Module({
    imports: [UsersModule, PrismaModule, RabbitMqModule],
    providers: [PasswordService],
    exports: [PasswordService],
    controllers: [PasswordController],
})
export class PasswordModule {}
