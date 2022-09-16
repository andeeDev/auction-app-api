import { PasswordToken } from '@prisma/client';
import { GenericResponse } from './basic';

export type SendVerificationCodeRes = GenericResponse;

export interface GetTokenRes extends GenericResponse {
    payload?: PasswordToken;
}

export interface ResetPasswordRes extends GenericResponse {

}