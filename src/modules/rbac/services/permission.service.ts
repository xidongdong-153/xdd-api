import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Permission } from '../entities/permission.entity';
import { BaseService } from '@/modules/database/base/base.service';
import { CreatePermissionDto, UpdatePermissionDto, QueryPermissionDto } from '../dtos/rbac.dto';

@Injectable()
export class PermissionService extends BaseService<Permission> {
    constructor(protected readonly em: EntityManager) {
        super(em, Permission);
    }

    async create(dto: CreatePermissionDto): Promise<Permission> {
        const permission = new Permission();
        permission.code = dto.code;
        permission.name = dto.name;
        permission.description = dto.description;
        permission.module = dto.module;
        permission.action = dto.action;

        await this.em.persistAndFlush(permission);
        return permission;
    }

    async update(id: number, dto: UpdatePermissionDto): Promise<Permission> {
        const permission = await this.detail(id);

        if (dto.code) permission.code = dto.code;
        if (dto.name) permission.name = dto.name;
        if (dto.description) permission.description = dto.description;
        if (dto.module) permission.module = dto.module;
        if (dto.action) permission.action = dto.action;

        await this.em.flush();
        return permission;
    }

    async findByQuery(query: QueryPermissionDto) {
        const where: any = {};

        if (query.code) {
            where.code = { $like: `%${query.code}%` };
        }

        if (query.module) {
            where.module = query.module;
        }

        return this.list(where);
    }
}
