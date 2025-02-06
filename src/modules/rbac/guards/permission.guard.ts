import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/requires-permissions.decorator';
import { RBACService } from '../services/rbac.service';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private rbacService: RBACService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const permissions = this.reflector.get<string[]>(PERMISSIONS_KEY, context.getHandler());

        if (!permissions) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        return this.rbacService.checkPermissions(user.id, permissions);
    }
}
