import { User } from '@prisma/client';
import { GenericResponse } from './basic';
import { ILoginResult } from '../ILoginResult';

export interface LoginRes extends GenericResponse {
    payload?: ILoginResult;
}

export interface RegisterRes extends GenericResponse {
    payload?: User;
}

export interface VerifyUserRes extends GenericResponse {
    payload?: ILoginResult;
}