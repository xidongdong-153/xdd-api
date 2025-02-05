import { registerAs } from '@nestjs/config';

// 应用配置
export const appConfig = registerAs('app', () => ({
    name: process.env.APP_NAME,
    env: process.env.NODE_ENV,
    port: parseInt(process.env.PORT, 10),
    apiPrefix: process.env.API_PREFIX,
    apiVersion: process.env.API_VERSION,
}));

// 数据库配置
export const databaseConfig = registerAs('database', () => ({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    timezone: process.env.DB_TIMEZONE,
}));

// 日志配置
export const loggerConfig = registerAs('logger', () => ({
    level: process.env.LOG_LEVEL,
    path: process.env.LOG_PATH,
    maxFiles: process.env.LOG_MAX_FILES,
    maxSize: process.env.LOG_MAX_SIZE,
}));

// JWT配置
export const jwtConfig = registerAs('jwt', () => ({
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
}));

// 导出所有配置
export const configurations = [appConfig, databaseConfig, loggerConfig, jwtConfig];
