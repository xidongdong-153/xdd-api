import { EntityManager } from '@mikro-orm/core';
import { Injectable, NotFoundException } from '@nestjs/common';

import { BaseService } from '@/modules/database/base/base.service';

import { CreateRoleDto, UpdateRoleDto, QueryRoleDto, AssignPermissionsDto } from '../dtos/rbac.dto';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleService extends BaseService<Role> {
    constructor(protected readonly em: EntityManager) {
        super(em, Role);
    }

    async create(dto: CreateRoleDto): Promise<Role> {
        const role = new Role();
        role.name = dto.name;
        role.description = dto.description;

        if (dto.permissions?.length) {
            const permissions = await this.em.find(Permission, { id: { $in: dto.permissions } });
            role.permissions.set(permissions);
        }

        await this.em.persistAndFlush(role);
        return role;
    }

    async update(id: number, dto: UpdateRoleDto): Promise<Role> {
        const role = await this.detail(id);

        if (dto.name) role.name = dto.name;
        if (dto.description) role.description = dto.description;

        if (dto.permissions) {
            const permissions = await this.em.find(Permission, { id: { $in: dto.permissions } });
            role.permissions.set(permissions);
        }

        await this.em.flush();
        return role;
    }

    async findByQuery(query: QueryRoleDto) {
        const where: any = {};

        if (query.name) {
            where.name = { $like: `%${query.name}%` };
        }

        return this.list(where);
    }

    async assignPermissions(id: number, dto: AssignPermissionsDto): Promise<Role> {
        const role = await this.detail(id);
        const permissions = await this.em.find(Permission, { id: { $in: dto.permissions } });

        if (permissions.length !== dto.permissions.length) {
            throw new NotFoundException('部分权限不存在');
        }

        role.permissions.set(permissions);
        await this.em.flush();
        return role;
    }
}
