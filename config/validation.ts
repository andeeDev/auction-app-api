import * as Joi from 'joi';

export const validationSchema: any = Joi.object({
    NODE_ENV: Joi.string().required(),
    RABBIT_MQ_USER: Joi.string().required(),
    RABBIT_MQ_PASSWORD: Joi.string().required(),
    RABBIT_MQ_HOST: Joi.string().required(),
    RABBIT_MQ_VHOST: Joi.string().required(),
});
