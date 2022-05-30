export const configuration: any = () => {
    return {
        environment: process.env.NODE_ENV,
        mailjet: {
            apiKey: process.env.MAILJET_API_KEY,
            secretKey: process.env.MAILJET_SECRET_KEY,
        },
        rabbitmq: {
            user: process.env.RABBIT_MQ_USER,
            password: process.env.RABBIT_MQ_PASSWORD,
            host: process.env.RABBIT_MQ_HOST,
            vhost: process.env.RABBIT_MQ_VHOST,
        },
    };
};
