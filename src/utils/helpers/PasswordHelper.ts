import * as bcrypt from 'bcrypt';
import { authConstants } from '../../auth/constants';

export const getHashedPassword: (password: string) => Promise<string> = async (password: string): Promise<string> => {
    return bcrypt.hash(password, authConstants.saltOrRounds);
};
