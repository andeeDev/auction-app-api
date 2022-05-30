import { Module } from '@nestjs/common';
import { ClientProvider, ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMqService } from './rabbit-mq.service';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'notification-events',
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: async (configService: ConfigService): Promise<ClientProvider> => {
                    const rabbitmqConnectionUrl: string = `amqp://${configService.get<string>(
                        'rabbitmq.user',
                    )}:${configService.get<string>('rabbitmq.password')}@${configService.get<string>(
                        'rabbitmq.host',
                    )}/${configService.get<string>('rabbitmq.vhost')}`;

                    return {
                        transport: Transport.RMQ,
                        options: {
                            urls: [rabbitmqConnectionUrl],
                            queue: 'notification-events',
                        },
                    };
                },
            },
            {
                name: 'auth-service',
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: async (configService: ConfigService): Promise<ClientProvider> => {
                    const rabbitmqConnectionUrl: string = `amqp://${configService.get<string>(
                        'rabbitmq.user',
                    )}:${configService.get<string>('rabbitmq.password')}@${configService.get<string>(
                        'rabbitmq.host',
                    )}/${configService.get<string>('rabbitmq.vhost')}`;

                    return {
                        transport: Transport.RMQ,
                        options: {
                            urls: [rabbitmqConnectionUrl],
                            queue: 'auth-service',
                        },
                    };
                },
            },
        ]),
    ],
    controllers: [],
    providers: [RabbitMqService],
    exports: [RabbitMqService],
})
export class RabbitMqModule {}
