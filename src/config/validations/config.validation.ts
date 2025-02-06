import * as Joi from 'joi';

export const validationSchema = Joi.object({
    // 应用配置验证
    APP_NAME: Joi.string().required(),
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(3100),
    API_PREFIX: Joi.string().default('api'),
    API_VERSION: Joi.string().default('v1'),

    // 数据库配置验证
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(3306),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),
    DB_TIMEZONE: Joi.string().default('+08:00'),

    // 日志配置验证
    LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
    LOG_PATH: Joi.string().default('logs'),
    LOG_MAX_FILES: Joi.string().default('14d'),
    LOG_MAX_SIZE: Joi.string().default('20m'),

    // JWT配置验证
    JWT_ACCESS_SECRET: Joi.string().required(),
    JWT_REFRESH_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().default('7d'),
});
