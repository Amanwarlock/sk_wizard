import { Injectable } from '@nestjs/common';
import { UsersDTO } from './users.dto';

import *  as _ from 'lodash';

@Injectable()
export class UsersService {

    userList = [
        {
            userId: 'USR100',
            name: 'Aman',
            contactNo: '8050913325',
            email: 'aman.kareem@storeking.in'
        },
        {
            userId: 'USR200',
            name: 'Nagarathna',
            contactNo: '7829463181',
            email: 'nagu.r@storeking.in'
        },
        {
            userId: 'USR300',
            name: 'Shylesh',
            contactNo: '9113033298',
            email: 'shylesh.selvam@storeking.in'
        },
        {
            userId: 'USR400',
            name: 'Mamatha',
            contactNo: '9980785026',
            email: 'mamatha.k@storeking.in'
        }
    ];


    getUsers(): UsersDTO[] {
        return this.userList;
    }

    getUserById(id: String): UsersDTO {
        return <UsersDTO>_.find(this.userList, { userId: id });
    }
}
