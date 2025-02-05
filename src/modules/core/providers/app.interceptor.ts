import { CallHandler, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClassSerializerInterceptor, PlainLiteralObject } from '@nestjs/common';
import { ClassTransformOptions } from 'class-transformer';
import { isArray, isObject, isNil } from 'lodash';
import { BaseResponse, StatusCodeMessage } from '@/modules/core/types';
import { ResponseMessages } from '@/modules/core/constants';

/**
 * 全局响应转换拦截器
 * 用于统一处理响应格式，包括数据序列化和统一的响应结构
 */
@Injectable()
export class AppInterceptor extends ClassSerializerInterceptor {
    // 响应消息映射表
    private readonly messageMap: StatusCodeMessage = ResponseMessages;

    /**
     * 拦截器入口方法
     * @param context - 执行上下文，包含请求和响应对象
     * @param next - 调用处理器，处理后续逻辑
     * @returns Observable<BaseResponse> - 统一格式的响应流
     */
    intercept(context: ExecutionContext, next: CallHandler): Observable<BaseResponse> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();

        return next.handle().pipe(
            map((data) => {
                // 序列化响应数据
                const serializedData = this.serialize(data, this.getContextOptions(context));

                // 构建统一的响应格式
                return {
                    statusCode: response.statusCode,
                    message: this.getResponseMessage(response.statusCode),
                    data: serializedData,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    method: request.method,
                };
            }),
        );
    }

    /**
     * 序列化响应数据
     * @param response - 原始响应数据
     * @param options - 序列化选项
     * @returns 序列化后的数据
     */
    serialize(
        response: PlainLiteralObject | Array<PlainLiteralObject>,
        options: ClassTransformOptions = {},
    ): PlainLiteralObject | PlainLiteralObject[] {
        // 处理非对象和非数组的情况
        if (!isObject(response) && !isArray(response)) {
            return response;
        }

        // 处理数组数据
        if (isArray(response)) {
            return (response as PlainLiteralObject[]).map((item) =>
                !isObject(item) ? item : this.transformToPlain(item, options),
            );
        }

        // 处理分页数据
        if ('meta' in response && 'items' in response) {
            const items = !isNil(response.items) && isArray(response.items) ? response.items : [];
            return {
                ...response,
                items: (items as PlainLiteralObject[]).map((item) =>
                    !isObject(item) ? item : this.transformToPlain(item, options),
                ),
            };
        }

        // 处理普通对象
        return this.transformToPlain(response, options);
    }

    /**
     * 获取响应消息
     * @param statusCode - HTTP状态码
     * @returns 对应状态码的响应消息
     */
    private getResponseMessage(statusCode: number): string {
        return this.messageMap[statusCode] || '操作成功';
    }
}
