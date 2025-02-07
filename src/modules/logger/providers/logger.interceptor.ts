import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

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
                },
            }),
        );
    }
}
