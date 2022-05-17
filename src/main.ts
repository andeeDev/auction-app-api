import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { PrismaExceptionsFilter } from './utils/filters/PrismaExceptionsFilter';

async function bootstrap(): Promise<void> {
    const app: INestApplication = await NestFactory.create(AppModule);

    app.connectMicroservice({
        transport: Transport.RMQ,
        options: {
            urls: ['amqp://localhost:5672'], // amqp://rabbitmq:5672
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

    const httpAdapter: HttpAdapterHost = app.get(HttpAdapterHost);

    app.useGlobalFilters(new PrismaExceptionsFilter(httpAdapter));
    await app.startAllMicroservices();
    await app.listen(process.env.PORT || 9000);
}

bootstrap();
