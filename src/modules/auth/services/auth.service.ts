import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/core';
import { User } from '@/modules/user/entities/user.entity';
import { UserStatus } from '@/modules/user/constants/user.enum';
import { LoginDto, RegisterDto, RefreshTokenDto } from '../dtos/auth.dto';
import * as argon2 from 'argon2';
import { ConfigService } from '@/modules/config/config.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly em: EntityManager,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async validateUser(credential: string, password: string): Promise<User> {
        const user = await this.em.findOne(User, [{ username: credential }, { email: credential }]);

        if (!user) {
            throw new UnauthorizedException('用户名或密码错误');
        }

        if (user.status === UserStatus.Locked) {
            throw new UnauthorizedException('账号已被锁定');
        }

        if (user.status === UserStatus.Inactive) {
            throw new UnauthorizedException('账号未激活');
        }

        const isValid = await argon2.verify(user.password, password);
        if (!isValid) {
            throw new UnauthorizedException('用户名或密码错误');
        }

        return user;
    }

    async login(dto: LoginDto) {
        const user = await this.validateUser(dto.credential, dto.password);

        const [accessToken, refreshToken] = await Promise.all([
            this.generateAccessToken(user),
            this.generateRefreshToken(user),
        ]);

        user.lastLoginAt = new Date();
        await this.em.flush();

        return {
            accessToken,
            refreshToken,
        };
    }

    async register(dto: RegisterDto) {
        // 检查用户名和邮箱是否已存在
        const exists = await this.em.findOne(User, [
            { username: dto.username },
            { email: dto.email },
        ]);

        if (exists) {
            throw new UnauthorizedException('用户名或邮箱已存在');
        }

        const user = new User();
        user.username = dto.username;
        user.email = dto.email;
        user.password = await argon2.hash(dto.password);

        await this.em.persistAndFlush(user);

        const [accessToken, refreshToken] = await Promise.all([
            this.generateAccessToken(user),
            this.generateRefreshToken(user),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    async refreshToken(dto: RefreshTokenDto) {
        try {
            const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });

            const user = await this.em.findOne(User, { id: payload.sub });
            if (!user) {
                throw new UnauthorizedException('Token无效');
            }

            const accessToken = await this.generateAccessToken(user);

            return {
                accessToken,
            };
        } catch {
            throw new UnauthorizedException('Token无效或已过期');
        }
    }

    private async generateAccessToken(user: User): Promise<string> {
        const payload = {
            sub: user.id,
            username: user.username,
            email: user.email,
        };

        return this.jwtService.signAsync(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '15m',
        });
    }

    private async generateRefreshToken(user: User): Promise<string> {
        const payload = {
            sub: user.id,
        };

        return this.jwtService.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d',
        });
    }
}
