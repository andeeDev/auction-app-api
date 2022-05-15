export interface IJwtConst {
    issuer: string;
    secret: string;
    tokenExpirationTime: string;
    saltOrRounds: number;
}
