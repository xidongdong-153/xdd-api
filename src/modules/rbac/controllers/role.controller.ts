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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleService } from '../services/role.service';
import { CreateRoleDto, UpdateRoleDto, QueryRoleDto, AssignPermissionsDto } from '../dtos/rbac.dto';
import { RequirePermissions } from '../decorators/requires-permissions.decorator';

@Controller('roles')
@ApiTags('角色管理')
@ApiBearerAuth('jwt')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Post()
    @RequirePermissions('role:create')
    @ApiOperation({ summary: '创建角色', description: '创建一个新角色' })
    create(@Body() dto: CreateRoleDto) {
        return this.roleService.create(dto);
    }

    @Get()
    @RequirePermissions('role:read')
    @ApiOperation({ summary: '查询角色列表', description: '分页查询角色列表' })
    findAll(@Query() query: QueryRoleDto) {
        return this.roleService.findByQuery(query);
    }

    @Get(':id')
    @RequirePermissions('role:read')
    @ApiOperation({ summary: '查询角色详情', description: '根据ID查询角色详情' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.roleService.detail(id);
    }

    @Patch(':id')
    @RequirePermissions('role:update')
    @ApiOperation({ summary: '更新角色', description: '根据ID更新角色信息' })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
        return this.roleService.update(id, dto);
    }

    @Delete(':id')
    @RequirePermissions('role:delete')
    @ApiOperation({ summary: '删除角色', description: '根据ID删除角色' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.roleService.remove(id);
    }

    @Post(':id/permissions')
    @RequirePermissions('role:assign-permission')
    @ApiOperation({ summary: '分配权限', description: '为指定角色分配权限' })
    assignPermissions(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignPermissionsDto) {
        return this.roleService.assignPermissions(id, dto);
    }
}
