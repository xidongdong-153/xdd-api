import { EntityManager } from '@mikro-orm/core';
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

import { BaseService } from '@/modules/database/base/base.service';
import { QueryUserDto } from '@/modules/user/dtos/user.dto';
import { User } from '@/modules/user/entities/user.entity';

import { AssignPermissionsDto } from '../dtos/permission.dto';
import { CreateRoleDto, UpdateRoleDto, QueryRoleDto } from '../dtos/role.dto';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleService extends BaseService<Role> {
    constructor(protected readonly em: EntityManager) {
        super(em, Role);
    }

    async detail(id: number): Promise<Role> {
        const role = await this.em.findOne(
            Role,
            { id },
            {
                populate: ['permissions', 'users'],
            },
        );

        if (!role) {
            throw new NotFoundException(`角色 ID ${id} 不存在`);
        }

        return role;
    }

    async create(dto: CreateRoleDto): Promise<Role> {
        // 检查角色编码是否已存在
        const exists = await this.em.findOne(Role, { code: dto.code });
        if (exists) {
            throw new ConflictException('角色编码已存在');
        }

        const role = new Role();
        role.code = dto.code;
        role.name = dto.name;
        role.description = dto.description;
        role.parentId = dto.parentId;
        role.sort = dto.sort ?? 0;
        role.isEnabled = dto.isEnabled ?? true;
        role.isSystem = dto.isSystem ?? false;

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

        const { page, limit } = query;
        return this.paginate({
            page,
            limit,
            where,
            populate: ['permissions'],
        });
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

    /**
     * 获取角色下的用户列表
     */
    async getRoleUsers(id: number, query: QueryUserDto) {
        const role = await this.em.findOne(Role, { id }, { populate: ['users'] });
        if (!role) {
            throw new NotFoundException(`角色 ID ${id} 不存在`);
        }

        const { page = 1, limit = 10 } = query;
        const offset = (page - 1) * limit;
        const users = role.users.getItems();

        const items = users.slice(offset, offset + limit);
        const totalItems = users.length;
        const totalPages = Math.ceil(totalItems / limit);

        const meta = {
            itemCount: items.length,
            totalItems,
            perPage: limit,
            totalPages,
            currentPage: page,
        };

        return { items, meta };
    }

    /**
     * 为角色添加用户
     */
    async addUsersToRole(id: number, userIds: number[]): Promise<Role> {
        const role = await this.em.findOne(Role, { id }, { populate: ['users'] });
        if (!role) {
            throw new NotFoundException(`角色 ID ${id} 不存在`);
        }

        const users = await this.em.find(User, { id: { $in: userIds } });
        if (users.length !== userIds.length) {
            throw new NotFoundException('部分用户不存在');
        }

        users.forEach((user) => {
            if (!role.users.contains(user)) {
                role.users.add(user);
            }
        });

        await this.em.flush();
        return role;
    }

    /**
     * 从角色中移除用户
     */
    async removeUsersFromRole(id: number, userIds: number[]): Promise<void> {
        const role = await this.em.findOne(Role, { id }, { populate: ['users'] });
        if (!role) {
            throw new NotFoundException(`角色 ID ${id} 不存在`);
        }

        const users = role.users.getItems().filter((user) => userIds.includes(user.id));
        users.forEach((user) => {
            role.users.remove(user);
        });

        await this.em.flush();
    }
}
