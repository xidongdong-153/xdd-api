import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DynamicModule, Module } from '@nestjs/common';
import { Options } from '@mikro-orm/core';

@Module({})
export class DatabaseModule {
    static forRoot(options: Options): DynamicModule {
        return {
            global: true,
            module: DatabaseModule,
            imports: [MikroOrmModule.forRoot(options)],
        };
    }
}
