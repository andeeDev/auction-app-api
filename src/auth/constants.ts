import { IJwtConst } from '../utils/types/IJwtConst';

export const authConstants: IJwtConst = {
    issuer: 'auction',
    secret: 'secretKey',
    tokenExpirationTime: '60m', // 60s
    saltOrRounds: 3,
};
