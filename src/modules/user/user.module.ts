import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { PermissionGuard } from '../rbac/guards/permission.guard';
import { RBACModule } from '../rbac/rbac.module';

import { UserController } from './controllers/user.controller';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';

@Module({
    imports: [MikroOrmModule.forFeature([User]), RBACModule],
    controllers: [UserController],
    providers: [
        UserService,
        {
            provide: APP_GUARD,
            useClass: PermissionGuard,
        },
    ],
    exports: [UserService],
})
export class UserModule {}
