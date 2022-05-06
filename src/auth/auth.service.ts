import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Code, CODE_TYPE, User } from '@prisma/client';
import { UserCreateDto } from './dto/UserCreateDto';
import { UsersService } from '../users/users.service';
import { authConstants } from './constants';
import { RabbitMqService } from '../rabbit-mq/rabbit-mq.service';
import { ILoginResult } from '../utils/types/ILoginResult';
import { UserGetPayload } from '../utils/types/prisma/User';
import { AuthErrors } from '../utils/messages/errors/auth';
import { CommonErrors } from '../utils/messages/errors/common';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly rabbitMQService: RabbitMqService,
        private jwtService: JwtService,
    ) {}

    async verifyUser(email: string, code: string): Promise<any> {
        const user: UserGetPayload = await this.usersService.findOneByEmailWithCodes(email);

        if (!user) {
            throw new BadRequestException(AuthErrors.UserNotFound);
        }

        const emailVerificationCode: Code = user.codes.find(
            (code: Code) => code.provider === CODE_TYPE.EMAIL_VERIFICATION,
        );

        if (emailVerificationCode.code !== code) {
            throw new BadRequestException(AuthErrors.CodeInvalid);
        }

        return this.usersService.confirmUserVerification(email);
    }

    async register(data: UserCreateDto): Promise<User> {
        const user: User = await this.usersService.findOneByEmailWithCodes(data.email);

        if (user) {
            throw new BadRequestException(AuthErrors.UserAlreadyExists);
        }

        const password: string = await this.getHashedPassword(data.password);

        try {
            const userDb: UserGetPayload = await this.usersService.createUser({
                ...data,
                password,
            });
            const {
                email,
                codes: [{ code }],
                ...rest
            } = userDb;

            // await this.rabbitMQService.send('rabbit-mq-producer', { email, code: code.toString() });

            return { ...rest, email };
        } catch {
            throw new InternalServerErrorException(CommonErrors.InternalServerError);
        }
    }

    async login({ email, password: passwordRequest }): Promise<ILoginResult> {
        const user: User = await this.findUser(email);

        const passwordMatches: boolean = await this.isPasswordValid(passwordRequest, user.password);

        if (user && passwordMatches) {
            const { password, ...result } = user;
            const accessToken: string = this.jwtService.sign(result);

            return { ...result, accessToken };
        }

        return undefined;
    }

    async findUser(email: string): Promise<User> {
        const user: User = await this.usersService.findOneByEmailWithCodes(email);

        if (!user) {
            throw new UnauthorizedException(CommonErrors.Unauthorized);
        }

        return user;
    }

    async getHashedPassword(password: string): Promise<string> {
        return bcrypt.hash(password, authConstants.saltOrRounds);
    }

    async isPasswordValid(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}
