import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { GetAllUsersRes } from '../utils/types/returnTypes';

@Controller()
export class UsersControllers {
    constructor(private readonly usersService: UsersService) {}

    @MessagePattern('users-get-all')
    async login(): Promise<GetAllUsersRes> {
        return this.usersService.getAll();
    }
}
