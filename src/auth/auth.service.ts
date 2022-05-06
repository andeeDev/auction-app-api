import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserCreateDto } from './dto/UserCreateDto';
import { UsersService } from '../users/users.service';
import { authConstants } from './constants';
import { RabbitMqService } from '../rabbit-mq/rabbit-mq.service';
import { Code, CODE_TYPE, User } from '../../generated/client';
import { ILoginResult } from '../utils/types/ILoginResult';
import { UserGetPayload } from '../utils/types/prisma/User';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly rabbitMQService: RabbitMqService,
        private jwtService: JwtService,
    ) {}

    async verifyUser(email: string, code: string): Promise<any> {
        const user: UserGetPayload =
            await this.usersService.findOneByEmailWithCodes(email);
        console.log(user);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
        }

        const emailVerificationCode: Code = user.codes.find(
            (code: Code) => code.provider === CODE_TYPE.EMAIL_VERIFICATION,
        );

        if (emailVerificationCode.code !== code) {
            throw new HttpException('Code is wrong', HttpStatus.BAD_REQUEST);
        }

        return this.usersService.confirmUserVerification(email);
    }

    async register(data: UserCreateDto): Promise<any> {
        const user: User = await this.usersService.findOneByEmailWithCodes(
            data.email,
        );
        if (user) {
            throw new HttpException(
                'User already exists',
                HttpStatus.BAD_REQUEST,
            );
        }

        const password: string = await this.getHashedPassword(data.password);

        try {
            const userDb: User = await this.usersService.createUser({
                ...data,
                password,
            });
            console.log('userDb', userDb);
            // await this.rabbitMQService.send('rabbit-mq-producer', { email: userDb.email, code: '5432' });

            return userDb;
        } catch (error: any) {
            console.log('Error', error);
        }

        return new HttpException('Database error', HttpStatus.BAD_REQUEST);
    }

    async login({ email, password: passwordRequest }): Promise<ILoginResult> {
        const user: User = await this.findUser(email);

        const passwordMatches: boolean = await this.isPasswordValid(
            passwordRequest,
            user.password,
        );
        if (user && passwordMatches) {
            const { password, ...result } = user;
            const accessToken: string = this.jwtService.sign(result);

            return { ...result, accessToken };
        }

        return undefined;
    }

    async findUser(email: string): Promise<User> {
        const user: User = await this.usersService.findOneByEmailWithCodes(
            email,
        );
        if (!user) {
            throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
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
