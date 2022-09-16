import { SuccessType } from './SuccessTypes';
import { ErrorType } from './ErrorTypes';

export type SuccessLoggerTypes = {
    type: SuccessType;
};

export type ErrorLoggerTypes = {
    type: ErrorType;
    message: string;
};
