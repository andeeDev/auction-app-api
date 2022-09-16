import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Code, CODE_TYPE, PasswordToken } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UserGetPayload, UserGetPayloadWithTokens } from '../utils/types/prisma/User';
import { CodeGeneratorHelper } from '../utils/helpers/CodeGeneratorHelper';
import { RabbitMqQueues } from '../utils/types/RabbitMqQueues';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitMqService } from '../rabbit-mq/rabbit-mq.service';
import { RandomStringGenerate } from '../utils/helpers/RandomStringGenerate';
import { CommonErrorMessages } from '../utils/messages/errors/common';
import { PasswordConst } from '../utils/consts/PasswordConst';
import { getHashedPassword } from '../utils/helpers/PasswordHelper';
import { PasswordSuccess } from '../utils/messages/success';
import { ResetPasswordDto } from './dto';
import { ExceptionHandler } from '../utils/helpers/RemoteExceptionHelper';
import { PasswordErrorTypes } from '../utils/types/loggerTypes/ErrorTypes';
import { genericSuccessResponse } from '../utils/types/DefaultSuccessResponse';
import { GetTokenRes, ResetPasswordRes, SendVerificationCodeRes } from '../utils/types/returnTypes/password';
import { AppLogger } from '../utils/helpers/CustomLogger';
import { PasswordSuccessTypes } from '../utils/types/loggerTypes/SuccessTypes';

@Injectable()
export class PasswordService {
    constructor(
        private usersService: UsersService,
        private prismaService: PrismaService,
        private rabbitMQService: RabbitMqService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) {}

    async sendResetVerificationCode(email: string): Promise<SendVerificationCodeRes> {
        try {
            const user: UserGetPayload = await this.usersService.findOneByEmailWithCodes(email);

            const code: string = CodeGeneratorHelper.generateCode();

            this.rabbitMQService.send(RabbitMqQueues.ResetPassword, { email, code });

            await this.prismaService.code.create({
                data: {
                    userId: user.id,
                    code,
                    provider: CODE_TYPE.PASSWORD_RESET,
                },
            });

            AppLogger.logInfo(this.logger, { type: PasswordSuccessTypes.SendVerificationCodeSuccess });

            return {
                ...genericSuccessResponse,
                message: PasswordSuccess.PasswordResetCodeSentSuccessfully,
            };
        } catch (error: unknown) {
            return ExceptionHandler.handleError(error, PasswordErrorTypes.SentResetVerificationError);
        }
    }

    async getToken(email: string, code: string): Promise<GetTokenRes> {
        try {
            const user: any = await this.prismaService.user.findFirst({
                where: { email },
                include: { codes: true },
            });
            const codeModel: Code = user.codes
                .filter((code: Code) => code.provider === CODE_TYPE.PASSWORD_RESET)
                .at(-1);
            const token: string = RandomStringGenerate.getToken();

            if (!codeModel.isValid) {
                AppLogger.logError(this.logger, {
                    type: PasswordErrorTypes.GetTokenUserNotVerifiedError,
                    message: CommonErrorMessages.BadCodeError,
                });

                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: CommonErrorMessages.BadCodeError,
                };
            }

            if (codeModel.attempts >= PasswordConst.MaxAttemptCount) {
                this.prismaService.code.update({
                    where: { id: codeModel.id },
                    data: { isValid: false, attempts: codeModel.attempts + 1 },
                });

                AppLogger.logError(this.logger, {
                    type: PasswordErrorTypes.MaxAttemptsError,
                    message: CommonErrorMessages.InvalidateCodeError,
                });

                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: CommonErrorMessages.InvalidateCodeError,
                };
            }

            if (codeModel.code !== code) {
                this.prismaService.code.update({
                    where: { id: codeModel.id },
                    data: { attempts: codeModel.attempts + 1 },
                });

                AppLogger.logError(this.logger, {
                    type: PasswordErrorTypes.WrongCodeProvidedError,
                    message: CommonErrorMessages.BadCodeError,
                });

                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: CommonErrorMessages.BadCodeError,
                };
            }

            const passwordToken: PasswordToken = await this.prismaService.passwordToken.create({
                data: {
                    token,
                    userId: user.id,
                },
            });

            await this.prismaService.code.update({
                where: { id: codeModel.id },
                data: { isValid: false },
            });

            AppLogger.logInfo(this.logger, { type: PasswordSuccessTypes.GetTokenSuccess });

            return {
                ...genericSuccessResponse,
                payload: passwordToken,
            };
        } catch (error: unknown) {
            return ExceptionHandler.handleError(error, PasswordErrorTypes.GetTokenError);
        }
    }

    async resetPassword({ email, token, password }: ResetPasswordDto): Promise<ResetPasswordRes> {
        try {
            const user: UserGetPayloadWithTokens = await this.prismaService.user.findFirst({
                where: { email },
                include: { passwordTokens: true },
            });
            const passwordToken: PasswordToken = user.passwordTokens
                .filter((PasswordToken: PasswordToken) => PasswordToken.token === token)
                .at(-1);

            if (!passwordToken) {
                AppLogger.logError(this.logger, {
                    type: PasswordErrorTypes.PasswordTokenNotFoundError,
                    message: CommonErrorMessages.TokenNotExists,
                });

                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: CommonErrorMessages.TokenNotExists,
                };
            }

            if (!passwordToken.isValid) {
                AppLogger.logError(this.logger, {
                    type: PasswordErrorTypes.PasswordTokenNotValidError,
                    message: CommonErrorMessages.InvalidToken,
                });

                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: CommonErrorMessages.InvalidToken,
                };
            }

            const updatedPassword: string = await getHashedPassword(password);

            await this.prismaService.user.update({
                data: {
                    password: updatedPassword,
                },
                where: { email },
            });

            AppLogger.logInfo(this.logger, { type: PasswordSuccessTypes.ResetPasswordSuccess });

            return {
                ...genericSuccessResponse,
                message: PasswordSuccess.UpdatedSuccessfully,
            };
        } catch (error: unknown) {
            return ExceptionHandler.handleError(error, PasswordErrorTypes.ResetPasswordError);
        }
    }
}
