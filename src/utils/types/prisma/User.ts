import { Prisma, User } from '@prisma/client';

export type UserGetPayload = Prisma.UserGetPayload<{
    include: { codes: true };
}>;

export type UserGetPayloadWithTokens = Prisma.UserGetPayload<{
    include: { passwordTokens: true };
}>;

export type BareUserType = Omit<User, 'password' | 'isVerified'>;
