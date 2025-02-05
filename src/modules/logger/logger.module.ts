import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from '@/config';
import { LoggerService } from './services/logger.service';

@Global()
@Module({
    imports: [WinstonModule.forRoot(loggerConfig)],
    providers: [LoggerService],
    exports: [LoggerService],
})
export class LoggerModule {}
