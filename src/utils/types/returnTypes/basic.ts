import { HttpStatus } from '@nestjs/common';

export interface GenericResponse {
    message: string;
    status: HttpStatus;
}
