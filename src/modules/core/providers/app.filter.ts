import { Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { isObject } from 'class-validator';
import { BaseExceptionFilter } from '@nestjs/core';
import { ResponseMessages, ExceptionMappings } from '../constants';
import { ErrorResponse } from '@/modules/core/types';

/**
 * 全局异常过滤器
 * 统一处理应用中的异常，并返回标准的错误响应格式
 */
@Catch()
export class AppFilter<T = Error> extends BaseExceptionFilter<T> {
    protected readonly exceptionMappings = ExceptionMappings;

    catch(exception: T, host: ArgumentsHost) {
        const applicationRef =
            this.applicationRef || (this.httpAdapterHost && this.httpAdapterHost.httpAdapter)!;

        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const timestamp = new Date().toISOString();

        // 处理 HTTP 异常
        if (exception instanceof HttpException) {
            const response = exception.getResponse();
            const status = exception.getStatus();

            const errorResponse = this.createErrorResponse({
                status,
                message: this.formatMessage(response),
                path: request.url,
                method: request.method,
                timestamp,
            });

            return this.sendResponse(host, applicationRef, errorResponse, status);
        }

        // 处理映射表中的异常
        const exceptionMapping = this.exceptionMappings.find(
            (mapping) => exception instanceof mapping.class,
        );

        if (exceptionMapping) {
            const errorResponse = this.createErrorResponse({
                status: exceptionMapping.status,
                message: exceptionMapping.message || (exception as Error).message,
                path: request.url,
                method: request.method,
                timestamp,
            });

            return this.sendResponse(host, applicationRef, errorResponse, exceptionMapping.status);
        }

        // 处理未知异常
        return this.handleUnknownError(exception, host, applicationRef);
    }

    /**
     * 创建标准错误响应对象
     */
    private createErrorResponse({
        status,
        message,
        path,
        method,
        timestamp,
    }: {
        status: number;
        message: string;
        path: string;
        method: string;
        timestamp: string;
    }): ErrorResponse {
        return {
            statusCode: status,
            message,
            error: (ResponseMessages as Record<number, string>)[status] || 'Unknown Error',
            path,
            method,
            timestamp,
        };
    }

    /**
     * 格式化错误消息
     */
    private formatMessage(response: string | object): string {
        if (isObject(response) && 'message' in response) {
            return Array.isArray(response.message)
                ? response.message.join(', ')
                : String(response.message);
        }
        return String(response);
    }

    /**
     * 发送响应
     */
    private sendResponse(
        host: ArgumentsHost,
        app: any,
        responseBody: ErrorResponse,
        status: number,
    ) {
        app.reply(host.getArgByIndex(1), responseBody, status);
    }

    /**
     * 处理未知异常
     */
    public handleUnknownError(exception: T, host: ArgumentsHost, app: any) {
        const request = host.switchToHttp().getRequest();

        const errorResponse = this.createErrorResponse({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: (exception as Error).message,
            path: request.url,
            method: request.method,
            timestamp: new Date().toISOString(),
        });

        return this.sendResponse(host, app, errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
