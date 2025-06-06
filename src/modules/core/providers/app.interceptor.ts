import { CallHandler, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ClassSerializerInterceptor, ClassSerializerContextOptions } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ResponseMessages } from '@/modules/core/constants';
import { SuccessResponse, StatusCodeMessage } from '@/modules/core/types';

/**
 * 全局响应转换拦截器
 * 用于统一处理响应格式，包括数据序列化和统一的响应结构
 */
@Injectable()
export class AppInterceptor extends ClassSerializerInterceptor {
    private readonly logger = new Logger(AppInterceptor.name);
    private readonly messageMap: StatusCodeMessage = ResponseMessages;

    /**
     * 拦截器入口方法
     * @param context - 执行上下文
     * @param next - 调用处理器
     */
    intercept(context: ExecutionContext, next: CallHandler): Observable<SuccessResponse<unknown>> {
        // 获取序列化选项
        const options = this.getContextOptions(context);
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();

        return next.handle().pipe(
            map((data) => {
                try {
                    // 序列化响应数据
                    const serializedData = data ? this.serialize(data, options) : null;

                    // 构建统一的响应格式
                    return {
                        statusCode: response.statusCode,
                        message: this.getResponseMessage(response.statusCode),
                        data: serializedData,
                        timestamp: new Date().toISOString(),
                        path: request.url,
                        method: request.method,
                    } as SuccessResponse<unknown>;
                } catch (error) {
                    this.logger.error(
                        'Response serialization failed',
                        error instanceof Error ? error.stack : String(error),
                    );
                    // 返回原始数据，确保接口不会因序列化失败而报错
                    return {
                        statusCode: response.statusCode,
                        message: this.getResponseMessage(response.statusCode),
                        data: data,
                        timestamp: new Date().toISOString(),
                        path: request.url,
                        method: request.method,
                    } as SuccessResponse<unknown>;
                }
            }),
        );
    }

    /**
     * 重写序列化方法，增加空值检查
     * @param response - 响应数据
     * @param options - 序列化选项
     */
    public serialize(response: any, options: ClassSerializerContextOptions): any {
        if (!response) {
            return response;
        }

        const result = super.serialize(response, options);

        return result;
    }

    /**
     * 获取响应消息
     * @param statusCode - HTTP 状态码
     */
    private getResponseMessage(statusCode: number): string {
        return this.messageMap[statusCode] || '操作成功';
    }
}
