import { defineConfig } from '@mikro-orm/mysql';
import { Migrator } from '@mikro-orm/migrations';
import { LoadStrategy } from '@mikro-orm/core';
import { LoggerService } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './logger.config';
// import stripAnsi from 'strip-ansi';
import { Highlighter } from '@mikro-orm/core';
import { ConfigService } from '@nestjs/config';

// 创建一个 Winston logger 实例
const logger: LoggerService = WinstonModule.createLogger(loggerConfig);

// 创建一个不带颜色的 highlighter
const noColorHighlighter: Highlighter = {
    highlight: (text: string) => text,
};

export const mikroOrmConfig = () => {
    const configService = new ConfigService();

    return defineConfig({
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        user: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        dbName: configService.get<string>('DB_DATABASE'),
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
                timezone: configService.get<string>('DB_TIMEZONE'),
                charset: 'utf8mb4_general_ci',
            },
        },
        debug: process.env.NODE_ENV === 'development' ? ['discovery', 'info', 'query'] : false,
        logger: (message: string) => {
            // 移除 ANSI 颜色代码
            const cleanMessage = message;
            logger.log(cleanMessage, 'MikroORM');
        },
        // 使用无颜色的 highlighter
        highlighter: noColorHighlighter,
    });
};

export default mikroOrmConfig();
