import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserModule } from './modules/user/user.module';
import { RBACModule } from './modules/rbac/rbac.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from '@/modules/database/database.module';
import { CoreModule } from '@/modules/core/core.module';
import { DemoModule } from '@/modules/demo/demo.module';
import { mikroOrmConfig } from '@/config';
import { LoggerModule } from '@/modules/logger/logger.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { LoggerInterceptor } from '@/modules/logger/providers/logger.interceptor';
import { AppPipe } from '@/modules/core/providers/app.pipe';
import { AppFilter } from '@/modules/core/providers/app.filter';
import { AppInterceptor } from '@/modules/core/providers/app.interceptor';

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
export class AppModule { }
