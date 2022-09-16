import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Code, CODE_TYPE, User } from '@prisma/client';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import AuthDto from './dto/AuthDto';
import { UsersService } from '../users/users.service';
import { RabbitMqService } from '../rabbit-mq/rabbit-mq.service';
import { UserGetPayload } from '../utils/types/prisma/User';
import { AuthErrors } from '../utils/messages/errors/auth';
import { CommonErrorMessages } from '../utils/messages/errors/common';
import { RabbitMqQueues } from '../utils/types/RabbitMqQueues';
import { getHashedPassword } from '../utils/helpers/PasswordHelper';
import { ExceptionHandler } from '../utils/helpers/RemoteExceptionHelper';
import { genericSuccessResponse } from '../utils/types/DefaultSuccessResponse';
import { LoginRes, RegisterRes, VerifyUserRes } from '../utils/types/returnTypes/auth';
import { AppLogger } from '../utils/helpers/CustomLogger';
import { AuthErrorTypes } from '../utils/types/loggerTypes/ErrorTypes';
import { AuthSuccessTypes } from '../utils/types/loggerTypes/SuccessTypes';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly rabbitMQService: RabbitMqService,
        private jwtService: JwtService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) {}

    async verifyUser(email: string, code: string): Promise<VerifyUserRes> {
        try {
            const userGetPayload: UserGetPayload = await this.usersService.findOneByEmailWithCodes(email);

            if (!userGetPayload) {
                AppLogger.logError(this.logger, {
                    type: AuthErrorTypes.VerifiedNotFoundUserError,
                    message: AuthErrors.UserNotFound,
                });

                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: AuthErrors.UserNotFound,
                };
            }

            const emailVerificationCode: Code = userGetPayload.codes.find(
                (code: Code) => code.provider === CODE_TYPE.EMAIL_VERIFICATION,
            );

            if (emailVerificationCode.code !== code) {
                AppLogger.logError(this.logger, {
                    type: AuthErrorTypes.VerifiedCodeWrongError,
                    message: AuthErrors.CodeInvalid,
                });

                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: AuthErrors.CodeInvalid,
                };
            }

            const user: User = await this.usersService.confirmUserVerification(email);

            const accessToken: string = this.jwtService.sign(user);

            AppLogger.logInfo(this.logger, { type: AuthSuccessTypes.VerifiedSuccess });

            return {
                ...genericSuccessResponse,
                payload: { ...user, accessToken },
            };
        } catch (error: unknown) {
            return ExceptionHandler.handleError(error, AuthErrorTypes.VerifiedError);
        }
    }

    async register(data: AuthDto): Promise<RegisterRes> {
        try {
            const user: UserGetPayload = await this.usersService.findUser(data.email);

            if (user) {
                AppLogger.logError(this.logger, {
                    type: AuthErrorTypes.RegisterUserNotFoundError,
                    message: AuthErrors.UserNotFound,
                });

                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: AuthErrors.UserAlreadyExists,
                };
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

            AppLogger.logInfo(this.logger, { type: AuthSuccessTypes.RegisterSuccess });

            return { ...genericSuccessResponse, payload: { ...rest, email } };
        } catch (error: unknown) {
            return ExceptionHandler.handleError(error, AuthErrorTypes.RegisterError);
        }
    }

    async login({ email, password: passwordRequest }: AuthDto): Promise<LoginRes> {
        try {
            const user: UserGetPayload = await this.usersService.findOneByEmailWithCodes(email);

            if (!user) {
                AppLogger.logError(this.logger, {
                    type: AuthErrorTypes.LoginUserNotExistsError,
                    message: CommonErrorMessages.Unauthorized,
                });

                return {
                    message: CommonErrorMessages.Unauthorized,
                    status: HttpStatus.BAD_REQUEST,
                };
            }

            const passwordMatches: boolean = await this.isPasswordValid(passwordRequest, user.password);

            if (!user.isVerified) {
                AppLogger.logError(this.logger, {
                    type: AuthErrorTypes.LoginUserNotVerifiedError,
                    message: AuthErrors.AccountNotConfirmed,
                });

                return {
                    message: AuthErrors.AccountNotConfirmed,
                    status: HttpStatus.BAD_REQUEST,
                };
            }

            if (!passwordMatches) {
                AppLogger.logError(this.logger, {
                    type: AuthErrorTypes.LoginPasswordMatchesError,
                    message: AuthErrors.PasswordsNotMatch,
                });

                return {
                    message: AuthErrors.PasswordsNotMatch,
                    status: HttpStatus.BAD_REQUEST,
                };
            }

            const { password, codes, ...result } = user;
            const accessToken: string = this.jwtService.sign(result);

            AppLogger.logInfo(this.logger, { type: AuthSuccessTypes.LoginSuccess });

            return {
                ...genericSuccessResponse,
                payload: { ...result, accessToken },
            };
        } catch (error: unknown) {
            return ExceptionHandler.handleError(error, AuthErrorTypes.LoginError);
        }
    }

    async isPasswordValid(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}
