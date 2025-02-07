import { EntityManager } from '@mikro-orm/mysql';
import { Injectable, BadRequestException } from '@nestjs/common';

import { BaseTreeService } from '@/modules/database/base/base-tree.service';
import { CreateDemoTreeDto, UpdateDemoTreeDto } from '@/modules/demo/dtos/demo.dto';
import { DemoTree } from '@/modules/demo/entities/demo-tree.entity';

@Injectable()
export class DemoTreeService extends BaseTreeService<DemoTree> {
    constructor(protected readonly em: EntityManager) {
        super(em, DemoTree);
    }

    /**
     * 创建节点
     * @param dto 创建节点的数据
     * @returns 返回创建的节点
     */
    async create(dto: CreateDemoTreeDto) {
        const node = this.em.create(DemoTree, {
            name: dto.name,
            description: dto.description,
            level: 0,
        });

        await this.em.persistAndFlush(node);
        node.path = await this.generatePath(node, dto.parentId);
        this.checkDepth(node.path);

        if (dto.parentId) {
            if (node.id === dto.parentId) {
                throw new BadRequestException('节点不能将自己设为父节点');
            }
            const parent = await this.findOne(dto.parentId);
            node.parent = parent;
            node.level = parent.level + 1;
        }

        await this.em.persistAndFlush(node);
        return this.findOne(node.id);
    }

    /**
     * 更新节点
     * @param id 节点ID
     * @param dto 更新的数据
     * @returns 返回更新后的节点
     */
    async update(id: number, dto: UpdateDemoTreeDto) {
        const node = await this.findOne(id);

        if (dto.name !== undefined) node.name = dto.name;
        if (dto.description !== undefined) node.description = dto.description;

        if (dto.parentId !== undefined) {
            if (id === dto.parentId) {
                throw new BadRequestException('节点不能将自己设为父节点');
            }

            const descendants = await this.getAllDescendants(id);
            if (dto.parentId === null) {
                node.parent = null;
                node.level = 0;
                node.path = String(node.id);
            } else {
                const parent = await this.findOne(dto.parentId);
                if (descendants.some((d) => d.id === dto.parentId)) {
                    throw new BadRequestException('不能将节点移动到其子节点下');
                }
                node.parent = parent;
                node.level = parent.level + 1;
                node.path = await this.generatePath(node, dto.parentId);
                this.checkDepth(node.path);
            }

            // 更新所有子孙节点的路径和层级
            for (const descendant of descendants) {
                const relativePathPart = descendant.path.substring(node.path.length);
                descendant.path = node.path + relativePathPart;
                descendant.level = descendant.path.split(this.PATH_SEPARATOR).length - 1;
                this.checkDepth(descendant.path);
            }
        }

        await this.em.persistAndFlush(node);
        return this.findOne(node.id);
    }

    /**
     * 批量删除节点
     * @param ids 要删除的节点ID数组
     */
    async batchRemove(ids: number[]): Promise<void> {
        for (const id of ids) {
            await this.remove(id);
        }
    }
}
