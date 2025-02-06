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
import { UserService } from '../services/user.service';
import { CreateUserDto, UpdateUserDto, QueryUserDto, ChangePasswordDto } from '../dtos/user.dto';
import { RequirePermissions } from '@/modules/rbac/decorators/requires-permissions.decorator';

@Controller('users')
@ApiTags('用户管理')
@ApiBearerAuth('jwt')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    @RequirePermissions('user:create')
    @ApiOperation({ summary: '创建用户', description: '创建一个新用户' })
    create(@Body() dto: CreateUserDto) {
        return this.userService.create(dto);
    }

    @Get()
    @RequirePermissions('user:read')
    @ApiOperation({ summary: '查询用户列表', description: '分页查询用户列表' })
    findAll(@Query() query: QueryUserDto) {
        return this.userService.findByQuery(query);
    }

    @Get(':id')
    @RequirePermissions('user:read')
    @ApiOperation({ summary: '查询用户详情', description: '根据ID查询用户详情' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.userService.detail(id);
    }

    @Patch(':id')
    @RequirePermissions('user:update')
    @ApiOperation({ summary: '更新用户', description: '根据ID更新用户信息' })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
        return this.userService.update(id, dto);
    }

    @Delete(':id')
    @RequirePermissions('user:delete')
    @ApiOperation({ summary: '删除用户', description: '根据ID删除用户' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.userService.remove(id);
    }

    @Post(':id/change-password')
    @ApiOperation({ summary: '修改密码', description: '修改指定用户的密码' })
    changePassword(@Param('id', ParseIntPipe) id: number, @Body() dto: ChangePasswordDto) {
        return this.userService.changePassword(id, dto);
    }
}
