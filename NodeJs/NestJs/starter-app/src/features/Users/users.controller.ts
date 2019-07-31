import { Controller, Get, Param } from '@nestjs/common';

import { UsersDTO } from './users.dto';
import { UsersService } from './users.service';
import { ApiUseTags } from '@nestjs/swagger';

@ApiUseTags('Users')
@Controller('/users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get()
    getUsers(): UsersDTO[] {
        return this.usersService.getUsers();
    }

    @Get(':id')
    getUserById(@Param('id') id: String): UsersDTO {
        return this.usersService.getUserById(id);
    }
}
