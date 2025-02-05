import { ApiProperty } from '@nestjs/swagger';

/**
 * 基础响应接口
 */
export interface BaseResponse {
    /** HTTP 状态码 */
    statusCode: number;
    /** 响应消息 */
    message: string;
    /** 响应时间戳 */
    timestamp: string;
    /** 请求方法 */
    method?: string;
    /** 请求路径 */
    path?: string;
}

/**
 * 状态码消息映射类型
 */
export type StatusCodeMessage = {
    [key: number]: string;
};

/**
 * 分页数据接口
 */
export interface PaginatedData<T> {
    /** 数据项数组 */
    items: T[];
    /** 总数据量 */
    total: number;
    /** 当前页码 */
    page: number;
    /** 每页数据量 */
    limit: number;
}

/**
 * 成功响应接口
 */
export interface SuccessResponse<T> extends BaseResponse {
    /** 响应数据 */
    data: T;
}

/**
 * 错误响应接口
 * 用于统一的错误响应格式，包含错误的详细信息
 */
export interface ErrorResponse {
    /** HTTP 状态码 */
    statusCode: number;
    /** 错误描述消息 */
    message: string;
    /** 具体错误类型或错误标识 */
    error: string;
    /** 发生错误的请求路径 */
    path: string;
    /** 发生错误的 HTTP 请求方法 */
    method: string;
    /** 错误发生的时间戳 */
    timestamp: string;
}

/**
 * 分页元数据接口
 */
export interface PaginationMeta {
    /** 当前页码 */
    currentPage: number;
    /** 每页数据量 */
    itemsPerPage: number;
    /** 总数据量 */
    totalItems: number;
    /** 总页数 */
    totalPages: number;
}

/**
 * 异常映射接口
 * 用于定义异常类与其对应的 HTTP 状态码和错误消息之间的映射关系
 */
export interface ExceptionMapping {
    /** 异常类的引用 */
    class: any;
    /** 对应的 HTTP 状态码 */
    status: number;
    /** 默认的错误提示消息 */
    message: string;
}

/**
 * 树节点数据结构
 */
export class TreeNodeData {
    /**
     * 节点ID
     */
    @ApiProperty({ description: '节点ID' })
    id!: number;

    /**
     * 节点名称
     */
    @ApiProperty({ description: '节点名称' })
    name!: string;

    /**
     * 节点描述
     */
    @ApiProperty({ description: '节点描述', required: false })
    description?: string;

    /**
     * 节点层级
     */
    @ApiProperty({ description: '节点层级' })
    level!: number;

    /**
     * 子节点
     */
    @ApiProperty({ description: '子节点列表', type: [TreeNodeData] })
    children!: TreeNodeData[];

    /**
     * 创建时间
     */
    @ApiProperty({ description: '创建时间' })
    createdAt!: Date;

    /**
     * 更新时间
     */
    @ApiProperty({ description: '更新时间' })
    updatedAt!: Date;

    /**
     * 父节点ID
     */
    @ApiProperty({ description: '父节点ID', required: false, nullable: true })
    parentId!: number | null;
}
