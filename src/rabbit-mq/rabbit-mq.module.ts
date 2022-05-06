import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMqService } from './rabbit-mq.service';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'rabbit-mq-module',
                transport: Transport.RMQ,
                options: {
                    urls: ['amqp://andee:guest@rabbitmq//notifications'],
                    queue: 'rabbit-mq-nest-js',
                },
            },
        ]),
    ],
    controllers: [],
    providers: [RabbitMqService],
    exports: [RabbitMqService],
})
export class RabbitMqModule {}
