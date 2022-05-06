import { Injectable } from '@nestjs/common';
import { User, CODE_TYPE } from '../../generated/client';
import { PrismaService } from '../prisma/prisma.service';
import { UserCreateDto } from '../auth/dto/UserCreateDto';

@Injectable()
export class UsersService {
    constructor(private readonly prismaService: PrismaService) {}

    async createUser(data: UserCreateDto): Promise<User> {
        const randomNumber: number = Math.random() * 10_000;
        const code: string = Math.floor(randomNumber).toString();

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

    /*    async findOneByEmail(email: string): Promise<User> {
        return this.prismaService.user.findUnique({
            where: {
                email,
            },
        });
    } */

    async findOneByEmailWithCodes(email: string): Promise<any> {
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
