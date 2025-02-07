import { EntityManager, FilterQuery, FindOptions, EntityClass } from '@mikro-orm/core';
import { Injectable, NotFoundException } from '@nestjs/common';

import { BaseEntity } from '@/modules/database/base/base.entity';
import { PaginateOptions, PaginateReturn, PaginateMeta } from '@/modules/database/types';

/**
 * 基础服务类
 * @description 提供基础的查询服务
 * @template T - Entity类型，必须继承自BaseEntity
 */
@Injectable()
export abstract class BaseService<T extends BaseEntity> {
    constructor(
        protected readonly em: EntityManager,
        protected entity: EntityClass<T>,
    ) {}

    /**
     * 获取所有数据
     * @param conditions 查询条件
     * @param options 查询选项
     */
    async list(conditions: FilterQuery<T> = {}, options: FindOptions<T> = {}): Promise<T[]> {
        return this.em.find(this.entity, conditions, options);
    }

    /**
     * 获取分页数据
     * @param options 分页选项
     */
    async paginate(
        options: PaginateOptions & { where?: FilterQuery<T> },
    ): Promise<PaginateReturn<T>> {
        const { page = 1, limit = 10, where = {}, ...filter } = options;
        const offset = (page - 1) * limit;

        const [items, totalItems] = await this.em.findAndCount(
            this.entity,
            { ...where, ...filter },
            { limit, offset },
        );
        const totalPages = Math.ceil(totalItems / limit);

        const meta: PaginateMeta = {
            itemCount: items.length,
            totalItems,
            perPage: limit,
            totalPages,
            currentPage: page,
        };

        return { items, meta };
    }

    /**
     * 获取详情
     * @param id 记录ID
     */
    async detail(id: number): Promise<T> {
        const entity = await this.em.findOne(this.entity, { id } as FilterQuery<T>);
        if (!entity) {
            throw new NotFoundException(`Entity with ID ${id} not found`);
        }
        return entity;
    }

    /**
     * 创建记录
     * @param dto 创建数据
     */
    abstract create(dto: Record<string, any>): Promise<T>;

    /**
     * 更新记录
     * @param id 记录ID
     * @param dto 更新数据
     */
    abstract update(id: number, dto: Record<string, any>): Promise<T>;

    /**
     * 删除记录
     * @param id 记录ID
     */
    async remove(id: number): Promise<void> {
        const entity = await this.em.findOne(this.entity, { id } as FilterQuery<T>);
        if (!entity) {
            throw new NotFoundException(`Entity with ID ${id} not found`);
        }
        await this.em.removeAndFlush(entity);
    }
}
