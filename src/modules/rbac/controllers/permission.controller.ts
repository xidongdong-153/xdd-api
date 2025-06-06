import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    SerializeOptions,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { RequirePermissions } from '../decorators/requires-permissions.decorator';
import {
    CreatePermissionDto,
    UpdatePermissionDto,
    QueryPermissionDto,
} from '../dtos/permission.dto';
import { PermissionService } from '../services/permission.service';

@Controller('permissions')
@ApiTags('权限管理')
@ApiBearerAuth('jwt')
export class PermissionController {
    constructor(private readonly permissionService: PermissionService) {}

    @Post()
    @RequirePermissions('permission:create')
    @ApiOperation({ summary: '创建权限', description: '创建一个新权限' })
    @SerializeOptions({ groups: ['permission-detail'] })
    create(@Body() dto: CreatePermissionDto) {
        return this.permissionService.create(dto);
    }

    @Get()
    @RequirePermissions('permission:read')
    @ApiOperation({ summary: '查询权限列表', description: '分页查询权限列表' })
    @SerializeOptions({ groups: ['permission-list'] })
    findAll(@Query() query: QueryPermissionDto) {
        return this.permissionService.findByQuery(query);
    }

    @Get(':id')
    @RequirePermissions('permission:read')
    @ApiOperation({ summary: '查询权限详情', description: '根据ID查询权限详情' })
    @SerializeOptions({ groups: ['permission-detail'] })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.permissionService.detail(id, ['roles']);
    }

    @Patch(':id')
    @RequirePermissions('permission:update')
    @ApiOperation({ summary: '更新权限', description: '根据ID更新权限信息' })
    @SerializeOptions({ groups: ['permission-detail'] })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePermissionDto) {
        return this.permissionService.update(id, dto);
    }

    @Delete(':id')
    @RequirePermissions('permission:delete')
    @ApiOperation({ summary: '删除权限', description: '根据ID删除权限' })
    @SerializeOptions({ groups: ['permission-detail'] })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.permissionService.remove(id);
    }
}
