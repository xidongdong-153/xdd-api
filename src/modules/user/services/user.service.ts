import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto, QueryUserDto, ChangePasswordDto } from '../dtos/user.dto';
import * as argon2 from 'argon2';
import { BaseService } from '@/modules/database/base/base.service';

@Injectable()
export class UserService extends BaseService<User> {
    constructor(protected readonly em: EntityManager) {
        super(em, User);
    }

    async create(dto: CreateUserDto): Promise<User> {
        // 检查用户名和邮箱是否已存在
        const exists = await this.em.findOne(User, [
            { username: dto.username },
            { email: dto.email },
        ]);

        if (exists) {
            throw new NotFoundException('用户名或邮箱已存在');
        }

        const user = new User();
        user.username = dto.username;
        user.email = dto.email;
        user.password = await argon2.hash(dto.password);
        user.lastLoginAt = null;

        await this.em.persistAndFlush(user);
        return user;
    }

    async update(id: number, dto: UpdateUserDto): Promise<User> {
        const user = await this.detail(id);

        if (dto.username) user.username = dto.username;
        if (dto.email) user.email = dto.email;
        if (dto.status) user.status = dto.status;

        await this.em.flush();
        return user;
    }

    async findByQuery(query: QueryUserDto) {
        const where: any = {};

        if (query.username) {
            where.username = { $like: `%${query.username}%` };
        }

        if (query.email) {
            where.email = { $like: `%${query.email}%` };
        }

        if (query.status) {
            where.status = query.status;
        }

        return this.list(where);
    }

    async changePassword(id: number, dto: ChangePasswordDto): Promise<void> {
        const user = await this.detail(id);

        const isValid = await argon2.verify(user.password, dto.oldPassword);
        if (!isValid) {
            throw new NotFoundException('旧密码不正确');
        }

        user.password = await argon2.hash(dto.newPassword);
        await this.em.flush();
    }
}
