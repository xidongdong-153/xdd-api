# RBAC 权限管理模块设计

## 1. 简介

嗨，这篇文档介绍我们系统中的 RBAC（基于角色的访问控制）实现。整个权限系统由用户、角色和权限三个核心模块组成，它们相互配合，构成了一个完整的权限管理体系。

## 2. 核心模块设计

### 2.1 用户模块

用户是系统的核心，负责管理用户信息和认证。

#### 2.1.1 用户实体

```typescript
@Entity()
export class User extends BaseEntity {
    @Property({ unique: true })
    username!: string; // 用户名，唯一标识

    @Property()
    @Exclude()
    password!: string; // 密码，加密存储

    @Property({ unique: true })
    email!: string; // 邮箱，用于通知和找回密码

    @Enum(() => UserStatus)
    status: UserStatus = UserStatus.Active; // 用户状态

    @ManyToMany(() => Role)
    roles = new Collection<Role>(this); // 用户拥有的角色

    @Property({ nullable: true })
    lastLoginAt?: Date | null; // 最后登录时间
}
```

#### 2.1.2 核心功能

- 用户注册和认证
- 个人信息管理
- 密码修改和重置
- 用户状态管理
- 角色分配

### 2.2 角色模块

角色是权限的载体，用于批量管理权限。

#### 2.2.1 角色实体

```typescript
@Entity()
export class Role extends BaseEntity {
    @Property()
    name!: string; // 角色名称，如"管理员"

    @Property({ nullable: true })
    description?: string; // 角色描述

    @Property({ default: false })
    isSystem: boolean = false; // 系统角色标记

    @ManyToMany(() => Permission)
    permissions = new Collection<Permission>(this); // 角色包含的权限

    @ManyToMany(() => User, (user) => user.roles)
    users = new Collection<User>(this); // 拥有该角色的用户
}
```

#### 2.2.2 核心功能

- 角色管理
- 权限分配
- 系统角色维护
- 用户关联

### 2.3 权限模块

权限是功能访问控制的最小单位。

#### 2.3.1 权限实体

```typescript
@Entity()
export class Permission extends BaseEntity {
    @Property({ unique: true })
    code!: string; // 权限编码，如 'user:create'

    @Property()
    name!: string; // 权限名称，如 '创建用户'

    @Property()
    description?: string; // 权限描述

    @Property()
    module!: string; // 所属模块，如 'user'

    @Property()
    action!: string; // 操作类型，如 'create'

    @ManyToMany(() => Role, (role) => role.permissions)
    roles = new Collection<Role>(this); // 包含此权限的角色
}
```

## 3. 权限控制实现

### 3.1 权限检查装饰器

用于在方法级别声明所需权限：

```typescript
@RequirePermissions('user:create')
async createUser() {
    // 创建用户的具体实现
}
```

### 3.2 权限守卫

负责拦截请求并进行权限验证：

```typescript
@Injectable()
export class PermissionGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        // 获取方法所需权限
        const permissions = this.reflector.get<string[]>(PERMISSIONS_KEY, context.getHandler());

        // 无权限要求则放行
        if (!permissions) {
            return true;
        }

        // 获取当前用户
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // 验证用户权限
        return this.rbacService.checkPermissions(user.id, permissions);
    }
}
```

### 3.3 RBAC 服务

处理权限验证的核心逻辑：

```typescript
@Injectable()
export class RBACService {
    async checkPermissions(userId: number, permissions: string[]): Promise<boolean> {
        // 查询用户及其角色和权限
        const user = await this.em.findOne(
            User,
            { id: userId },
            {
                populate: ['roles.permissions'],
            },
        );

        if (!user) return false;

        // 获取用户所有权限
        const userPermissions = user.roles
            .getItems()
            .flatMap((role) => role.permissions.getItems())
            .map((permission) => permission.code);

        // 验证是否具有所需权限
        return permissions.every((permission) => userPermissions.includes(permission));
    }
}
```

## 4. 最佳实践

### 4.1 权限命名规范

权限编码采用 `module:action` 格式：

- `user:create` - 创建用户
- `role:assign` - 分配角色
- `permission:delete` - 删除权限

### 4.2 角色设计原则

1. 使用系统角色标记保护重要角色
2. 角色名称要体现业务含义
3. 遵循最小权限原则

### 4.3 权限粒度控制

1. 模块级权限：控制模块访问
2. 操作级权限：控制功能操作
3. 数据级权限：控制数据访问

## 5. API 接口

### 5.1 用户接口

- POST /users - 创建用户
- GET /users - 获取用户列表
- GET /users/:id - 获取用户详情
- PATCH /users/:id - 更新用户信息
- DELETE /users/:id - 删除用户
- POST /users/:id/change-password - 修改密码

### 5.2 角色接口

- POST /roles - 创建角色
- GET /roles - 获取角色列表
- GET /roles/:id - 获取角色详情
- PATCH /roles/:id - 更新角色信息
- DELETE /roles/:id - 删除角色
- POST /roles/:id/permissions - 分配权限

### 5.3 权限接口

- POST /permissions - 创建权限
- GET /permissions - 获取权限列表
- GET /permissions/:id - 获取权限详情
- PATCH /permissions/:id - 更新权限信息
- DELETE /permissions/:id - 删除权限

## 6. 使用示例

### 6.1 创建和分配角色

```typescript
// 创建角色
const role = await roleService.create({
    name: '内容编辑',
    description: '负责内容编辑和审核',
    permissions: [1, 2, 3], // 初始权限
});

// 更新角色权限
await roleService.assignPermissions(role.id, {
    permissions: [4, 5, 6], // 新权限列表
});
```

### 6.2 用户角色分配

```typescript
// 创建用户并分配角色
const user = await userService.create({
    username: 'editor',
    password: 'Secure123!',
    email: 'editor@example.com',
    roles: [1, 2], // 角色列表
});
```

## 7. 注意事项

1. 权限变更需要重新登录生效
2. 谨慎操作系统角色
3. 权限编码确定后避免修改
4. 注意权限继承的复杂性
5. 定期清理冗余权限和角色

## 8. 后续优化

1. 实现权限缓存机制
2. 添加权限继承关系
3. 实现数据级权限控制
4. 添加权限变更审计
5. 支持权限模板功能
