import { Module } from '@nestjs/common';

import { ConfigModule } from '@/modules/config/config.module';

import { DemoConfigController } from './controllers/demo-config.controller';
import { DemoErrorController } from './controllers/demo-error.controller';
import { DemoTreeController } from './controllers/demo-tree.controller';
import { DemoController } from './controllers/demo.controller';
import { DemoErrorService } from './services/demo-error.service';
import { DemoTreeService } from './services/demo-tree.service';
import { DemoService } from './services/demo.service';

@Module({
    imports: [ConfigModule],
    controllers: [DemoController, DemoTreeController, DemoErrorController, DemoConfigController],
    providers: [DemoService, DemoTreeService, DemoErrorService],
})
export class DemoModule {}
