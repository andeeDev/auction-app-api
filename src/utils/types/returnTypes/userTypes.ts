import { GenericResponse } from './basic';
import { BareUserType } from '../prisma/User';

export interface GetAllUsersRes extends GenericResponse {
    payload?: BareUserType[];
}
