import { Prisma } from '@prisma/client';

export type UserGetPayload = Prisma.UserGetPayload<{
    include: { codes: true };
}>;
