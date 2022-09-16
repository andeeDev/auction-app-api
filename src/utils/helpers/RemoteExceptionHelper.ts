import { HttpStatus } from '@nestjs/common';
import { GenericResponse } from '../types/returnTypes/basic';
import { AppLogger } from './CustomLogger';
import { ErrorType } from '../types/loggerTypes/ErrorTypes';

interface IExceptionHandler {
    handleError: (error: unknown, type: ErrorType) => GenericResponse;
}

export const ExceptionHandler: IExceptionHandler = {
    handleError(error: unknown, type: ErrorType): GenericResponse {
        const { message = '' } = error as Error;

        AppLogger.logError(this.logger, {
            type,
            message,
        });

        return {
            message,
            status: HttpStatus.INTERNAL_SERVER_ERROR,
        };
    },
};
