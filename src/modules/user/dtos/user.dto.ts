import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MinLength,
    MaxLength,
    IsUrl,
    IsArray,
    IsNumber,
} from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators/dto-validation.decorator';

import { PaginateDto } from '@/modules/restful/dtos/paginate.dto';

import { UserStatus } from '../entities/user.entity';

/**
 * 创建用户数据传输对象
 */
@DtoValidation({ groups: ['create'] })
export class CreateUserDto {
    /**
     * 用户名
     * @example "admin"
     */
    @ApiProperty({ description: '用户名' })
    @IsString({ message: '用户名必须是字符串', groups: ['create'] })
    @IsNotEmpty({ message: '用户名不能为空', groups: ['create'] })
    @MinLength(3, { message: '用户名长度不能小于3个字符', groups: ['create'] })
    @MaxLength(50, { message: '用户名长度不能超过50个字符', groups: ['create'] })
    username!: string;

    /**
     * 昵称
     * @example "管理员"
     */
    @ApiProperty({ description: '昵称' })
    @IsString({ message: '昵称必须是字符串', groups: ['create'] })
    @IsNotEmpty({ message: '昵称不能为空', groups: ['create'] })
    @MaxLength(50, { message: '昵称长度不能超过50个字符', groups: ['create'] })
    nickname!: string;

    /**
     * 密码
     * @example "Admin123!"
     */
    @ApiProperty({ description: '密码' })
    @IsString({ message: '密码必须是字符串', groups: ['create'] })
    @MinLength(8, { message: '密码长度不能小于8位', groups: ['create'] })
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: '密码必须包含大小写字母、数字或特殊字符',
        groups: ['create'],
    })
    password!: string;

    /**
     * 头像URL
     * @example "https://example.com/avatar.jpg"
     */
    @ApiPropertyOptional({ description: '头像URL' })
    @IsOptional({ groups: ['create'] })
    @IsUrl({}, { message: '头像URL格式不正确', groups: ['create'] })
    @MaxLength(255, { message: '头像URL长度不能超过255个字符', groups: ['create'] })
    avatar?: string;

    /**
     * 邮箱
     * @example "admin@example.com"
     */
    @ApiProperty({ description: '邮箱' })
    @IsEmail({}, { message: '邮箱格式不正确', groups: ['create'] })
    @IsNotEmpty({ message: '邮箱不能为空', groups: ['create'] })
    email!: string;

    /**
     * 手机号码
     * @example "+8613800138000"
     */
    @ApiPropertyOptional({ description: '手机号码' })
    @IsOptional({ groups: ['create'] })
    phoneNumber?: string;
}

/**
 * 更新用户数据传输对象
 */
@DtoValidation({ groups: ['update'] })
export class UpdateUserDto extends PartialType(CreateUserDto) {
    /**
     * 用户状态
     * @example "active"
     */
    @ApiPropertyOptional({ description: '状态', enum: UserStatus })
    @IsEnum(UserStatus, { message: '用户状态不正确', groups: ['update'] })
    @IsOptional({ groups: ['update'] })
    status?: UserStatus;
}

/**
 * 用户查询数据传输对象
 */
@DtoValidation({ type: 'query' })
export class QueryUserDto extends PaginateDto {
    /**
     * 用户名
     * @example "admin"
     */
    @ApiPropertyOptional({ description: '用户名' })
    @IsString({ message: '用户名必须是字符串' })
    @IsOptional()
    username?: string;

    /**
     * 邮箱
     * @example "admin@example.com"
     */
    @ApiPropertyOptional({ description: '邮箱' })
    @IsString({ message: '邮箱必须是字符串' })
    @IsOptional()
    email?: string;

    /**
     * 用户状态
     * @example "active"
     */
    @ApiPropertyOptional({ description: '状态', enum: UserStatus })
    @IsEnum(UserStatus, { message: '用户状态不正确' })
    @IsOptional()
    status?: UserStatus;
}

/**
 * 修改密码数据传输对象
 */
@DtoValidation({ groups: ['change-password'] })
export class ChangePasswordDto {
    /**
     * 旧密码
     * @example "OldPass123!"
     */
    @ApiProperty({ description: '旧密码' })
    @IsString({ message: '旧密码必须是字符串', groups: ['change-password'] })
    @IsNotEmpty({ message: '旧密码不能为空', groups: ['change-password'] })
    oldPassword!: string;

    /**
     * 新密码
     * @example "NewPass123!"
     */
    @ApiProperty({ description: '新密码' })
    @IsString({ message: '新密码必须是字符串', groups: ['change-password'] })
    @MinLength(8, { message: '新密码长度不能小于8位', groups: ['change-password'] })
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: '新密码必须包含大小写字母、数字或特殊字符',
        groups: ['change-password'],
    })
    newPassword!: string;
}

/**
 * 分配角色数据传输对象
 */
@DtoValidation({ groups: ['assign'] })
export class AssignRolesDto {
    /**
     * 角色ID列表
     * @example [1, 2, 3]
     */
    @ApiProperty({ description: '角色ID列表', type: [Number] })
    @IsArray({ message: '角色必须是数组', groups: ['assign'] })
    @IsNumber({}, { each: true, message: '角色ID必须是数字', groups: ['assign'] })
    @IsNotEmpty({ message: '角色ID列表不能为空', groups: ['assign'] })
    roles!: number[];
}
