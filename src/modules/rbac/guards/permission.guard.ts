import {
    Injectable,
    CanActivate,
    ExecutionContext,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PERMISSIONS_KEY } from '../decorators/requires-permissions.decorator';
import { RBACService } from '../services/rbac.service';

@Injectable()
export class PermissionGuard implements CanActivate {
    private readonly logger = new Logger(PermissionGuard.name);

    constructor(
        private reflector: Reflector,
        private rbacService: RBACService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const permissions = this.reflector.get<string[]>(PERMISSIONS_KEY, context.getHandler());

        this.logger.debug(`Required permissions: ${JSON.stringify(permissions)}`);

        if (!permissions) {
            this.logger.debug('No permissions required for this route');
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        this.logger.debug(`Request headers: ${JSON.stringify(request.headers)}`);
        this.logger.debug(`Request user object: ${JSON.stringify(user)}`);

        if (!user) {
            this.logger.warn('No user found in request, permission check failed');
            throw new UnauthorizedException('未获取到用户信息，请确保已登录');
        }

        this.logger.debug(`Checking permissions for user ID: ${user.id}`);
        const hasPermission = await this.rbacService.checkPermissions(user.id, permissions);

        this.logger.debug(`Permission check result for user ${user.id}: ${hasPermission}`);
        return hasPermission;
    }
}
