import { Body, Controller, Post, HttpCode, HttpStatus, SerializeOptions } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { Public } from '@/modules/auth/decorators/public.decorator';

import { LoginDto, RegisterDto, RefreshTokenDto } from '../dtos/auth.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
@ApiTags('认证')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: '用户登录', description: '使用用户名/邮箱和密码登录' })
    @SerializeOptions({ groups: ['user-detail'] })
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('register')
    @Public()
    @ApiOperation({ summary: '用户注册', description: '创建新用户并返回token' })
    @SerializeOptions({ groups: ['user-detail'] })
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('refresh')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: '刷新Token', description: '使用refreshToken获取新的accessToken' })
    refreshToken(@Body() dto: RefreshTokenDto) {
        return this.authService.refreshToken(dto);
    }
}
