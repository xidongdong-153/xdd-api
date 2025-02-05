import { defineConfig } from '@mikro-orm/mysql';
import { Migrator } from '@mikro-orm/migrations';
import { LoadStrategy } from '@mikro-orm/core';
import { LoggerService } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './logger.config';
import stripAnsi from 'strip-ansi';
import { Highlighter } from '@mikro-orm/core';

// 创建一个 Winston logger 实例
const logger: LoggerService = WinstonModule.createLogger(loggerConfig);

// 创建一个不带颜色的 highlighter
const noColorHighlighter: Highlighter = {
    highlight: (text: string) => text,
};

export const mikroOrmConfig = () =>
    defineConfig({
        host: 'localhost',
        port: 3306,
        user: 'xdd_user',
        password: 'xdd123456',
        dbName: 'xdd-api',
        entities: ['dist/**/*.entity.js'],
        entitiesTs: ['src/**/*.entity.ts'],
        loadStrategy: LoadStrategy.JOINED,
        extensions: [Migrator],
        migrations: {
            path: 'dist/migrations',
            pathTs: 'src/migrations',
        },
        driverOptions: {
            connection: {
                timezone: '+08:00',
                charset: 'utf8mb4_general_ci',
            },
        },
        debug: ['discovery', 'info', 'query'],
        logger: (message: string) => {
            // 移除 ANSI 颜色代码
            const cleanMessage = stripAnsi(message);
            logger.log(cleanMessage, 'MikroORM');
        },
        // 使用无颜色的 highlighter
        highlighter: noColorHighlighter,
    });

export default mikroOrmConfig();
