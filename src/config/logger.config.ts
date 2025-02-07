import { join } from 'path';

import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

// 自定义控制台日志格式
const consoleFormat = winston.format.printf((info) => {
    const { level, message, timestamp, context, ...meta } = info;
    const colorizer = winston.format.colorize();
    const upperLevel = level.toUpperCase().padEnd(7);
    let log = `${colorizer.colorize(level, `[${timestamp}] ${upperLevel}`)} `;

    if (context) {
        log += colorizer.colorize(level, `[${context}] `);
    }

    log += colorizer.colorize(level, message as string);

    if (Object.keys(meta).length > 0 && meta.constructor === Object) {
        log += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return log;
});

// 自定义文件日志格式
const fileFormat = winston.format.printf((info) => {
    const { level, message, timestamp, context, trace, ...meta } = info;
    const upperLevel = level.toUpperCase().padEnd(7);
    let log = `[${timestamp}] ${upperLevel} [${context || 'Application'}]: ${message}`;

    if (trace) {
        log += `\n${trace}`;
    }

    if (Object.keys(meta).length > 0) {
        log += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return log;
});

/**
 * 日志配置
 */
export const loggerConfig: WinstonModuleOptions = {
    // 定义日志级别
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

    // 定义日志格式
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss.SSS',
        }),
        winston.format.errors({ stack: true }),
    ),

    // 定义日志传输方式
    transports: [
        // 控制台输出
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss.SSS',
                }),
                consoleFormat,
            ),
        }),

        // 常规日志文件 - 按日期轮转
        new winston.transports.DailyRotateFile({
            level: 'info',
            dirname: join(process.cwd(), process.env.LOG_PATH || 'logs'),
            filename: 'application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: process.env.LOG_MAX_SIZE || '20m',
            maxFiles: process.env.LOG_MAX_FILES || '14d',
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss.SSS',
                }),
                fileFormat,
            ),
        }),

        // 错误日志文件 - 按日期轮转
        new winston.transports.DailyRotateFile({
            level: 'error',
            dirname: join(process.cwd(), process.env.LOG_PATH || 'logs'),
            filename: 'error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: process.env.LOG_MAX_SIZE || '20m',
            maxFiles: process.env.LOG_MAX_FILES || '14d',
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss.SSS',
                }),
                fileFormat,
            ),
        }),
    ],
};
