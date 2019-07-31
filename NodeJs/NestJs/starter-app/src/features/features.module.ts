import { Module } from '@nestjs/common';

import { UsersController } from './Users/users.controller';
import { UsersService } from './Users/users.service';

@Module({
    imports: [],
    controllers: [
        UsersController
    ],
    providers: [
        UsersService
    ],
  })
  export class FeaturesModule {}