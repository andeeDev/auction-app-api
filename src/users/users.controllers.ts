import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { BareUserType } from '../utils/types/prisma/User';

@Controller()
export class UsersControllers {
    constructor(private readonly usersService: UsersService) {}

    @MessagePattern('users-get-all')
    async login(): Promise<BareUserType[]> {
        return this.usersService.getAll();
    }
}
