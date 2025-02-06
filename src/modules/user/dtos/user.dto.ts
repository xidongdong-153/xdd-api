import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DtoValidation } from '@/modules/core/decorators/dto-validation.decorator';
import { PartialType } from '@nestjs/mapped-types';
import { PaginateDto } from '@/modules/restful/dtos/paginate.dto';
import { UserStatus } from '../constants/user.enum';

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
    username!: string;

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
     * 邮箱
     * @example "admin@example.com"
     */
    @ApiProperty({ description: '邮箱' })
    @IsEmail({}, { message: '邮箱格式不正确', groups: ['create'] })
    @IsNotEmpty({ message: '邮箱不能为空', groups: ['create'] })
    email!: string;
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
