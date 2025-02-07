import { Collection, EntityClass, QueryOrderMap } from '@mikro-orm/core';
import { EntityManager, FilterQuery, QueryOrder } from '@mikro-orm/mysql';
import { Injectable, BadRequestException } from '@nestjs/common';

import { TreeNodeData } from '@/modules/core/types';
import { BaseTreeEntity } from '@/modules/database/base/base-tree.entity';

import { BaseService } from './base.service';

@Injectable()
export abstract class BaseTreeService<T extends BaseTreeEntity<T>> extends BaseService<T> {
    protected readonly MAX_DEPTH = 10; // 最大深度限制
    protected readonly PATH_SEPARATOR = '.'; // 路径分隔符

    constructor(
        protected readonly em: EntityManager,
        entity: EntityClass<T>,
    ) {
        super(em, entity);
    }

    /**
     * 获取树形结构
     */
    async findTree(): Promise<TreeNodeData[]> {
        const allNodes = await this.em.find(this.entity, {});
        const nodeMap = new Map<number, T>();

        allNodes.forEach((node) => {
            node.children = new Collection<T>(node);
            nodeMap.set(node.id, node);
        });

        const roots: T[] = [];
        allNodes.forEach((node) => {
            const parentId = node.parent?.id;
            if (!parentId || parentId === node.id || !nodeMap.has(parentId)) {
                node.parent = null;
                node.level = 0;
                roots.push(node);
            }
        });

        allNodes.forEach((node) => {
            const parentId = node.parent?.id;
            if (parentId && parentId !== node.id && nodeMap.has(parentId)) {
                const parent = nodeMap.get(parentId);
                parent.children.add(node);
                node.level = parent.level + 1;
            }
        });

        return this.convertToPlain(roots);
    }

    /**
     * 获取所有节点（扁平结构）
     */
    async findAll(): Promise<T[]> {
        return this.em.find(
            this.entity,
            {},
            { orderBy: { level: QueryOrder.ASC } as QueryOrderMap<T> },
        );
    }

    /**
     * 获取指定节点的子节点
     * @param parentId 父节点ID
     */
    async findChildren(parentId: number): Promise<T[]> {
        const parent = await this.findOne(parentId);
        const where = { parent } as unknown as FilterQuery<T>;
        return this.em.find(this.entity, where);
    }

    /**
     * 获取单个节点
     * @param id 节点ID
     */
    async findOne(id: number): Promise<T> {
        const node = await this.em.findOne(this.entity, { id } as FilterQuery<T>);
        if (!node) {
            throw new BadRequestException(`节点 #${id} 不存在`);
        }
        return node;
    }

    /**
     * 获取所有子孙节点
     */
    protected async getAllDescendants(nodeId: number): Promise<T[]> {
        const node = await this.findOne(nodeId);
        const where = {
            path: { $like: `${node.path}${this.PATH_SEPARATOR}%` },
        } as unknown as FilterQuery<T>;
        return this.em.find(this.entity, where);
    }

    /**
     * 获取节点的完整路径（从根节点到当前节点）
     */
    async getNodePath(id: number): Promise<T[]> {
        const node = await this.findOne(id);
        const pathIds = node.path.split(this.PATH_SEPARATOR).map(Number);
        const where = { id: { $in: pathIds } } as unknown as FilterQuery<T>;
        const orderBy = { level: QueryOrder.ASC } as QueryOrderMap<T>;
        return this.em.find(this.entity, where, { orderBy });
    }

    /**
     * 获取同级节点
     */
    async getSiblings(id: number): Promise<T[]> {
        const node = await this.findOne(id);
        const where = {
            parent: node.parent,
            id: { $ne: id },
        } as unknown as FilterQuery<T>;
        return this.em.find(this.entity, where);
    }

    /**
     * 检查节点是否是另一个节点的祖先
     */
    async isAncestor(ancestorId: number, descendantId: number): Promise<boolean> {
        const descendant = await this.findOne(descendantId);
        return descendant.path.includes(`${ancestorId}${this.PATH_SEPARATOR}`);
    }

    /**
     * 生成节点的物化路径
     */
    protected async generatePath(node: T, parentId?: number): Promise<string> {
        if (!parentId) {
            return String(node.id);
        }
        const parent = await this.findOne(parentId);
        return `${parent.path}${this.PATH_SEPARATOR}${node.id}`;
    }

    /**
     * 检查树的深度是否超出限制
     */
    protected checkDepth(path: string): void {
        const depth = path.split(this.PATH_SEPARATOR).length;
        if (depth > this.MAX_DEPTH) {
            throw new BadRequestException(`树的深度不能超过 ${this.MAX_DEPTH} 层`);
        }
    }

    /**
     * 转换为普通对象结构
     */
    protected convertToPlain(nodes: T[]): TreeNodeData[] {
        return nodes.map((node) => ({
            id: node.id,
            name: node.name,
            description: node.description,
            level: node.level,
            children: node.children.isInitialized()
                ? this.convertToPlain(node.children.getItems())
                : [],
            createdAt: node.createdAt,
            updatedAt: node.updatedAt,
            parentId: node.parent?.id ?? null,
        }));
    }
}
