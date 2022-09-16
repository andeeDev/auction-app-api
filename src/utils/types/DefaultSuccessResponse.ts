import { HttpStatus } from '@nestjs/common';
import { GenericResponse } from './returnTypes/basic';

export const genericSuccessResponse: GenericResponse = {
    status: HttpStatus.OK,
    message: '',
};
