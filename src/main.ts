import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { PrismaExceptionsFilter } from './utils/filters/PrismaExceptionsFilter';

async function bootstrap(): Promise<void> {
    const app: INestApplication = await NestFactory.create(AppModule);

    const config: ConfigService = app.get<ConfigService>(ConfigService);

    const user: string = config.get('rabbitmq.user');
    const password: string = config.get('rabbitmq.password');
    const host: string = config.get('rabbitmq.host');
    const vhost: string = config.get('rabbitmq.vhost');
    const rabbitMqConnectionString: string = `amqp://${user}:${password}@${host}/${vhost}`;
    const port: number = config.get('rabbitmq.port');
    const connectionUrl: string = `amqp://${host}:${port}`;

    app.connectMicroservice({
        transport: Transport.RMQ,
        options: {
            urls: [connectionUrl],
            queueOptions: {
                durable: false,
            },
        },
    });
    app.connectMicroservice({
        transport: Transport.RMQ,
        options: {
            urls: [rabbitMqConnectionString],
            queue: 'auth-service',
            queueOptions: {
                messageTtl: 10_000,
            },
            prefetchCount: 1,
        },
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
        }),
    );

    const httpAdapter: HttpAdapterHost = app.get(HttpAdapterHost);

    app.useGlobalFilters(new PrismaExceptionsFilter(httpAdapter));
    await app.startAllMicroservices();
    await app.listen(process.env.PORT || 9000);
}

bootstrap();
