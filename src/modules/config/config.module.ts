import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { ConfigService } from '@/modules/config/config.service';
import { configurations } from '@/config/configurations';
import { validationSchema } from '@/config/validations/config.validation';

@Global()
@Module({
    imports: [
        NestConfigModule.forRoot({
            envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
            load: configurations,
            validationSchema: validationSchema,
            validationOptions: {
                allowUnknown: true,
                abortEarly: false,
            },
            expandVariables: true,
            cache: true,
            isGlobal: true,
        }),
    ],
    providers: [ConfigService],
    exports: [ConfigService],
})
export class ConfigModule {}
