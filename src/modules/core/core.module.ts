// core.module.ts
import { MiddlewareConsumer, Module, NestModule, DynamicModule } from '@nestjs/common';

import { ConfigService } from '@/modules/config/config.service';
import { LoggerModule } from '@/modules/logger/logger.module';
import { LoggerMiddleware } from '@/modules/logger/middlewares/logger.middleware';

@Module({})
export class CoreModule implements NestModule {
    // 实现 NestModule 接口
    static forRoot(): DynamicModule {
        return {
            module: CoreModule,
            global: true,
            providers: [ConfigService], // 把 ConfigService 放在 providers 里
            exports: [ConfigService], // 导出 ConfigService，其他模块才能用
            imports: [LoggerModule], // 如果 LoggerMiddleware 依赖其他模块，就加在这里
        };
    }

    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes(``);
    }
}
