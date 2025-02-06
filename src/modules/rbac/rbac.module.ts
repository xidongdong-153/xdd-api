import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RoleService } from './services/role.service';
import { PermissionService } from './services/permission.service';
import { RBACService } from './services/rbac.service';
import { RoleController } from './controllers/role.controller';
import { PermissionController } from './controllers/permission.controller';
import { PermissionGuard } from './guards/permission.guard';

@Module({
    imports: [MikroOrmModule.forFeature([Role, Permission])],
    controllers: [RoleController, PermissionController],
    providers: [RoleService, PermissionService, RBACService, PermissionGuard],
    exports: [RBACService, PermissionGuard],
})
export class RBACModule {}
