import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsArray,
    IsNumber,
    IsBoolean,
    Min,
    IsInt,
} from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators/dto-validation.decorator';

import { PaginateDto } from '@/modules/restful/dtos/paginate.dto';

/**
 * 创建角色数据传输对象
 */
@DtoValidation({ groups: ['create'] })
export class CreateRoleDto {
    /**
     * 角色编码
     * @example "ROLE_ADMIN"
     */
    @ApiProperty({ description: '角色编码' })
    @IsString({ message: '角色编码必须是字符串', groups: ['create'] })
    @IsNotEmpty({ message: '角色编码不能为空', groups: ['create'] })
    code!: string;

    /**
     * 角色名称
     * @example "管理员"
     */
    @ApiProperty({ description: '角色名称' })
    @IsString({ message: '角色名称必须是字符串', groups: ['create'] })
    @IsNotEmpty({ message: '角色名称不能为空', groups: ['create'] })
    name!: string;

    /**
     * 角色描述
     * @example "系统管理员"
     */
    @ApiPropertyOptional({ description: '角色描述' })
    @IsString({ message: '角色描述必须是字符串', groups: ['create'] })
    @IsOptional({ groups: ['create'] })
    description?: string;

    /**
     * 父角色ID
     * @example "1"
     */
    @ApiPropertyOptional({ description: '父角色ID' })
    @IsString({ message: '父角色ID必须是字符串', groups: ['create'] })
    @IsOptional({ groups: ['create'] })
    parentId?: string;

    /**
     * 排序值
     * @example 0
     */
    @ApiPropertyOptional({ description: '排序值', default: 0 })
    @IsInt({ message: '排序值必须是整数', groups: ['create'] })
    @Min(0, { message: '排序值不能小于0', groups: ['create'] })
    @IsOptional({ groups: ['create'] })
    sort?: number = 0;

    /**
     * 是否启用
     * @example true
     */
    @ApiPropertyOptional({ description: '是否启用', default: true })
    @IsBoolean({ message: '启用状态必须是布尔值', groups: ['create'] })
    @IsOptional({ groups: ['create'] })
    isEnabled?: boolean = true;

    /**
     * 是否为系统角色
     * @example false
     */
    @ApiPropertyOptional({ description: '是否为系统角色', default: false })
    @IsBoolean({ message: '系统角色标志必须是布尔值', groups: ['create'] })
    @IsOptional({ groups: ['create'] })
    isSystem?: boolean = false;

    /**
     * 权限ID列表
     * @example [1, 2, 3]
     */
    @ApiPropertyOptional({ description: '权限ID列表', type: [Number] })
    @IsArray({ message: '权限必须是数组', groups: ['create'] })
    @IsNumber({}, { each: true, message: '权限ID必须是数字', groups: ['create'] })
    @IsOptional({ groups: ['create'] })
    permissions?: number[];
}

/**
 * 更新角色数据传输对象
 */
@DtoValidation({ groups: ['update'] })
export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

/**
 * 角色查询数据传输对象
 */
@DtoValidation({ type: 'query' })
export class QueryRoleDto extends PaginateDto {
    /**
     * 角色名称
     * @example "admin"
     */
    @ApiPropertyOptional({ description: '角色名称' })
    @IsString({ message: '角色名称必须是字符串' })
    @IsOptional()
    name?: string;
}

/**
 * 分配用户数据传输对象
 */
@DtoValidation({ groups: ['assign'] })
export class AssignUsersDto {
    /**
     * 用户ID列表
     * @example [1, 2, 3]
     */
    @ApiProperty({ description: '用户ID列表', type: [Number] })
    @IsArray({ message: '用户必须是数组', groups: ['assign'] })
    @IsNumber({}, { each: true, message: '用户ID必须是数字', groups: ['assign'] })
    @IsNotEmpty({ message: '用户ID列表不能为空', groups: ['assign'] })
    userIds!: number[];
}
