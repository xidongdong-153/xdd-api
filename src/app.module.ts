import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/modules/database/database.module';
import { CoreModule } from '@/modules/core/core.module';
import { DemoModule } from '@/modules/demo/demo.module';
import { mikroOrmConfig } from '@/config';
import { LoggerModule } from '@/modules/logger/logger.module';
// import { LoggerMiddleware } from '@/modules/logger/middlewares/logger.middleware';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { LoggerInterceptor } from '@/modules/logger/providers/logger.interceptor';
import { AppPipe } from '@/modules/core/providers/app.pipe';
import { AppFilter } from '@/modules/core/providers/app.filter';
import { AppInterceptor } from '@/modules/core/providers/app.interceptor';
import { ConfigModule } from '@/modules/config/config.module';

@Module({
    imports: [
        ConfigModule,
        LoggerModule,
        DatabaseModule.forRoot(mikroOrmConfig()),
        CoreModule.forRoot(),
        DemoModule,
    ],
    providers: [
        {
            provide: APP_PIPE,
            useClass: AppPipe,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: AppInterceptor,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggerInterceptor,
        },
        { provide: APP_FILTER, useClass: AppFilter },
    ],
})
export class AppModule {}
