import { Property, Entity } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

import { BaseEntity } from './base.entity';

@Entity({ abstract: true })
@Exclude()
export abstract class BaseTreeEntity<T extends BaseTreeEntity<T>> extends BaseEntity {
    /**
     * 节点名称
     */
    @Expose()
    @ApiProperty({ description: '节点名称' })
    @Property({ comment: '节点名称' })
    name!: string;

    /**
     * 节点描述
     */
    @Expose()
    @ApiProperty({ description: '节点描述', required: false })
    @Property({ comment: '节点描述', nullable: true })
    description?: string;

    /**
     * 层级
     */
    @Expose()
    @ApiProperty({ description: '节点层级', default: 0 })
    @Property({ comment: '层级', default: 0, index: true })
    level: number = 0;

    /**
     * 物化路径
     */
    @Expose()
    @ApiProperty({ description: '物化路径' })
    @Property({ comment: '物化路径', length: 255, index: true })
    path: string = '';

    /**
     * 父节点
     */
    @ApiHideProperty()
    abstract parent?: T;

    /**
     * 子节点集合
     */
    @ApiHideProperty()
    abstract children: Collection<T>;

    /**
     * 获取父节点ID
     */
    @Expose()
    @ApiProperty({ description: '父节点ID', required: false, type: 'number', nullable: true })
    get parentId(): number | null {
        return this.parent?.id ?? null;
    }
}
