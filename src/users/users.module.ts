import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersControllers } from './users.controllers';

@Module({
    imports: [PrismaModule],
    providers: [UsersService],
    controllers: [UsersControllers],
    exports: [UsersService],
})
export class UsersModule {}
