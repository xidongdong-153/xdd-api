import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber } from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators/dto-validation.decorator';

import { PaginateDto } from '@/modules/restful/dtos/paginate.dto';

/**
 * 创建权限数据传输对象
 */
@DtoValidation({ groups: ['create'] })
export class CreatePermissionDto {
    /**
     * 权限编码
     * @example "user:create"
     */
    @ApiProperty({ description: '权限编码' })
    @IsString({ message: '权限编码必须是字符串', groups: ['create'] })
    @IsNotEmpty({ message: '权限编码不能为空', groups: ['create'] })
    code!: string;

    /**
     * 权限名称
     * @example "创建用户"
     */
    @ApiProperty({ description: '权限名称' })
    @IsString({ message: '权限名称必须是字符串', groups: ['create'] })
    @IsNotEmpty({ message: '权限名称不能为空', groups: ['create'] })
    name!: string;

    /**
     * 权限描述
     * @example "允许创建新用户"
     */
    @ApiPropertyOptional({ description: '权限描述' })
    @IsString({ message: '权限描述必须是字符串', groups: ['create'] })
    @IsOptional({ groups: ['create'] })
    description?: string;

    /**
     * 所属模块
     * @example "user"
     */
    @ApiProperty({ description: '所属模块' })
    @IsString({ message: '所属模块必须是字符串', groups: ['create'] })
    @IsNotEmpty({ message: '所属模块不能为空', groups: ['create'] })
    module!: string;

    /**
     * 操作类型
     * @example "create"
     */
    @ApiProperty({ description: '操作类型' })
    @IsString({ message: '操作类型必须是字符串', groups: ['create'] })
    @IsNotEmpty({ message: '操作类型不能为空', groups: ['create'] })
    action!: string;
}

/**
 * 更新权限数据传输对象
 */
@DtoValidation({ groups: ['update'] })
export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}

/**
 * 权限查询数据传输对象
 */
@DtoValidation({ type: 'query' })
export class QueryPermissionDto extends PaginateDto {
    /**
     * 权限编码
     * @example "user:create"
     */
    @ApiPropertyOptional({ description: '权限编码' })
    @IsString({ message: '权限编码必须是字符串' })
    @IsOptional()
    code?: string;

    /**
     * 所属模块
     * @example "user"
     */
    @ApiPropertyOptional({ description: '所属模块' })
    @IsString({ message: '所属模块必须是字符串' })
    @IsOptional()
    module?: string;
}

/**
 * 分配权限数据传输对象
 */
@DtoValidation({ groups: ['assign'] })
export class AssignPermissionsDto {
    /**
     * 权限ID列表
     * @example [1, 2, 3]
     */
    @ApiProperty({ description: '权限ID列表', type: [Number] })
    @IsArray({ message: '权限必须是数组', groups: ['assign'] })
    @IsNumber({}, { each: true, message: '权限ID必须是数字', groups: ['assign'] })
    @IsNotEmpty({ message: '权限ID列表不能为空', groups: ['assign'] })
    permissions!: number[];
}
