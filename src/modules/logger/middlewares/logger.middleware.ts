import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';
import { Logger } from 'winston';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
    ) {}

    use(req: Request, res: Response, next: NextFunction) {
        // 记录请求开始时间
        const startTime = Date.now();

        // 请求结束时的处理
        res.on('finish', () => {
            const endTime = Date.now();
            const duration = endTime - startTime;

            // 构建日志信息
            const logInfo = {
                method: req.method,
                url: req.originalUrl || req.url,
                ip: req.ip,
                userAgent: req.get('user-agent') || '',
                status: res.statusCode,
                duration: `${duration}ms`,
                timestamp: new Date().toISOString(),
                query: req.query,
                params: req.params,
                // 不记录敏感信息，如密码
                body: this.sanitizeBody(req.body),
                headers: this.sanitizeHeaders(req.headers),
            };

            // 根据状态码选择日志级别
            if (res.statusCode >= 500) {
                this.logger.error('Request Error', logInfo);
            } else if (res.statusCode >= 400) {
                this.logger.warn('Request Warning', logInfo);
            } else {
                this.logger.info('Request Success', logInfo);
            }
        });

        next();
    }

    /**
     * 清理请求体中的敏感信息
     */
    private sanitizeBody(body: any): any {
        if (!body) return body;
        const sanitized = { ...body };
        const sensitiveFields = ['password', 'token', 'secret', 'authorization'];

        sensitiveFields.forEach((field) => {
            if (field in sanitized) {
                sanitized[field] = '******';
            }
        });

        return sanitized;
    }

    /**
     * 清理请求头中的敏感信息
     */
    private sanitizeHeaders(headers: any): any {
        if (!headers) return headers;
        const sanitized = { ...headers };
        const sensitiveHeaders = ['authorization', 'cookie', 'x-auth-token'];

        sensitiveHeaders.forEach((header) => {
            if (header in sanitized) {
                sanitized[header] = '******';
            }
        });

        return sanitized;
    }
}
