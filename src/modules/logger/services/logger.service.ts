import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

export interface LogMetadata {
    [key: string]: any;
    requestId?: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
}

export interface HttpLogMetadata extends LogMetadata {
    method: string;
    url: string;
    statusCode?: number;
    responseTime?: number;
    body?: any;
    query?: any;
}

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

@Injectable()
export class LoggerService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
    ) {}

    private formatMessage(message: string, context: string): string {
        return `${context ? `[${context}] ` : ''}${message}`;
    }

    private logWithMetadata(
        level: LogLevel,
        message: string,
        context?: string,
        metadata?: LogMetadata,
        trace?: string,
    ) {
        const logFn = this.logger[level].bind(this.logger);
        logFn(this.formatMessage(message, context), {
            context,
            trace,
            ...metadata,
        });
    }

    debug(message: string, context?: string, metadata?: LogMetadata) {
        this.logWithMetadata('debug', message, context, metadata);
    }

    info(message: string, context?: string, metadata?: LogMetadata) {
        this.logWithMetadata('info', message, context, metadata);
    }

    warn(message: string, context?: string, metadata?: LogMetadata) {
        this.logWithMetadata('warn', message, context, metadata);
    }

    error(message: string, context?: string, error?: Error, metadata?: LogMetadata) {
        this.logWithMetadata(
            'error',
            message,
            context,
            metadata,
            error?.stack || new Error().stack,
        );
    }

    /**
     * 记录HTTP请求日志
     */
    http(context: string, metadata: HttpLogMetadata) {
        const message = `${metadata.method} ${metadata.url}`;
        this.info(message, context, {
            ...metadata,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * 记录API请求开始
     */
    logRequestStart(context: string, metadata: HttpLogMetadata) {
        this.http(context, {
            ...metadata,
            phase: 'REQUEST_START',
        });
    }

    /**
     * 记录API请求结束
     */
    logRequestEnd(context: string, metadata: HttpLogMetadata) {
        this.http(context, {
            ...metadata,
            phase: 'REQUEST_END',
        });
    }

    /**
     * 记录API请求错误
     */
    logRequestError(context: string, metadata: HttpLogMetadata, error: Error) {
        this.error(`Request failed: ${metadata.method} ${metadata.url}`, context, error, metadata);
    }
}
