import { Cascade, Collection, Entity, ManyToMany, Property, Index } from '@mikro-orm/core';
import { Exclude, Expose, Type, Transform } from 'class-transformer';
import {
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    IsBoolean,
    Min,
    IsInt,
} from 'class-validator';

import { BaseEntity } from '@/modules/database/base/base.entity';
import { User } from '@/modules/user/entities/user.entity';

import { Permission } from './permission.entity';

/**
 * 角色实体类
 * @description 定义系统中的角色，用于管理用户权限
 */
@Entity()
@Index({ properties: ['code'] })
@Index({ properties: ['name'] })
@Exclude()
export class Role extends BaseEntity {
    /**
     * 角色编码
     * @remarks 角色的唯一标识符，用于程序引用
     * @example ROLE_ADMIN
     */
    @Property({ unique: true })
    @IsNotEmpty({ message: '角色编码不能为空' })
    @IsString({ message: '角色编码必须是字符串' })
    @MaxLength(50, { message: '角色编码不能超过50个字符' })
    @Expose({ groups: ['role-list', 'role-detail', 'user-detail'] })
    code!: string;

    /**
     * 角色名称
     * @remarks 角色的显示名称
     * @example 管理员
     */
    @Property()
    @IsNotEmpty({ message: '角色名称不能为空' })
    @IsString({ message: '角色名称必须是字符串' })
    @MaxLength(50, { message: '角色名称不能超过50个字符' })
    @Expose({ groups: ['role-list', 'role-detail', 'user-detail'] })
    name!: string;

    /**
     * 角色描述
     * @remarks 对角色用途和职责的详细说明
     * @example 系统管理员角色，拥有所有系统权限
     */
    @Property({ nullable: true })
    @IsOptional()
    @IsString({ message: '角色描述必须是字符串' })
    @MaxLength(200, { message: '角色描述不能超过200个字符' })
    @Expose({ groups: ['role-detail', 'user-detail'] })
    description?: string;

    /**
     * 父角色ID
     * @remarks 用于构建角色层级关系
     */
    @Property({ nullable: true })
    @IsOptional()
    @IsString({ message: '父角色ID必须是字符串' })
    @Expose({ groups: ['role-list', 'role-detail', 'user-detail'] })
    parentId?: string;

    /**
     * 排序值
     * @remarks 用于角色列表的排序显示
     */
    @Property({ default: 0 })
    @IsInt({ message: '排序值必须是整数' })
    @Min(0, { message: '排序值不能小于0' })
    @Expose({ groups: ['role-list', 'role-detail', 'user-detail'] })
    sort: number = 0;

    /**
     * 是否启用
     * @remarks 控制角色是否可用
     */
    @Property({ default: true })
    @IsBoolean({ message: '启用状态必须是布尔值' })
    @Expose({ groups: ['role-list', 'role-detail', 'user-detail'] })
    isEnabled: boolean = true;

    /**
     * 系统角色标志
     * @remarks 标识该角色是否为系统内置角色，系统内置角色不可删除
     * @example false
     */
    @Property({ default: false })
    @IsBoolean({ message: '系统角色标志必须是布尔值' })
    @Expose({ groups: ['role-list', 'role-detail', 'user-detail'] })
    isSystem: boolean = false;

    /**
     * 角色权限列表
     * @remarks 该角色所拥有的所有权限集合
     * @type {Collection<Permission>}
     */
    @ManyToMany(() => Permission, (permission) => permission.roles, {
        cascade: [Cascade.PERSIST],
        owner: true,
    })
    @Type(() => Permission)
    @Expose({
        groups: ['role-detail'],
        toPlainOnly: true,
    })
    @Transform(({ value }) => {
        if (value && value.isInitialized()) {
            return value.getItems();
        }
        return [];
    })
    permissions = new Collection<Permission>(this);

    /**
     * 角色用户列表
     * @remarks 拥有该角色的所有用户集合
     * @type {Collection<User>}
     */
    @ManyToMany(() => User, (user) => user.roles, {
        cascade: [Cascade.PERSIST],
    })
    @Type(() => User)
    @Expose({
        groups: ['role-detail'],
        toPlainOnly: true,
    })
    @Transform(({ value }) => {
        if (value && value.isInitialized()) {
            return value.getItems();
        }
        return [];
    })
    users = new Collection<User>(this);
}
