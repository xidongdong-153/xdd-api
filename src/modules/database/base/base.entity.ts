import { PrimaryKey, Property } from '@mikro-orm/core';
import { Expose } from 'class-transformer';

/**
 * 基础实体类
 * @description 提供基础的实体类
 */
export abstract class BaseEntity {
    /**
     * 主键ID
     * @remarks 主键ID，自动生成
     */
    @Expose()
    @PrimaryKey()
    id!: number;

    /**
     * 创建时间
     * @remarks 记录创建的时间戳，自动设置
     */
    @Expose()
    @Property()
    createdAt: Date = new Date();

    /**
     * 更新时间
     * @remarks 记录更新的时间戳，自动更新
     */
    @Expose()
    @Property({ onUpdate: () => new Date() })
    updatedAt: Date = new Date();
}
