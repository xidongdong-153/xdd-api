import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    SerializeOptions,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { DemoTreeService } from '@/modules/demo/services/demo-tree.service';
import { CreateDemoTreeDto, UpdateDemoTreeDto } from '@/modules/demo/dtos/demo.dto';
import { DemoTree } from '@/modules/demo/entities/demo-tree.entity';
import { TreeNodeData } from '@/modules/core/types';
import { Public } from '@/modules/auth/decorators/public.decorator';

@ApiTags('基础树形结构演示')
@Public()
@Controller('demo-tree')
export class DemoTreeController {
    constructor(private readonly demoTreeService: DemoTreeService) { }

    /**
     * 获取树形结构
     * @remarks 获取完整的树形结构数据
     */
    @Get('tree')
    @ApiResponse({
        status: 200,
        description: '成功获取树形结构',
        type: DemoTree,
        isArray: true,
    })
    @SerializeOptions({})
    findTree(): Promise<TreeNodeData[]> {
        return this.demoTreeService.findTree();
    }

    /**
     * 获取所有节点（扁平结构）
     * @remarks 获取所有节点的扁平列表
     */
    @Get()
    @ApiResponse({
        status: 200,
        description: '成功获取所有节点',
        type: DemoTree,
        isArray: true,
    })
    @SerializeOptions({})
    findAll() {
        return this.demoTreeService.findAll();
    }

    /**
     * 获取指定节点的子节点
     * @remarks 获取指定节点的直接子节点
     */
    @Get(':id/children')
    @ApiResponse({
        status: 200,
        description: '成功获取子节点',
        type: DemoTree,
        isArray: true,
    })
    @SerializeOptions({})
    findChildren(@Param('id', ParseIntPipe) id: string) {
        return this.demoTreeService.findChildren(+id);
    }

    /**
     * 获取单个节点
     * @remarks 根据ID获取指定节点的详细信息
     */
    @Get(':id')
    @ApiResponse({
        status: 200,
        description: '成功获取节点信息',
        type: DemoTree,
    })
    @SerializeOptions({})
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.demoTreeService.findOne(+id);
    }

    /**
     * 创建节点
     * @remarks 创建新的树节点
     */
    @Post()
    @ApiResponse({
        status: 201,
        description: '节点创建成功',
        type: DemoTree,
    })
    @SerializeOptions({})
    create(@Body() createDemoTreeDto: CreateDemoTreeDto) {
        return this.demoTreeService.create(createDemoTreeDto);
    }

    /**
     * 更新节点
     * @remarks 更新指定节点的信息
     */
    @Patch(':id')
    @ApiResponse({
        status: 200,
        description: '节点更新成功',
        type: DemoTree,
    })
    @SerializeOptions({})
    update(@Param('id', ParseIntPipe) id: string, @Body() updateDemoTreeDto: UpdateDemoTreeDto) {
        return this.demoTreeService.update(+id, updateDemoTreeDto);
    }

    /**
     * 删除节点
     * @remarks 删除指定的节点
     */
    @Delete(':id')
    @ApiResponse({
        status: 200,
        description: '节点删除成功',
    })
    @SerializeOptions({})
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.demoTreeService.remove(+id);
    }
}
