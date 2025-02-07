import { Collection, Entity, Enum, ManyToMany, Property } from '@mikro-orm/core';

import { Exclude, Expose, Type } from 'class-transformer';

import { BaseEntity } from '@/modules/database/base/base.entity';

import { Role } from '@/modules/rbac/entities/role.entity';

import { UserStatus } from '../constants/user.enum';

/**
 * 用户实体类
 * @description 系统用户的实体定义，包含用户的基本信息和权限关联
 */
@Entity()
export class User extends BaseEntity {
    /**
     * 用户名
     * @remarks 用户登录时使用的唯一标识符
     * @example john_doe
     */
    @Property({ unique: true })
    username!: string;

    /**
     * 用户密码
     * @remarks 经过加密存储的用户密码
     * @example ********
     */
    @Property()
    @Exclude()
    password!: string;

    /**
     * 电子邮箱
     * @remarks 用户的唯一邮箱地址，用于通知和找回密码
     * @example john@example.com
     */
    @Property({ unique: true })
    email!: string;

    /**
     * 用户状态
     * @remarks 表示用户当前的状态，默认为激活状态
     * @example UserStatus.Active
     */
    @Enum(() => UserStatus)
    status: UserStatus = UserStatus.Active;

    /**
     * 用户角色列表
     * @remarks 用户所拥有的所有角色集合
     * @type {Collection<Role>}
     */
    @ManyToMany(() => Role)
    @Type(() => Role)
    @Expose({
        groups: ['user-detail'],
        toPlainOnly: true,
    })
    roles = new Collection<Role>(this);

    /**
     * 最后登录时间
     * @remarks 记录用户最后一次成功登录的时间
     * @example 2024-03-20T12:00:00Z
     */
    @Property({ nullable: true, default: null })
    lastLoginAt?: Date | null;

    constructor() {
        super();
        this.roles = new Collection<Role>(this);
    }
}
