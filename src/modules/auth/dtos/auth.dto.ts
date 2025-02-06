import { IsString, IsNotEmpty, IsEmail, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DtoValidation } from '@/modules/core/decorators/dto-validation.decorator';

/**
 * 登录数据传输对象
 */
@DtoValidation({ groups: ['login'] })
export class LoginDto {
    /**
     * 用户名或邮箱
     * @example "admin"
     */
    @ApiProperty({ description: '用户名或邮箱' })
    @IsString({ message: '用户名/邮箱必须是字符串', groups: ['login'] })
    @IsNotEmpty({ message: '用户名/邮箱不能为空', groups: ['login'] })
    credential!: string;

    /**
     * 密码
     * @example "Admin123!"
     */
    @ApiProperty({ description: '密码' })
    @IsString({ message: '密码必须是字符串', groups: ['login'] })
    @IsNotEmpty({ message: '密码不能为空', groups: ['login'] })
    password!: string;
}

/**
 * 注册数据传输对象
 */
@DtoValidation({ groups: ['register'] })
export class RegisterDto {
    /**
     * 用户名
     * @example "admin"
     */
    @ApiProperty({ description: '用户名' })
    @IsString({ message: '用户名必须是字符串', groups: ['register'] })
    @IsNotEmpty({ message: '用户名不能为空', groups: ['register'] })
    username!: string;

    /**
     * 密码
     * @example "Admin123!"
     */
    @ApiProperty({ description: '密码' })
    @IsString({ message: '密码必须是字符串', groups: ['register'] })
    @MinLength(8, { message: '密码长度不能小于8位', groups: ['register'] })
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: '密码必须包含大小写字母、数字或特殊字符',
        groups: ['register'],
    })
    password!: string;

    /**
     * 邮箱
     * @example "admin@example.com"
     */
    @ApiProperty({ description: '邮箱' })
    @IsEmail({}, { message: '邮箱格式不正确', groups: ['register'] })
    @IsNotEmpty({ message: '邮箱不能为空', groups: ['register'] })
    email!: string;
}

/**
 * 刷新Token数据传输对象
 */
@DtoValidation({ groups: ['refresh'] })
export class RefreshTokenDto {
    /**
     * 刷新Token
     * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     */
    @ApiProperty({ description: '刷新Token' })
    @IsString({ message: '刷新Token必须是字符串', groups: ['refresh'] })
    @IsNotEmpty({ message: '刷新Token不能为空', groups: ['refresh'] })
    refreshToken!: string;
}
