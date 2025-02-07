import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { mikroOrmConfig } from '@/config';
import { CoreModule } from '@/modules/core/core.module';
import { AppFilter } from '@/modules/core/providers/app.filter';
import { AppInterceptor } from '@/modules/core/providers/app.interceptor';
import { AppPipe } from '@/modules/core/providers/app.pipe';
import { DatabaseModule } from '@/modules/database/database.module';
import { DemoModule } from '@/modules/demo/demo.module';
import { LoggerModule } from '@/modules/logger/logger.module';

import { LoggerInterceptor } from '@/modules/logger/providers/logger.interceptor';

import { AuthModule } from './modules/auth/auth.module';
import { RBACModule } from './modules/rbac/rbac.module';
import { UserModule } from './modules/user/user.module';

@Module({
    imports: [
        LoggerModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env'],
        }),
        MikroOrmModule.forRoot(mikroOrmConfig()),
        UserModule,
        RBACModule,
        AuthModule,
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
