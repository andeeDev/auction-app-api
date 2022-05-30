import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RmqContext } from '@nestjs/microservices';
import { IEmailMessage } from '../utils/types/IEmailMessage';

@Injectable()
export class RabbitMqService {
    constructor(@Inject('notification-events') private readonly client: ClientProxy) {}

    public getRabbitMqOptions(context: RmqContext): IRabbitMqOptions {
        const channel: any = context.getChannelRef();
        const originalMessage: Record<string, any> = context.getMessage();

        return { channel, originalMessage };
    }

    public send(pattern: string, data: IEmailMessage): Promise<void> {
        return this.client.send(pattern, data).toPromise();
    }
}
