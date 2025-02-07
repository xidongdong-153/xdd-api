import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { PermissionController } from './controllers/permission.controller';
import { RoleController } from './controllers/role.controller';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { PermissionGuard } from './guards/permission.guard';
import { PermissionService } from './services/permission.service';
import { RBACService } from './services/rbac.service';
import { RoleService } from './services/role.service';

@Module({
    imports: [MikroOrmModule.forFeature([Role, Permission])],
    controllers: [RoleController, PermissionController],
    providers: [RoleService, PermissionService, RBACService, PermissionGuard],
    exports: [RBACService, PermissionGuard],
})
export class RBACModule {}
