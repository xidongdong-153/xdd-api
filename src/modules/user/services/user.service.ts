import { EntityManager } from '@mikro-orm/core';
import {
    Injectable,
    BadRequestException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';

import * as argon2 from 'argon2';

import { BaseService } from '@/modules/database/base/base.service';
import { Role } from '@/modules/rbac/entities/role.entity';

import {
    CreateUserDto,
    UpdateUserDto,
    QueryUserDto,
    ChangePasswordDto,
    AssignRolesDto,
} from '../dtos/user.dto';
import { User, UserStatus } from '../entities/user.entity';

@Injectable()
export class UserService extends BaseService<User> {
    constructor(protected readonly em: EntityManager) {
        super(em, User);
    }

    async create(dto: CreateUserDto): Promise<User> {
        // 检查用户名、邮箱和手机号是否已存在
        const exists = await this.em.findOne(User, [
            { username: dto.username },
            { email: dto.email },
            ...(dto.phoneNumber ? [{ phoneNumber: dto.phoneNumber }] : []),
        ]);

        if (exists) {
            if (exists.username === dto.username) {
                throw new ConflictException('用户名已存在');
            }
            if (exists.email === dto.email) {
                throw new ConflictException('邮箱已存在');
            }
            if (exists.phoneNumber === dto.phoneNumber) {
                throw new ConflictException('手机号已存在');
            }
        }

        const user = new User();
        user.username = dto.username;
        user.nickname = dto.nickname;
        user.email = dto.email;
        user.password = await argon2.hash(dto.password);
        user.status = UserStatus.PendingVerification;

        if (dto.avatar) user.avatar = dto.avatar;
        if (dto.phoneNumber) user.phoneNumber = dto.phoneNumber;

        await this.em.persistAndFlush(user);
        return user;
    }

    async update(id: number, dto: UpdateUserDto): Promise<User> {
        const user = await this.detail(id);

        // 如果要更新用户名，检查是否已存在
        if (dto.username && dto.username !== user.username) {
            const exists = await this.em.findOne(User, { username: dto.username });
            if (exists) {
                throw new ConflictException('用户名已存在');
            }
            user.username = dto.username;
        }

        // 如果要更新邮箱，检查是否已存在
        if (dto.email && dto.email !== user.email) {
            const exists = await this.em.findOne(User, { email: dto.email });
            if (exists) {
                throw new ConflictException('邮箱已存在');
            }
            user.email = dto.email;
            user.isEmailVerified = false; // 更新邮箱后需要重新验证
        }

        // 如果要更新手机号，检查是否已存在
        if (dto.phoneNumber && dto.phoneNumber !== user.phoneNumber) {
            const exists = await this.em.findOne(User, { phoneNumber: dto.phoneNumber });
            if (exists) {
                throw new ConflictException('手机号已存在');
            }
            user.phoneNumber = dto.phoneNumber;
        }

        if (dto.nickname) user.nickname = dto.nickname;
        if (dto.avatar) user.avatar = dto.avatar;
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

        const { page, limit } = query;
        return this.paginate({
            page,
            limit,
            where,
        });
    }

    async changePassword(id: number, dto: ChangePasswordDto): Promise<void> {
        const user = await this.detail(id);

        const isValid = await argon2.verify(user.password, dto.oldPassword);
        if (!isValid) {
            throw new BadRequestException('旧密码不正确');
        }

        // 检查新密码是否与旧密码相同
        if (dto.oldPassword === dto.newPassword) {
            throw new BadRequestException('新密码不能与旧密码相同');
        }

        user.password = await argon2.hash(dto.newPassword);
        user.lastPasswordChange = new Date();
        await this.em.flush();
    }

    /**
     * 为用户分配角色
     */
    async assignRoles(id: number, dto: AssignRolesDto): Promise<User> {
        const user = await this.detail(id);
        const roles = await this.em.find(Role, { id: { $in: dto.roles } });

        if (roles.length !== dto.roles.length) {
            throw new NotFoundException('部分角色不存在');
        }

        user.roles.set(roles);
        await this.em.flush();
        return user;
    }

    /**
     * 获取用户的角色列表
     */
    async getUserRoles(id: number) {
        const user = await this.em.findOne(User, { id }, { populate: ['roles'] });
        if (!user) {
            throw new NotFoundException(`用户 ID ${id} 不存在`);
        }
        return user.roles;
    }

    /**
     * 移除用户的所有角色
     */
    async removeUserRoles(id: number): Promise<void> {
        const user = await this.detail(id);
        user.roles.removeAll();
        await this.em.flush();
    }

    /**
     * 移除用户的指定角色
     */
    async removeUserRole(userId: number, roleId: number): Promise<void> {
        const user = await this.em.findOne(User, { id: userId }, { populate: ['roles'] });
        if (!user) {
            throw new NotFoundException(`用户 ID ${userId} 不存在`);
        }

        const role = user.roles.getItems().find((r) => r.id === roleId);
        if (!role) {
            throw new NotFoundException(`用户没有ID为 ${roleId} 的角色`);
        }

        user.roles.remove(role);
        await this.em.flush();
    }
}
