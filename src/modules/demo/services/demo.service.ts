import { EntityManager, FilterQuery } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';

import { BaseService } from '@/modules/database/base/base.service';
import { PaginateReturn } from '@/modules/database/types';
import { CreateDemoDto, UpdateDemoDto, PageDemoDto } from '@/modules/demo/dtos/demo.dto';
import { Demo } from '@/modules/demo/entities/demo.entity';

@Injectable()
export class DemoService extends BaseService<Demo> {
    constructor(protected readonly em: EntityManager) {
        super(em, Demo);
    }

    /**
     * 创建演示数据
     * @param dto 创建数据传输对象
     */
    async create(dto: CreateDemoDto): Promise<Demo> {
        const demo = this.em.create(Demo, dto);
        await this.em.persistAndFlush(demo);
        return demo;
    }

    /**
     * 更新演示数据
     * @param id 记录ID
     * @param dto 更新数据传输对象
     */
    async update(id: number, dto: UpdateDemoDto): Promise<Demo> {
        const demo = await this.detail(id);
        this.em.assign(demo, dto);
        await this.em.persistAndFlush(demo);
        return demo;
    }

    async paginate(options: PageDemoDto): Promise<PaginateReturn<Demo>> {
        const { page = 1, limit = 10, keyword, startTime, endTime } = options;

        // 构建查询条件
        const where: FilterQuery<Demo> = {};

        // 关键字搜索
        if (keyword) {
            where.name = { $like: `%${keyword}%` };
        }

        // 时间范围查询
        if (startTime || endTime) {
            where.createdAt = {};
            if (startTime) {
                where.createdAt.$gte = startTime;
            }
            if (endTime) {
                where.createdAt.$lte = endTime;
            }
        }

        return super.paginate({
            page,
            limit,
            where,
        });
    }
}
