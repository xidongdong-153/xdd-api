export interface AppConfig {
    name: string;
    env: string;
    port: number;
    apiPrefix: string;
    apiVersion: string;
}

export interface DatabaseConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    timezone: string;
}

export interface LoggerConfig {
    level: string;
    path: string;
    maxFiles: string;
    maxSize: string;
}

export interface JwtConfig {
    accessSecret: string;
    refreshSecret: string;
    expiresIn: string;
}

export interface Config {
    app: AppConfig;
    database: DatabaseConfig;
    logger: LoggerConfig;
    jwt: JwtConfig;
}
