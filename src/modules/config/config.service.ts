import { AppConfig } from '@/config/interfaces/app-config.interface';
import { DatabaseConfig, JwtConfig, LoggerConfig } from '@/config/interfaces/config.interface';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
    private readonly serviceLogger = new Logger(ConfigService.name);

    constructor(private configService: NestConfigService) {
        this.serviceLogger.debug(`Current NODE_ENV: ${this.get('NODE_ENV')}`);
        this.validateConfig();
    }

    get<T>(key: string): T {
        const value = this.configService.get<T>(key);
        if (value === undefined) {
            this.serviceLogger.warn(`Configuration key "${key}" is not defined`);
        }
        return value;
    }

    get app(): AppConfig {
        return this.getConfig<AppConfig>('app');
    }

    get database(): DatabaseConfig {
        return this.getConfig<DatabaseConfig>('database');
    }

    get loggerConfig(): LoggerConfig {
        return this.getConfig<LoggerConfig>('logger');
    }

    get jwt(): JwtConfig {
        return this.getConfig<JwtConfig>('jwt');
    }

    getSecretValue(key: string): string {
        const value = this.get<string>(key);
        if (!value) {
            this.serviceLogger.error(`Secret configuration key "${key}" is not defined`);
            throw new Error(`Configuration key "${key}" is not defined`);
        }
        return value;
    }

    private validateConfig() {
        const requiredConfigs = ['app', 'database', 'logger', 'jwt'];
        for (const config of requiredConfigs) {
            const value = this.configService.get(config);
            if (!value) {
                throw new Error(`Missing required config: ${config}`);
            }
        }
    }

    private getConfig<T>(key: string): T {
        const config = this.configService.get<T>(key);
        if (!config) {
            this.serviceLogger.error(`${key} configuration is not properly loaded`);
            throw new Error(`${key} configuration is missing`);
        }
        return config;
    }

    debugConfig() {
        const envVars = {
            NODE_ENV: this.get('NODE_ENV'),
            APP_NAME: this.get('APP_NAME'),
            PORT: this.get('PORT'),
            DB_HOST: this.get('DB_HOST'),
            DB_PORT: this.get('DB_PORT'),
            DB_DATABASE: this.get('DB_DATABASE'),
        };

        this.serviceLogger.debug(
            `Current Environment Variables:\n${JSON.stringify(envVars, null, 2)}`,
            ConfigService.name,
        );
    }
}
