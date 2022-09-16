import { Logger } from 'winston';
import { ErrorLoggerTypes, SuccessLoggerTypes } from '../types/loggerTypes/LoggerTypes';

export const AppLogger: {
    logError: (logger: Logger, message: ErrorLoggerTypes) => void;
    logInfo: (logger: Logger, message: SuccessLoggerTypes) => void;
} = {
    logError(logger: Logger, message: ErrorLoggerTypes): void {
        logger.error(message);
    },

    logInfo(logger: Logger, message: SuccessLoggerTypes): void {
        logger.info(message);
    },
};
