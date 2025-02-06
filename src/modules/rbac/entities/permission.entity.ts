import { Collection, Entity, ManyToMany, Property } from '@mikro-orm/core';
import { BaseEntity } from '@/modules/database/base/base.entity';
import { Role } from './role.entity';

/**
 * 权限实体类
 * @description 定义系统中的权限项，用于细粒度的权限控制
 */
@Entity()
export class Permission extends BaseEntity {
    /**
     * 权限编码
     * @remarks 权限的唯一标识符，通常采用 module:action 的格式
     * @example user:create
     */
    @Property({ unique: true })
    code!: string;

    /**
     * 权限名称
     * @remarks 权限的显示名称，用于界面展示
     * @example 创建用户
     */
    @Property()
    name!: string;

    /**
     * 权限描述
     * @remarks 对权限功能的详细说明
     * @example 允许创建新用户
     */
    @Property()
    description?: string;

    /**
     * 所属模块
     * @remarks 权限所属的功能模块
     * @example user
     */
    @Property()
    module!: string;

    /**
     * 操作类型
     * @remarks 权限对应的操作类型
     * @example create
     */
    @Property()
    action!: string;

    /**
     * 关联角色列表
     * @remarks 拥有该权限的所有角色集合
     * @type {Collection<Role>}
     */
    @ManyToMany(() => Role, (role) => role.permissions)
    roles = new Collection<Role>(this);
}
