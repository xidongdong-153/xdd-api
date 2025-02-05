import { Module } from '@nestjs/common';
import { DemoController } from './controllers/demo.controller';
import { DemoTreeController } from './controllers/demo-tree.controller';
import { DemoErrorController } from './controllers/demo-error.controller';
import { DemoConfigController } from './controllers/demo-config.controller';
import { DemoService } from './services/demo.service';
import { DemoTreeService } from './services/demo-tree.service';
import { DemoErrorService } from './services/demo-error.service';
import { ConfigModule } from '@/modules/config/config.module';

@Module({
    imports: [ConfigModule],
    controllers: [DemoController, DemoTreeController, DemoErrorController, DemoConfigController],
    providers: [DemoService, DemoTreeService, DemoErrorService],
})
export class DemoModule {}
