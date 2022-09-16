import { PasswordToken } from '@prisma/client';
import { GenericResponse } from './basic';

export type SendVerificationCodeRes = GenericResponse;

export interface GetTokenRes extends GenericResponse {
    payload?: PasswordToken;
}

export type ResetPasswordRes = GenericResponse;
