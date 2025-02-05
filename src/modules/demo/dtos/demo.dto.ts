import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDate } from 'class-validator';
import { DtoValidation } from '@/modules/core/decorators/dto-validation.decorator';
import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import { PaginateDto } from '@/modules/restful/dtos/paginate.dto';

/**
 * 创建演示数据传输对象
 */
@DtoValidation({ groups: ['create'] })
export class CreateDemoDto {
    /**
     * 名称
     * @example "演示数据"
     */
    @IsNotEmpty({ message: '名称不能为空', groups: ['create'] })
    @IsString({ message: '名称必须是字符串', groups: ['create'] })
    name!: string;

    /**
     * 描述
     * @example "这是一条演示数据"
     */
    @IsOptional({ groups: ['create'] })
    @IsString({ message: '描述必须是字符串', groups: ['create'] })
    description?: string;
}

/**
 * 更新演示数据传输对象
 */
@DtoValidation({ groups: ['update'] })
export class UpdateDemoDto extends PartialType(CreateDemoDto) {}

/**
 * 分页查询演示数据传输对象
 */
@DtoValidation({ type: 'query' })
export class PageDemoDto extends PaginateDto {
    /**
     * 搜索关键字
     * @example "测试"
     */
    @IsOptional()
    @IsString()
    keyword?: string;

    /**
     * 开始时间
     * @example "2024-01-01"
     */
    @IsOptional()
    @Transform(({ value }) => value && new Date(value))
    @IsDate()
    startTime?: Date;

    /**
     * 结束时间
     * @example "2024-12-31"
     */
    @IsOptional()
    @Transform(({ value }) => value && new Date(value))
    @IsDate()
    endTime?: Date;
}

/**
 * 创建树节点数据传输对象
 */
@DtoValidation({ groups: ['create'] })
export class CreateDemoTreeDto {
    /**
     * 节点名称
     * @example "新节点"
     */
    @IsNotEmpty({ message: '节点名称不能为空', groups: ['create'] })
    @IsString({ message: '节点名称必须是字符串', groups: ['create'] })
    name!: string;

    /**
     * 节点描述
     * @example "这是一个新的树节点"
     */
    @IsOptional({ groups: ['create'] })
    @IsString({ message: '节点描述必须是字符串', groups: ['create'] })
    description?: string;

    /**
     * 父节点ID
     * @example 1
     */
    @IsOptional({ groups: ['create'] })
    @IsNumber({}, { message: '父节点ID必须是数字', groups: ['create'] })
    parentId?: number;
}

/**
 * 更新树节点数据传输对象
 */
@DtoValidation({ groups: ['update'] })
export class UpdateDemoTreeDto extends PartialType(CreateDemoTreeDto) {}
