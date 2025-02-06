import { Controller, Get, SerializeOptions } from '@nestjs/common';
import { ConfigService } from '@/modules/config/config.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@/modules/auth/decorators/public.decorator';

/**
 * Demo配置演示控制器
 * @description 用于演示配置模块的使用方式
 */
@ApiTags('配置演示')
@Public()
@Controller('demo-config')
export class DemoConfigController {
    constructor(private readonly configService: ConfigService) { }

    @Get('')
    @ApiOperation({ summary: '获取应用配置信息' })
    getConfig() {
        // 添加更多的配置信息检查
        const appConfig = this.configService.app;
        const dbConfig = {
            host: this.configService.database.host,
            port: this.configService.database.port,
            database: this.configService.database.database,
        };

        return {
            app: appConfig,
            database: dbConfig,
            environment: this.configService.get<string>('NODE_ENV'),
        };
    }
}
