import { BadRequestException, Inject, Injectable } from '@nestjs/common';
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
import { CommonErrors } from '../utils/messages/errors/common';
import { PasswordConst } from '../utils/consts/PasswordConst';
import { getHashedPassword } from '../utils/helpers/PasswordHelper';
import { PasswordSuccess } from '../utils/messages/success';
import { ResetPasswordDto } from './dto';
import { PasswordErrors } from '../utils/messages/errors/password';
import { RemoteExceptionHelper } from '../utils/helpers/RemoteExceptionHelper';

@Injectable()
export class PasswordService {
    constructor(
        private usersService: UsersService,
        private prismaService: PrismaService,
        private rabbitMQService: RabbitMqService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) {}

    async sendResetVerificationCode(email: string): Promise<{ message: PasswordSuccess }> {
        try {
            const user: UserGetPayload = await this.usersService.findOneByEmailWithCodes(email);

            const code: string = CodeGeneratorHelper.generateCode();

            await this.rabbitMQService.send(RabbitMqQueues.ResetPassword, { email, code });
            await this.prismaService.code.create({
                data: {
                    userId: user.id,
                    code,
                    provider: CODE_TYPE.PASSWORD_RESET,
                },
            });
            this.logger.info(PasswordSuccess.PasswordResetCodeSentSuccessfully);

            return { message: PasswordSuccess.PasswordResetCodeSentSuccessfully };
        } catch (error: unknown) {
            return RemoteExceptionHelper.handleRemoteError(this.logger, error);
        }
    }

    async getToken(email: string, code: string): Promise<PasswordToken> {
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
                throw new BadRequestException(CommonErrors.BadCodeError);
            }

            if (codeModel.attempts >= PasswordConst.MaxAttemptCount) {
                this.prismaService.code.update({
                    where: { id: codeModel.id },
                    data: { isValid: false, attempts: codeModel.attempts + 1 },
                });
                throw new BadRequestException(CommonErrors.InvalidateCodeError);
            }

            if (codeModel.code !== code) {
                this.prismaService.code.update({
                    where: { id: codeModel.id },
                    data: { attempts: codeModel.attempts + 1 },
                });
                throw new BadRequestException(CommonErrors.BadCodeError);
            }

            const passwordToken: any = await this.prismaService.passwordToken.create({
                data: {
                    token,
                    userId: user.id,
                },
            });

            await this.prismaService.code.update({
                where: { id: codeModel.id },
                data: { isValid: false },
            });

            this.logger.info(PasswordSuccess.PasswordToken);

            return passwordToken;
        } catch (error: unknown) {
            return RemoteExceptionHelper.handleRemoteError(this.logger, error);
        }
    }

    async resetPassword({ email, token, password }: ResetPasswordDto): Promise<any> {
        try {
            const user: UserGetPayloadWithTokens = await this.prismaService.user.findFirst({
                where: { email },
                include: { passwordTokens: true },
            });
            const passwordToken: PasswordToken = user.passwordTokens
                .filter((PasswordToken: PasswordToken) => PasswordToken.token === token)
                .at(-1);

            if (!passwordToken) {
                this.logger.error(PasswordErrors.PasswordNotExists);
                throw new BadRequestException(CommonErrors.TokenNotExists);
            }

            if (!passwordToken.isValid) {
                this.logger.error(PasswordErrors.PasswordInvalid);
                throw new BadRequestException(CommonErrors.InvalidToken);
            }

            const updatedPassword: string = await getHashedPassword(password);

            await this.prismaService.user.update({
                data: {
                    password: updatedPassword,
                },
                where: { email },
            });

            this.logger.info(PasswordSuccess.UpdatedSuccessfully);

            return { message: PasswordSuccess.UpdatedSuccessfully };
        } catch (error: unknown) {
            return RemoteExceptionHelper.handleRemoteError(this.logger, error);
        }
    }
}
