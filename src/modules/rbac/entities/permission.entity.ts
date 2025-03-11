import { Cascade, Collection, Entity, Enum, Index, ManyToMany, Property } from '@mikro-orm/core';
import { Exclude, Expose, Type, Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength, IsEnum, IsInt, Min } from 'class-validator';

import { BaseEntity } from '@/modules/database/base/base.entity';

import { Role } from './role.entity';

/**
 * 权限类型枚举
 */
export enum PermissionType {
    Menu = 'menu',
    Button = 'button',
    Api = 'api',
    Data = 'data',
}

/**
 * 权限实体类
 * @description 定义系统中的权限项，用于细粒度的权限控制
 */
@Entity()
@Index({ properties: ['code'] })
@Index({ properties: ['module', 'action'] })
@Index({ properties: ['type', 'parentId'] })
@Exclude()
export class Permission extends BaseEntity {
    /**
     * 权限编码
     * @remarks 权限的唯一标识符，通常采用 module:action 的格式
     * @example user:create
     */
    @Property({ unique: true })
    @IsNotEmpty({ message: '权限编码不能为空' })
    @IsString({ message: '权限编码必须是字符串' })
    @MaxLength(100, { message: '权限编码不能超过100个字符' })
    @Expose({ groups: ['permission-list', 'permission-detail', 'role-detail'] })
    code!: string;

    /**
     * 权限名称
     * @remarks 权限的显示名称，用于界面展示
     * @example 创建用户
     */
    @Property()
    @IsNotEmpty({ message: '权限名称不能为空' })
    @IsString({ message: '权限名称必须是字符串' })
    @MaxLength(50, { message: '权限名称不能超过50个字符' })
    @Expose({ groups: ['permission-list', 'permission-detail', 'role-detail'] })
    name!: string;

    /**
     * 权限描述
     * @remarks 对权限功能的详细说明
     * @example 允许创建新用户
     */
    @Property({ nullable: true })
    @IsOptional()
    @IsString({ message: '权限描述必须是字符串' })
    @MaxLength(200, { message: '权限描述不能超过200个字符' })
    @Expose({ groups: ['permission-list', 'permission-detail', 'role-detail'] })
    description?: string;

    /**
     * 所属模块
     * @remarks 权限所属的功能模块
     * @example user
     */
    @Property()
    @IsNotEmpty({ message: '权限模块不能为空' })
    @IsString({ message: '权限模块必须是字符串' })
    @MaxLength(50, { message: '权限模块不能超过50个字符' })
    @Expose({ groups: ['permission-list', 'permission-detail', 'role-detail'] })
    module!: string;

    /**
     * 操作类型
     * @remarks 权限对应的操作类型
     * @example create
     */
    @Property()
    @IsNotEmpty({ message: '操作类型不能为空' })
    @IsString({ message: '操作类型必须是字符串' })
    @MaxLength(50, { message: '操作类型不能超过50个字符' })
    @Expose({ groups: ['permission-list', 'permission-detail', 'role-detail'] })
    action!: string;

    /**
     * 权限类型
     */
    @Enum(() => PermissionType)
    @IsEnum(PermissionType, { message: '无效的权限类型' })
    @Expose({ groups: ['permission-list', 'permission-detail', 'role-detail'] })
    type: PermissionType = PermissionType.Api;

    /**
     * 父权限ID
     */
    @Property({ nullable: true })
    @IsOptional()
    @IsString({ message: '父权限ID必须是字符串' })
    @Expose({ groups: ['permission-list', 'permission-detail', 'role-detail'] })
    parentId?: string;

    /**
     * 排序值
     */
    @Property({ default: 0 })
    @IsInt({ message: '排序值必须是整数' })
    @Min(0, { message: '排序值不能小于0' })
    @Expose({ groups: ['permission-list', 'permission-detail', 'role-detail'] })
    sort: number = 0;

    /**
     * 权限图标
     */
    @Property({ nullable: true })
    @IsOptional()
    @IsString({ message: '图标必须是字符串' })
    @MaxLength(50, { message: '图标不能超过50个字符' })
    @Expose({ groups: ['permission-list', 'permission-detail', 'role-detail'] })
    icon?: string;

    /**
     * 前端路由路径
     */
    @Property({ nullable: true })
    @IsOptional()
    @IsString({ message: '路径必须是字符串' })
    @MaxLength(200, { message: '路径不能超过200个字符' })
    @Expose({ groups: ['permission-list', 'permission-detail', 'role-detail'] })
    path?: string;

    /**
     * 组件路径
     */
    @Property({ nullable: true })
    @IsOptional()
    @IsString({ message: '组件路径必须是字符串' })
    @MaxLength(200, { message: '组件路径不能超过200个字符' })
    @Expose({ groups: ['permission-list', 'permission-detail', 'role-detail'] })
    component?: string;

    /**
     * 关联角色列表
     * @remarks 拥有该权限的所有角色集合
     * @type {Collection<Role>}
     */
    @ManyToMany(() => Role, (role) => role.permissions, {
        cascade: [Cascade.PERSIST],
    })
    @Type(() => Role)
    @Expose({ groups: ['permission-detail'] })
    @Transform(({ value }) => {
        if (value && value.isInitialized()) {
            return value.getItems();
        }
        return [];
    })
    roles = new Collection<Role>(this);
}
