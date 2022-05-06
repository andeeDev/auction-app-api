import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
    const app: INestApplication = await NestFactory.create(AppModule);

    app.connectMicroservice({
        transport: Transport.RMQ,
        options: {
            urls: ['amqp://rabbitmq:5672'],
            queueOptions: {
                durable: false,
            },
        },
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
        }),
    );

    await app.startAllMicroservices();
    await app.listen(process.env.PORT || 8000);
}

bootstrap();
