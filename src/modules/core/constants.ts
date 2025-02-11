import {
    UniqueConstraintViolationException,
    NotFoundError,
    DatabaseObjectNotFoundException,
    SyntaxErrorException,
    TableNotFoundException,
    DeadlockException,
} from '@mikro-orm/core';
import { HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';

import { ExceptionMapping } from './types';

/**
 * DTOValidation装饰器选项
 */
export const DTO_VALIDATION_OPTIONS = 'dto_validation_options';

/**
 * 响应消息
 * 418 是个历史遗留的梗，来自1998年的愚人节玩笑 😂
 * 429 用于限流，前端看到这个要懂得等待 ⏰
 * 422 经常用于表单验证失败 ✍️
 * 503 通常在服务器维护时使用 🔧
 */
export const ResponseMessages = {
    // 1xx 信息响应
    [HttpStatus.CONTINUE]: '继续请求',
    [HttpStatus.SWITCHING_PROTOCOLS]: '正在切换协议',
    [HttpStatus.PROCESSING]: '正在处理中',
    [HttpStatus.EARLYHINTS]: '预加载提示',

    // 2xx 成功响应
    [HttpStatus.OK]: '请求成功',
    [HttpStatus.CREATED]: '创建成功',
    [HttpStatus.ACCEPTED]: '请求已接受',
    [HttpStatus.NON_AUTHORITATIVE_INFORMATION]: '非权威信息',
    [HttpStatus.NO_CONTENT]: '无内容',
    [HttpStatus.RESET_CONTENT]: '重置内容',
    [HttpStatus.PARTIAL_CONTENT]: '部分内容',

    // 3xx 重定向
    [HttpStatus.AMBIGUOUS]: '多种选择',
    [HttpStatus.MOVED_PERMANENTLY]: '永久移动',
    [HttpStatus.FOUND]: '临时移动',
    [HttpStatus.SEE_OTHER]: '查看其它位置',
    [HttpStatus.NOT_MODIFIED]: '未修改',
    [HttpStatus.TEMPORARY_REDIRECT]: '临时重定向',
    [HttpStatus.PERMANENT_REDIRECT]: '永久重定向',

    // 4xx 客户端错误
    [HttpStatus.BAD_REQUEST]: '请求参数错误',
    [HttpStatus.UNAUTHORIZED]: '未授权，请先登录',
    [HttpStatus.PAYMENT_REQUIRED]: '需要付款',
    [HttpStatus.FORBIDDEN]: '禁止访问',
    [HttpStatus.NOT_FOUND]: '资源不存在',
    [HttpStatus.METHOD_NOT_ALLOWED]: '请求方法不允许',
    [HttpStatus.NOT_ACCEPTABLE]: '不接受的请求',
    [HttpStatus.PROXY_AUTHENTICATION_REQUIRED]: '需要代理认证',
    [HttpStatus.REQUEST_TIMEOUT]: '请求超时',
    [HttpStatus.CONFLICT]: '资源冲突',
    [HttpStatus.GONE]: '资源已被永久移除',
    [HttpStatus.LENGTH_REQUIRED]: '需要内容长度',
    [HttpStatus.PRECONDITION_FAILED]: '前提条件失败',
    [HttpStatus.PAYLOAD_TOO_LARGE]: '请求实体过大',
    [HttpStatus.URI_TOO_LONG]: 'URI过长',
    [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: '不支持的媒体类型',
    [HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE]: '请求范围不符合要求',
    [HttpStatus.EXPECTATION_FAILED]: '预期失败',
    [HttpStatus.I_AM_A_TEAPOT]: '我是个茶壶（愚人节笑话）',
    [HttpStatus.MISDIRECTED]: '错误导向的请求',
    [HttpStatus.UNPROCESSABLE_ENTITY]: '无法处理的实体',
    [HttpStatus.FAILED_DEPENDENCY]: '依赖失败',
    [HttpStatus.PRECONDITION_REQUIRED]: '需要前提条件',
    [HttpStatus.TOO_MANY_REQUESTS]: '请求过于频繁，请稍后重试',

    // 5xx 服务器错误
    [HttpStatus.INTERNAL_SERVER_ERROR]: '服务器内部错误',
    [HttpStatus.NOT_IMPLEMENTED]: '未实现的功能',
    [HttpStatus.BAD_GATEWAY]: '网关错误',
    [HttpStatus.SERVICE_UNAVAILABLE]: '服务暂时不可用',
    [HttpStatus.GATEWAY_TIMEOUT]: '网关超时',
    [HttpStatus.HTTP_VERSION_NOT_SUPPORTED]: '不支持的HTTP版本',
} as const;

// 异常映射配置
export const ExceptionMappings: ReadonlyArray<ExceptionMapping> = [
    {
        class: NotFoundError,
        status: HttpStatus.NOT_FOUND,
        message: '请求的资源不存在，请检查后重试',
    },
    {
        class: ValidationError,
        status: HttpStatus.BAD_REQUEST,
        message: '输入数据格式有误，请检查后重试',
    },
    {
        class: UniqueConstraintViolationException,
        status: HttpStatus.CONFLICT,
        message: '该记录已存在，请勿重复添加',
    },
    {
        class: DatabaseObjectNotFoundException,
        status: HttpStatus.NOT_FOUND,
        message: '请求的数据不存在，请刷新后重试',
    },
    {
        class: SyntaxErrorException,
        status: HttpStatus.BAD_REQUEST,
        message: '请求处理失败，请稍后重试', // 隐藏SQL相关信息
    },
    {
        class: TableNotFoundException,
        status: HttpStatus.NOT_FOUND,
        message: '系统配置异常，请联系管理员', // 隐藏表相关信息
    },
    {
        class: DeadlockException,
        status: HttpStatus.SERVICE_UNAVAILABLE, // 死锁使用503状态码
        message: '系统繁忙，请稍后重试',
    },
] as const;
