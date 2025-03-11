import { ApiProperty, ApiExtraModels } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MinLength,
    MaxLength,
    IsOptional,
    IsPhoneNumber,
    IsUrl,
} from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators/dto-validation.decorator';

/**
 * 登录数据传输对象
 */
@DtoValidation({ groups: ['login'] })
export class LoginDto {
    /**
     * 登录凭证（用户名或邮箱）
     * @example "admin"
     */
    @ApiProperty({ description: '登录凭证（用户名或邮箱）' })
    @IsString({ message: '登录凭证必须是字符串', groups: ['login'] })
    @IsNotEmpty({ message: '登录凭证不能为空', groups: ['login'] })
    credential!: string;

    /**
     * 密码
     * @example "Admin123!"
     */
    @ApiProperty({ description: '密码' })
    @IsString({ message: '密码必须是字符串', groups: ['login'] })
    @IsNotEmpty({ message: '密码不能为空', groups: ['login'] })
    password!: string;
}

/**
 * 注册数据传输对象
 * @example {
 *   "username": "john_doe",
 *   "nickname": "John Doe",
 *   "password": "Admin123!",
 *   "email": "john.doe@example.com",
 *   "phoneNumber": "+8613800138000",
 *   "avatar": "https://example.com/avatars/default.png"
 * }
 */
@DtoValidation({ groups: ['register'] })
@ApiExtraModels()
export class RegisterDto {
    /**
     * 用户名
     * @description 用户名必须是3-50个字符，只能包含字母、数字、下划线
     * @example "john_doe"
     */
    @ApiProperty({
        description: '用户名（必填）',
        example: 'john_doe',
        minLength: 3,
        maxLength: 50,
        pattern: '^[a-zA-Z0-9_]+$',
    })
    @IsString({ message: '用户名必须是字符串', groups: ['register'] })
    @IsNotEmpty({ message: '用户名不能为空', groups: ['register'] })
    @MinLength(3, { message: '用户名长度不能小于3个字符', groups: ['register'] })
    @MaxLength(50, { message: '用户名长度不能超过50个字符', groups: ['register'] })
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: '用户名只能包含字母、数字和下划线',
        groups: ['register'],
    })
    username!: string;

    /**
     * 昵称
     * @description 用户显示名称，默认与用户名相同
     * @example "John Doe"
     */
    @ApiProperty({
        description: '昵称（可选，默认与用户名相同）',
        example: 'John Doe',
        required: false,
    })
    @IsString({ message: '昵称必须是字符串', groups: ['register'] })
    @IsOptional({ groups: ['register'] })
    @MaxLength(50, { message: '昵称长度不能超过50个字符', groups: ['register'] })
    nickname?: string;

    /**
     * 密码
     * @description 密码必须包含大小写字母、数字或特殊字符，长度至少8位
     * @example "Admin123!"
     */
    @ApiProperty({
        description: '密码（必填）',
        example: 'Admin123!',
        minLength: 8,
    })
    @IsString({ message: '密码必须是字符串', groups: ['register'] })
    @MinLength(8, { message: '密码长度不能小于8位', groups: ['register'] })
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: '密码必须包含大小写字母、数字或特殊字符',
        groups: ['register'],
    })
    password!: string;

    /**
     * 邮箱
     * @description 必须是有效的电子邮箱地址，用于账号验证和通知
     * @example "john.doe@example.com"
     */
    @ApiProperty({
        description: '邮箱（必填）',
        example: 'john.doe@example.com',
        format: 'email',
    })
    @IsEmail({}, { message: '邮箱格式不正确', groups: ['register'] })
    @IsNotEmpty({ message: '邮箱不能为空', groups: ['register'] })
    email!: string;

    /**
     * 手机号码
     * @description 国际格式的手机号码，用于账号验证和通知
     * @example "+8613800138000"
     */
    @ApiProperty({
        description: '手机号码（可选）',
        example: '+8613800138000',
        required: false,
    })
    @IsOptional({ groups: ['register'] })
    @IsPhoneNumber(null, { message: '请输入有效的手机号码', groups: ['register'] })
    phoneNumber?: string;

    /**
     * 头像URL
     * @description 用户头像的URL地址
     * @example "https://example.com/avatars/default.png"
     */
    @ApiProperty({
        description: '头像URL（可选）',
        example: 'https://example.com/avatars/default.png',
        required: false,
    })
    @IsOptional({ groups: ['register'] })
    @IsUrl({}, { message: '头像URL格式不正确', groups: ['register'] })
    @MaxLength(255, { message: '头像URL长度不能超过255个字符', groups: ['register'] })
    avatar?: string;
}

/**
 * 刷新Token数据传输对象
 */
@DtoValidation({ groups: ['refresh'] })
export class RefreshTokenDto {
    /**
     * 刷新Token
     * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     */
    @ApiProperty({ description: '刷新Token' })
    @IsString({ message: 'refreshToken必须是字符串', groups: ['refresh'] })
    @IsNotEmpty({ message: 'refreshToken不能为空', groups: ['refresh'] })
    refreshToken!: string;
}
