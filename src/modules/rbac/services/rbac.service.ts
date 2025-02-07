import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';

import { User } from '@/modules/user/entities/user.entity';

@Injectable()
export class RBACService {
    constructor(private readonly em: EntityManager) {}

    async checkPermissions(userId: number, permissions: string[]): Promise<boolean> {
        const user = await this.em.findOne(
            User,
            { id: userId },
            {
                populate: ['roles.permissions'],
            },
        );

        if (!user) {
            return false;
        }

        const userPermissions = user.roles
            .getItems()
            .flatMap((role) => role.permissions.getItems())
            .map((permission) => permission.code);

        return permissions.every((permission) => userPermissions.includes(permission));
    }
}
