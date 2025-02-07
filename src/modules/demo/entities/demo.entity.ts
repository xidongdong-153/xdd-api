import { Entity, Property } from '@mikro-orm/core';
import { Exclude, Expose } from 'class-transformer';

import { BaseEntity } from '@/modules/database/base/base.entity';

/**
 * Demo 实体类
 * @description 用于演示的数据实体，包含基础的 CRUD 操作示例
 */
@Exclude()
@Entity()
export class Demo extends BaseEntity {
    /**
     * 名称
     * @remarks 实体的唯一名称标识
     * @example "测试名称"
     */
    @Expose()
    @Property({ comment: '名称', unique: true })
    name!: string;

    /**
     * 描述
     * @remarks 可选的描述信息
     * @example "这是一段描述文本"
     */
    @Expose()
    @Property({ comment: '描述', nullable: true })
    description?: string;
}
