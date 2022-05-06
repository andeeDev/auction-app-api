import { Prisma } from '../../../../generated/client';

export type UserGetPayload = Prisma.UserGetPayload<{
    include: { codes: true };
}>;
