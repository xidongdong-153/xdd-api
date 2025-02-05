import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import metadata from '@/metadata';
import { ConfigService } from '@/modules/config/config.service';

async function bootstrap() {
    // 创建应用实例时就使用Winston
    const app = await NestFactory.create(AppModule, {
        // 禁用默认的日志
        logger: false,
    });

    // 使用Winston Logger
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

    const configService = app.get(ConfigService);
    const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

    try {
        // 启动时检查配置
        logger.log(`Current Environment: ${process.env.NODE_ENV}`, 'Bootstrap');
        configService.debugConfig();

        const config = new DocumentBuilder()
            .setTitle(configService.app.name)
            .setDescription('API文档描述')
            .setVersion('1.0')
            .build();
        await SwaggerModule.loadPluginMetadata(metadata);
        const documentFactory = () => SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api-docs', app, documentFactory);

        // 设置全局前缀
        app.setGlobalPrefix(configService.app.apiPrefix);

        app.enableCors();
        const port = configService.app.port;
        await app.listen(port);

        // 使用 Winston Logger 输出启动信息
        logger.log(`应用程序已启动: http://localhost:${port}`, 'Bootstrap');
        logger.log(`API文档地址: http://localhost:${port}/api-docs`, 'Bootstrap');
        logger.log(`API前缀: ${configService.app.apiPrefix}`, 'Bootstrap');
    } catch (error) {
        logger.error('应用程序启动失败:', error);
        process.exit(1);
    }
}

bootstrap();
