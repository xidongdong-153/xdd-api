import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import metadata from '@/metadata';
import { ConfigService } from '@/modules/config/config.service';
import { ValidationPipe } from '@nestjs/common';

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
            .setTitle('XDD API')
            .setDescription('XDD API 接口文档')
            .setVersion('1.0')
            .addBearerAuth(
                {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    name: 'JWT',
                    description: '输入 JWT token',
                    in: 'header',
                },
                'jwt', // 这个名字要记住，在 @ApiBearerAuth() 装饰器中要用到
            )
            .build();
        await SwaggerModule.loadPluginMetadata(metadata);
        const documentFactory = () => SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api-docs', app, documentFactory);

        // 配置全局验证管道
        app.useGlobalPipes(
            new ValidationPipe({
                transform: true,
                whitelist: true,
                forbidNonWhitelisted: true,
                validationError: { target: false },
            }),
        );

        // 设置全局前缀
        app.setGlobalPrefix('api');

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
