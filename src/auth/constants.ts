import { IJwtConst } from '../utils/types/IJwtConst';

export const authConstants: IJwtConst = {
    secret: 'secretKey',
    tokenExpirationTime: '60m', // 60s
    saltOrRounds: 3,
};
