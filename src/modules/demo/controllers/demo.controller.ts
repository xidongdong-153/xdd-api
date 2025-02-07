import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseIntPipe,
    SerializeOptions,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

import { Public } from '@/modules/auth/decorators/public.decorator';
import { CreateDemoDto, UpdateDemoDto, PageDemoDto } from '@/modules/demo/dtos/demo.dto';
import { Demo } from '@/modules/demo/entities/demo.entity';
import { DemoService } from '@/modules/demo/services/demo.service';
import { LoggerService } from '@/modules/logger/services/logger.service';

/**
 * Demo 控制器
 * @description 提供演示数据的完整 CRUD 操作接口
 */
@ApiTags('基础演示')
@Public()
@Controller('demo')
export class DemoController {
    constructor(
        private readonly demoService: DemoService,
        private readonly logger: LoggerService,
    ) {}

    /**
     * 创建演示数据
     * @remarks 创建一条新的演示数据
     */
    @Post()
    @ApiResponse({
        status: 201,
        description: '创建成功',
        type: Demo,
    })
    @SerializeOptions({})
    create(@Body() createDemoDto: CreateDemoDto) {
        return this.demoService.create(createDemoDto);
    }

    /**
     * 获取演示数据列表
     * @remarks 获取所有演示数据的列表
     */
    @Get()
    @ApiResponse({
        status: 200,
        description: '获取成功',
        type: Demo,
        isArray: true,
    })
    @SerializeOptions({})
    async findAll(@Query() query: PageDemoDto) {
        const result = await this.demoService.paginate(query);

        // 记录查询结果
        this.logger.debug('查询结果', 'DemoController', {
            total: result.meta.totalItems,
            currentPage: result.meta.currentPage,
            itemCount: result.meta.itemCount,
        });

        return result;
    }

    /**
     * 获取单条演示数据
     * @remarks 根据ID获取指定的演示数据
     */
    @Get(':id')
    @ApiResponse({
        status: 200,
        description: '获取成功',
        type: Demo,
    })
    @SerializeOptions({})
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.demoService.detail(+id);
    }

    /**
     * 更新演示数据
     * @remarks 更新指定ID的演示数据
     */
    @Patch(':id')
    @ApiResponse({
        status: 200,
        description: '更新成功',
        type: Demo,
    })
    @SerializeOptions({})
    update(@Param('id', ParseIntPipe) id: string, @Body() updateDemoDto: UpdateDemoDto) {
        return this.demoService.update(+id, updateDemoDto);
    }

    /**
     * 删除演示数据
     * @remarks 删除指定ID的演示数据
     */
    @Delete(':id')
    @ApiResponse({
        status: 200,
        description: '删除成功',
    })
    @SerializeOptions({})
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.demoService.remove(+id);
    }
}
