import { Injectable } from '@nestjs/common';
import { RabbitMqService } from './rabbit-mq/rabbit-mq.service';

@Injectable()
export class AppService {
    constructor(private readonly rabbitMQService: RabbitMqService) {}

    getHello(): string {
        // this.rabbitMQService.send('rabbit-mq-producer', { email: 'andrey14501450@gmail.com', code: '1234' });
        return 'Hello World!1234';
    }
}
