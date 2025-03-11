import { Cascade, Collection, Entity, Enum, Index, ManyToMany, Property } from '@mikro-orm/core';
import { Exclude, Expose, Type, Transform } from 'class-transformer';
import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    MinLength,
    Min,
} from 'class-validator';

import { BaseEntity } from '@/modules/database/base/base.entity';
import { Role } from '@/modules/rbac/entities/role.entity';

/**
 * 用户状态枚举
 */
export enum UserStatus {
    Active = 'active',
    Inactive = 'inactive',
    Locked = 'locked',
    PendingVerification = 'pending_verification',
    Suspended = 'suspended',
}

/**
 * 用户实体类
 * @description 系统用户的实体定义，包含用户的基本信息和权限关联
 */
@Exclude()
@Entity()
@Index({ properties: ['username'] })
@Index({ properties: ['email'] })
@Index({ properties: ['phoneNumber'] })
export class User extends BaseEntity {
    /**
     * 用户名
     * @remarks 用户登录时使用的唯一标识符
     * @example john_doe
     */
    @Property({ unique: true })
    @IsNotEmpty({ message: '用户名不能为空' })
    @IsString({ message: '用户名必须是字符串' })
    @MinLength(3, { message: '用户名长度不能小于3个字符' })
    @MaxLength(50, { message: '用户名长度不能超过50个字符' })
    @Expose({ groups: ['user-list', 'user-detail', 'role-detail'] })
    username!: string;

    /**
     * 用户昵称
     * @remarks 用户的昵称，用于显示在用户界面
     * @example John Doe
     */
    @Property()
    @IsNotEmpty({ message: '昵称不能为空' })
    @IsString({ message: '昵称必须是字符串' })
    @MaxLength(50, { message: '昵称长度不能超过50个字符' })
    @Expose({ groups: ['user-list', 'user-detail', 'role-detail'] })
    nickname!: string;

    /**
     * 用户头像
     * @remarks 用户的头像URL，用于显示在用户界面
     * @example https://example.com/avatar.jpg
     */
    @Property({ nullable: true })
    @IsOptional()
    @IsUrl({}, { message: '头像URL格式不正确' })
    @MaxLength(255, { message: '头像URL长度不能超过255个字符' })
    @Expose({ groups: ['user-list', 'user-detail', 'role-detail'] })
    avatar?: string;

    /**
     * 用户密码
     * @remarks 经过加密存储的用户密码
     * @example ********
     */
    @Property()
    @IsNotEmpty({ message: '密码不能为空' })
    @IsString({ message: '密码必须是字符串' })
    @MinLength(6, { message: '密码长度不能小于6个字符' })
    password!: string;

    /**
     * 电子邮箱
     * @remarks 用户的唯一邮箱地址，用于通知和找回密码
     * @example john@example.com
     */
    @Property({ unique: true })
    @IsNotEmpty({ message: '邮箱不能为空' })
    @IsEmail({}, { message: '请输入有效的邮箱地址' })
    @Expose({ groups: ['user-list', 'user-detail', 'role-detail'] })
    email!: string;

    /**
     * 邮箱验证状态
     * @remarks 表示用户的邮箱是否已经通过验证
     * @example true
     */
    @Property({ default: false })
    @Expose({ groups: ['user-list', 'user-detail', 'role-detail'] })
    isEmailVerified: boolean = false;

    /**
     * 手机号码
     * @remarks 用户的手机号码，用于通知和找回密码
     * @example +14155552671
     */
    @Property({ nullable: true, unique: true })
    @IsOptional()
    @Expose({ groups: ['user-list', 'user-detail', 'role-detail'] })
    phoneNumber?: string;

    /**
     * 用户状态
     * @remarks 表示用户当前的状态，默认为待验证状态
     * @example UserStatus.PendingVerification
     */
    @Property({ type: 'string' })
    @Enum(() => UserStatus)
    @IsEnum(UserStatus, { message: '无效的用户状态' })
    @Expose({ groups: ['user-list', 'user-detail', 'role-detail'] })
    status: UserStatus = UserStatus.PendingVerification;

    /**
     * 登录尝试次数
     * @remarks 记录用户登录尝试的次数
     * @example 0
     */
    @Property({ default: 0 })
    @Min(0, { message: '登录尝试次数不能为负数' })
    @Expose({ groups: ['user-detail'] })
    loginAttempts: number = 0;

    /**
     * 最后登录时间
     * @remarks 记录用户最后一次成功登录的时间
     * @example 2024-03-20T12:00:00Z
     */
    @Property({ nullable: true })
    @Expose({ groups: ['user-list', 'user-detail'] })
    lastLoginAt?: Date;

    /**
     * 最后密码更改时间
     * @remarks 记录用户最后一次更改密码的时间
     * @example 2024-03-20T12:00:00Z
     */
    @Property({ nullable: true })
    @Expose({ groups: ['user-detail'] })
    lastPasswordChange?: Date;

    /**
     * 用户角色列表
     * @remarks 用户所拥有的所有角色集合
     * @type {Collection<Role>}
     */
    @ManyToMany(() => Role, (role) => role.users, {
        cascade: [Cascade.PERSIST],
        owner: true,
    })
    @Type(() => Role)
    @Expose({
        groups: ['user-detail'],
        toPlainOnly: true,
    })
    @Transform(({ value }) => {
        if (value && value.isInitialized()) {
            return value.getItems();
        }
        return [];
    })
    roles = new Collection<Role>(this);
}
