import { Injectable } from '@nestjs/common';
import { User, CODE_TYPE } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UserCreateDto } from '../auth/dto/UserCreateDto';
import { UserGetPayload } from '../utils/types/prisma/User';
import { CodeGeneratorHelper } from '../utils/helpers/CodeGeneratorHelper';

@Injectable()
export class UsersService {
    constructor(private readonly prismaService: PrismaService) {}

    async createUser(data: UserCreateDto): Promise<UserGetPayload> {
        const code: string = CodeGeneratorHelper.generateCode();

        return this.prismaService.user.create({
            data: {
                ...data,
                codes: {
                    create: [{ code, provider: CODE_TYPE.EMAIL_VERIFICATION }],
                },
            },
            include: {
                codes: true,
            },
        });
    }

    async findOneByEmailWithCodes(email: string): Promise<UserGetPayload> {
        return this.prismaService.user.findUnique({
            where: {
                email,
            },
            include: { codes: true },
        });
    }

    async confirmUserVerification(email: string): Promise<User> {
        return this.prismaService.user.update({
            where: { email },
            data: { isVerified: true },
        });
    }
}
