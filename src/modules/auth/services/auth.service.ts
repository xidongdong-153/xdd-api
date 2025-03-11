import { EntityManager } from '@mikro-orm/core';
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as argon2 from 'argon2';

import { ConfigService } from '@/modules/config/config.service';
import { UserStatus } from '@/modules/user/entities/user.entity';
import { User } from '@/modules/user/entities/user.entity';

import { LoginDto, RegisterDto, RefreshTokenDto } from '../dtos/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly em: EntityManager,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async validateUser(credential: string, password: string): Promise<User> {
        const user = await this.em.findOne(User, [{ username: credential }, { email: credential }]);

        if (!user) {
            throw new UnauthorizedException('用户名或密码错误');
        }

        // 检查用户状态
        switch (user.status) {
            case UserStatus.Locked:
                throw new UnauthorizedException('账号已被锁定');
            case UserStatus.Inactive:
                throw new UnauthorizedException('账号未激活');
            case UserStatus.Suspended:
                throw new UnauthorizedException('账号已被暂停');
            case UserStatus.PendingVerification:
                throw new UnauthorizedException('账号待验证');
        }

        const isValid = await argon2.verify(user.password, password);
        if (!isValid) {
            // 更新登录尝试次数
            user.loginAttempts += 1;

            // 如果登录失败次数过多，锁定账号
            if (user.loginAttempts >= 5) {
                user.status = UserStatus.Locked;
                await this.em.flush();
                throw new UnauthorizedException('登录失败次数过多，账号已被锁定');
            }

            await this.em.flush();
            throw new UnauthorizedException('用户名或密码错误');
        }

        // 登录成功，重置登录尝试次数
        user.loginAttempts = 0;
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
            user: {
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                email: user.email,
                avatar: user.avatar,
                status: user.status,
            },
        };
    }

    async register(dto: RegisterDto) {
        // 检查用户名和邮箱是否已存在
        const exists = await this.em.findOne(User, [
            { username: dto.username },
            { email: dto.email },
        ]);

        if (exists) {
            if (exists.username === dto.username) {
                throw new ConflictException('用户名已存在');
            }
            if (exists.email === dto.email) {
                throw new ConflictException('邮箱已存在');
            }
        }

        const user = new User();
        user.username = dto.username;
        user.nickname = dto.username; // 默认使用用户名作为昵称
        user.email = dto.email;
        user.password = await argon2.hash(dto.password);
        user.status = UserStatus.PendingVerification;

        await this.em.persistAndFlush(user);

        const [accessToken, refreshToken] = await Promise.all([
            this.generateAccessToken(user),
            this.generateRefreshToken(user),
        ]);

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                email: user.email,
                status: user.status,
            },
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

            // 检查用户状态
            if (user.status !== UserStatus.Active) {
                throw new UnauthorizedException('账号状态异常，请重新登录');
            }

            const accessToken = await this.generateAccessToken(user);

            return {
                accessToken,
                user: {
                    id: user.id,
                    username: user.username,
                    nickname: user.nickname,
                    email: user.email,
                    avatar: user.avatar,
                    status: user.status,
                },
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
            status: user.status,
        };

        return this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            expiresIn: '45m',
        });
    }

    private async generateRefreshToken(user: User): Promise<string> {
        const payload = {
            sub: user.id,
        };

        return this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
        });
    }
}
