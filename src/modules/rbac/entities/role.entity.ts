import { Collection, Entity, ManyToMany, Property } from '@mikro-orm/core';

import { Expose, Type } from 'class-transformer';

import { BaseEntity } from '@/modules/database/base/base.entity';

import { User } from '@/modules/user/entities/user.entity';

import { Permission } from './permission.entity';

/**
 * 角色实体类
 * @description 定义系统中的角色，用于管理用户权限
 */
@Entity()
export class Role extends BaseEntity {
    /**
     * 角色名称
     * @remarks 角色的显示名称
     * @example 管理员
     */
    @Property()
    name!: string;

    /**
     * 角色描述
     * @remarks 对角色用途和职责的详细说明
     * @example 系统管理员角色，拥有所有系统权限
     */
    @Property({ nullable: true })
    description?: string;

    /**
     * 系统角色标志
     * @remarks 标识该角色是否为系统内置角色，系统内置角色不可删除
     * @example false
     */
    @Property({ default: false })
    isSystem: boolean = false;

    /**
     * 角色权限列表
     * @remarks 该角色所拥有的所有权限集合
     * @type {Collection<Permission>}
     */
    @ManyToMany(() => Permission)
    @Type(() => Permission)
    @Expose({
        groups: ['role-detail'],
        toPlainOnly: true,
    })
    permissions = new Collection<Permission>(this);

    /**
     * 角色用户列表
     * @remarks 拥有该角色的所有用户集合
     * @type {Collection<User>}
     */
    @ManyToMany(() => User, (user) => user.roles)
    @Type(() => User)
    @Expose({
        groups: ['role-detail'],
        toPlainOnly: true,
    })
    users = new Collection<User>(this);

    constructor() {
        super();
        this.permissions = new Collection<Permission>(this);
        this.users = new Collection<User>(this);
    }
}
