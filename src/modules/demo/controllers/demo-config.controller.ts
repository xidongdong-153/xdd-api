import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@/modules/config/config.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('配置测试')
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
