import { Module } from '@nestjs/common';
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RabbitMqModule } from './rabbit-mq/rabbit-mq.module';
import { PasswordModule } from './password/password.module';

@Module({
    imports: [
        AuthModule,
        UsersModule,
        RabbitMqModule,
        PasswordModule,
        WinstonModule.forRoot({
            transports: [
                new winston.transports.File({
                    filename: 'app.log',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.ms(),
                        nestWinstonModuleUtilities.format.nestLike('MyApp', { prettyPrint: true }),
                    ),
                }),
            ],
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
