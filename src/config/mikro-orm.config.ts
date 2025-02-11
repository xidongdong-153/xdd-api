import { LoadStrategy } from '@mikro-orm/core';
import { Highlighter } from '@mikro-orm/core';
import { Migrator } from '@mikro-orm/migrations';
import { defineConfig } from '@mikro-orm/mysql';
import { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';

import { loggerConfig } from './logger.config';

// import stripAnsi from 'strip-ansi';

// 创建一个 Winston logger 实例
const logger: LoggerService = WinstonModule.createLogger(loggerConfig);

// 创建一个不带颜色的 highlighter
const noColorHighlighter: Highlighter = {
    highlight: (text: string) => text,
};

const baseConfig = defineConfig({
    entities: ['dist/**/*.entity.js'],
    entitiesTs: ['src/**/*.entity.ts'],
    loadStrategy: LoadStrategy.JOINED,
    extensions: [Migrator],
    migrations: {
        path: 'dist/migrations',
        pathTs: 'src/migrations',
    },
    debug: process.env.NODE_ENV === 'development' ? ['discovery', 'info', 'query'] : false,
    logger: (message: string) => {
        const cleanMessage = message;
        logger.log(cleanMessage, 'MikroORM');
    },
    highlighter: noColorHighlighter,
});

// CLI 配置（直接使用环境变量）
const cliConfig = defineConfig({
    ...baseConfig,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    dbName: process.env.DB_DATABASE,
    driverOptions: {
        connection: {
            timezone: process.env.DB_TIMEZONE,
            charset: 'utf8mb4_general_ci',
        },
    },
});

export const mikroOrmConfig = () => {
    const configService = new ConfigService();

    return defineConfig({
        ...baseConfig,
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        user: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        dbName: configService.get<string>('DB_DATABASE'),
    });
};

export default cliConfig;
