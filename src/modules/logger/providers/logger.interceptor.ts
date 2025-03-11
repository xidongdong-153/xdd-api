import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { LoggerService } from '../services/logger.service';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
    constructor(private readonly logger: LoggerService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, query } = request;
        const className = context.getClass().name;
        const handlerName = context.getHandler().name;

        // 记录请求开始
        this.logger.debug('Request', `${method} ${url}`, {
            body,
            query,
            controller: className,
            handler: handlerName,
        });

        const now = Date.now();
        return next.handle().pipe(
            tap({
                next: (data: unknown) => {
                    // 记录成功响应
                    this.logger.debug('Response', `${method} ${url}`, {
                        body,
                        query,
                        response: data,
                        duration: `${Date.now() - now}ms`,
                        controller: className,
                        handler: handlerName,
                    });
                },
                error: (error: Error) => {
                    // 记录错误响应
                    // 检查是否为堆栈溢出错误
                    const isStackOverflow =
                        error.message.includes('Maximum call stack size exceeded') ||
                        error.toString().includes('RangeError: Maximum call stack size exceeded');

                    if (isStackOverflow) {
                        // 对堆栈溢出错误进行特殊处理
                        this.logger.fatal(`Stack Overflow: ${method} ${url}`, handlerName, error, {
                            body,
                            query,
                            error: {
                                message: error.message,
                                name: error.name,
                            },
                            duration: `${Date.now() - now}ms`,
                            controller: className,
                            handler: handlerName,
                        });
                    } else {
                        // 记录普通错误
                        this.logger.error('Response', `${method} ${url}`, error, {
                            body,
                            query,
                            error: {
                                message: error.message,
                                name: error.name,
                            },
                            duration: `${Date.now() - now}ms`,
                            controller: className,
                            handler: handlerName,
                        });
                    }
                },
            }),
            // 捕获可能未被 tap 处理的异常
            catchError((error: Error) => {
                // 将异常信息记录到日志
                this.logger.error(
                    `Unhandled exception in ${className}.${handlerName}`,
                    className,
                    error,
                    {
                        method,
                        url,
                        duration: `${Date.now() - now}ms`,
                    },
                );

                // 重新抛出错误以便被异常过滤器处理
                return throwError(() => error);
            }),
        );
    }
}
