import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { IEmailMessage } from '../utils/types/IEmailMessage';

@Injectable()
export class RabbitMqService {
    constructor(@Inject('notification-events') private readonly client: ClientProxy) {}

    public send(pattern: string, data: IEmailMessage): Promise<void> {
        return this.client.send(pattern, data).toPromise();
    }
}
