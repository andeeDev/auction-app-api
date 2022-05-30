import { RpcException } from '@nestjs/microservices';
import { Logger } from 'winston';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { CommonErrors } from '../messages/errors/common';

interface IRemoteExceptionHelper {
    handleRemoteError: (logger: Logger, error: unknown) => never;
}

export const RemoteExceptionHelper: IRemoteExceptionHelper = {
    handleRemoteError(logger: Logger, error: unknown): never {
        if (error instanceof HttpException) {
            logger.error(error.message);
            throw new RpcException({
                message: error.message,
                code: error.getStatus(),
            });
        }
        if (error instanceof Error) {
            logger.error(error.message);
            throw new RpcException({
                message: error.message,
                code: 500,
            });
        }
        logger.error(error);
        throw new RpcException(CommonErrors.InternalUnknownError);
    },
};
