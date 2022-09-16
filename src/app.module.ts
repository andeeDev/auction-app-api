import { Module } from '@nestjs/common';
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RabbitMqModule } from './rabbit-mq/rabbit-mq.module';
import { PasswordModule } from './password/password.module';
import { configuration } from '../config/configuration';
import { validationSchema } from '../config/validation';

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
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
            validationSchema,
            envFilePath: ['.env'],
        }),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
