import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Code, CODE_TYPE, User } from '@prisma/client';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { AuthDto } from './dto/AuthDto';
import { UsersService } from '../users/users.service';
import { RabbitMqService } from '../rabbit-mq/rabbit-mq.service';
import { ILoginResult } from '../utils/types/ILoginResult';
import { UserGetPayload } from '../utils/types/prisma/User';
import { AuthErrors } from '../utils/messages/errors/auth';
import { CommonErrors } from '../utils/messages/errors/common';
import { RabbitMqQueues } from '../utils/types/RabbitMqQueues';
import { getHashedPassword } from '../utils/helpers/PasswordHelper';
import { AuthSuccess } from '../utils/messages/success/auth';
import { RemoteExceptionHelper } from '../utils/helpers/RemoteExceptionHelper';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly rabbitMQService: RabbitMqService,
        private jwtService: JwtService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) {}

    async verifyUser(email: string, code: string): Promise<User> {
        try {
            const user: UserGetPayload = await this.usersService.findOneByEmailWithCodes(email);

            if (!user) {
                this.logger.error(AuthErrors.UserNotFound);
                throw new BadRequestException(AuthErrors.UserNotFound);
            }

            const emailVerificationCode: Code = user.codes.find(
                (code: Code) => code.provider === CODE_TYPE.EMAIL_VERIFICATION,
            );

            if (emailVerificationCode.code !== code) {
                this.logger.error(AuthErrors.CodeInvalid);
                throw new BadRequestException(AuthErrors.CodeInvalid);
            }

            return await this.usersService.confirmUserVerification(email);
        } catch (error: unknown) {
            return RemoteExceptionHelper.handleRemoteError(this.logger, error);
        }
    }

    async register(data: AuthDto): Promise<User> {
        try {
            const user: UserGetPayload = await this.usersService.findUser(data.email);

            if (user) {
                this.logger.error(AuthErrors.UserAlreadyExists);
                throw new BadRequestException(AuthErrors.UserAlreadyExists);
            }

            const password: string = await getHashedPassword(data.password);

            const userDb: UserGetPayload = await this.usersService.createUser({
                ...data,
                password,
            });
            const {
                email,
                codes: [{ code }],
                ...rest
            } = userDb;

            await this.rabbitMQService.send(RabbitMqQueues.AccountVerification, { email, code: code.toString() });
            this.logger.info(AuthSuccess.RegisterMessage);

            return { ...rest, email };
        } catch (error: unknown) {
            return RemoteExceptionHelper.handleRemoteError(this.logger, error);
        }
    }

    async login({ email, password: passwordRequest }: AuthDto): Promise<ILoginResult> {
        try {
            const user: UserGetPayload = await this.findUser(email);

            const passwordMatches: boolean = await this.isPasswordValid(passwordRequest, user.password);

            if (!passwordMatches) {
                this.logger.error(AuthErrors.PasswordsNotMatch);
                throw new BadRequestException(AuthErrors.PasswordsNotMatch);
            }

            const { password, codes, ...result } = user;
            const accessToken: string = this.jwtService.sign(result);

            this.logger.info(AuthSuccess.LoginMessage);

            return { ...result, accessToken };
        } catch (error: unknown) {
            return RemoteExceptionHelper.handleRemoteError(this.logger, error);
        }
    }

    async findUser(email: string): Promise<UserGetPayload> {
        const user: UserGetPayload = await this.usersService.findOneByEmailWithCodes(email);

        if (!user) {
            this.logger.error(AuthErrors.EmailNotFound);
            throw new UnauthorizedException(CommonErrors.Unauthorized);
        }

        return user;
    }

    async isPasswordValid(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}
