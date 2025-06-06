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
    Request,
    SerializeOptions,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { RequirePermissions } from '@/modules/rbac/decorators/requires-permissions.decorator';

import {
    CreateUserDto,
    UpdateUserDto,
    QueryUserDto,
    ChangePasswordDto,
    AssignRolesDto,
} from '../dtos/user.dto';
import { UserService } from '../services/user.service';

@Controller('users')
@ApiTags('用户管理')
@ApiBearerAuth('jwt')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('me')
    @ApiOperation({ summary: '获取当前用户信息', description: '获取当前登录用户的详细信息' })
    @SerializeOptions({ groups: ['user-detail'] })
    getCurrentUser(@Request() req: any) {
        return this.userService.detail(req.user.id, ['roles']);
    }

    @Post()
    @RequirePermissions('user:create')
    @ApiOperation({ summary: '创建用户', description: '创建一个新用户' })
    create(@Body() dto: CreateUserDto) {
        return this.userService.create(dto);
    }

    @Get()
    @RequirePermissions('user:read')
    @ApiOperation({ summary: '查询用户列表', description: '分页查询用户列表' })
    @SerializeOptions({ groups: ['user-list'] })
    findAll(@Query() query: QueryUserDto) {
        return this.userService.findByQuery(query);
    }

    @Get(':id')
    @RequirePermissions('user:read')
    @ApiOperation({ summary: '查询用户详情', description: '根据ID查询用户详情' })
    @SerializeOptions({ groups: ['user-detail'] })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.userService.detail(id, ['roles']);
    }

    @Patch(':id')
    @RequirePermissions('user:update')
    @ApiOperation({ summary: '更新用户', description: '根据ID更新用户信息' })
    @SerializeOptions({ groups: ['user-detail'] })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
        return this.userService.update(id, dto);
    }

    @Delete(':id')
    @RequirePermissions('user:delete')
    @ApiOperation({ summary: '删除用户', description: '根据ID删除用户' })
    @SerializeOptions({ groups: ['user-detail'] })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.userService.remove(id);
    }

    @Post(':id/change-password')
    @RequirePermissions('user:update')
    @ApiOperation({ summary: '修改密码', description: '修改指定用户的密码' })
    @SerializeOptions({ groups: ['user-detail'] })
    changePassword(@Param('id', ParseIntPipe) id: number, @Body() dto: ChangePasswordDto) {
        return this.userService.changePassword(id, dto);
    }

    @Post(':id/roles')
    @RequirePermissions('user:assign-role')
    @ApiOperation({ summary: '分配角色', description: '为指定用户分配角色' })
    @SerializeOptions({ groups: ['user-detail'] })
    assignRoles(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignRolesDto) {
        return this.userService.assignRoles(id, dto);
    }

    @Get(':id/roles')
    @RequirePermissions('user:read')
    @ApiOperation({ summary: '获取用户角色', description: '获取指定用户的角色列表' })
    @SerializeOptions({ groups: ['role-list'] })
    getUserRoles(@Param('id', ParseIntPipe) id: number) {
        return this.userService.getUserRoles(id);
    }

    @Delete(':id/roles')
    @RequirePermissions('user:assign-role')
    @ApiOperation({ summary: '移除所有角色', description: '移除指定用户的所有角色' })
    removeUserRoles(@Param('id', ParseIntPipe) id: number) {
        return this.userService.removeUserRoles(id);
    }

    @Delete(':userId/roles/:roleId')
    @RequirePermissions('user:assign-role')
    @ApiOperation({ summary: '移除指定角色', description: '移除指定用户的指定角色' })
    removeUserRole(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('roleId', ParseIntPipe) roleId: number,
    ) {
        return this.userService.removeUserRole(userId, roleId);
    }
}
