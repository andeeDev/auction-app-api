import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { User, CODE_TYPE } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../prisma/prisma.service';
import { BareUserType, UserGetPayload } from '../utils/types/prisma/User';
import { CodeGeneratorHelper } from '../utils/helpers/CodeGeneratorHelper';
import { AuthErrors } from '../utils/messages/errors/auth';
import AuthDto from '../auth/dto/AuthDto';
import { GetAllUsersRes } from '../utils/types/returnTypes';
import { genericSuccessResponse } from '../utils/types/DefaultSuccessResponse';
import { AppLogger } from '../utils/helpers/CustomLogger';
import { ExceptionHandler } from '../utils/helpers/RemoteExceptionHelper';
import { UsersErrorTypes } from '../utils/types/loggerTypes/ErrorTypes';
import { UsersSuccessTypes } from '../utils/types/loggerTypes/SuccessTypes';

@Injectable()
export class UsersService {
    constructor(
        private readonly prismaService: PrismaService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) {}

    async createUser(data: AuthDto): Promise<UserGetPayload> {
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

    async findUser(email: string): Promise<UserGetPayload> {
        return this.prismaService.user.findUnique({
            where: {
                email,
            },
            include: { codes: true },
        });
    }

    async findOneByEmailWithCodes(email: string): Promise<any> {
        const user: UserGetPayload = await this.findUser(email);

        if (!user) {
            this.logger.error(AuthErrors.UserNotFound);
            throw new BadRequestException(AuthErrors.UserNotFound);
        }

        return user;
    }

    async confirmUserVerification(email: string): Promise<User> {
        return this.prismaService.user.update({
            where: { email },
            data: { isVerified: true },
        });
    }

    async getAll(): Promise<GetAllUsersRes> {
        try {
            const bareUsers: BareUserType[] = await this.prismaService.user.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            });

            AppLogger.logInfo(this.logger, { type: UsersSuccessTypes.FetchAllUsersSuccess });

            return {
                ...genericSuccessResponse,
                payload: bareUsers,
            };
        } catch (error: unknown) {
            return ExceptionHandler.handleError(error, UsersErrorTypes.GetAllUsersTypes);
        }
    }
}
