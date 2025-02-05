# XDD API

基于 NestJS 框架开发的 API 服务。

## 技术栈

- **Node.js**: v18+
- **NestJS**: v10.x
- **MikroORM**: v6.x
- **MySQL**: 数据库
- **TypeScript**: v5.x

## 项目结构

```
src/
├── config/                 # 配置文件目录
├── modules/                # 模块目录
│   ├── demo/               # 示例模块
│   │   ├── controllers/    # 控制器
│   │   ├── dtos/           # 数据传输对象
│   │   ├── entities/       # 实体类
│   │   ├── providers/      # 服务提供者
│   │   └── services/       # 服务
│   ├── core/               # 核心模块
│   │   └── providers/      # 核心服务提供者
│   └── database/           # 数据库模块
└── main.ts                 # 应用程序入口文件
```

## 开发环境部署

### 前置要求

- Node.js v18+
- pnpm
- Docker & Docker Compose
- Git

### 部署步骤

1. 克隆项目

```bash
git clone <项目地址>
cd xdd-api
```

2. 安装依赖

```bash
pnpm install
```

3. 启动 MySQL 数据库（使用 Docker Compose）

```bash
# 启动 MySQL 和 Adminer
docker-compose -f mysql-compose.yml up -d
```

MySQL 配置信息：

- 数据库：xdd-admin-api
- 用户名：xdd_user
- 密码：xdd123456
- 端口：3306

> Adminer（数据库管理工具）访问地址：http://localhost:3006

4. 初始化数据库

```bash
# 首次运行，创建数据库表结构
pnpm schema:create

# 或者运行数据库迁移
pnpm migration:up
```

5. 启动开发服务器

```bash
pnpm start:dev
```

现在你可以访问 http://localhost:3100 来使用 API 服务了。

## 安装

```bash
# 安装依赖
pnpm install

# 开发环境运行
pnpm start:dev

# 生产环境构建
pnpm build

# 生产环境运行
pnpm start:prod
```

## 开发

```bash
# 代码格式化
pnpm format

# 代码检查
pnpm lint

# 运行测试
pnpm test
```

## 数据库操作

项目使用 MikroORM 作为 ORM 框架，配置文件位于 `src/config/mikro-orm.config.ts`。

### 数据库配置

项目默认使用 MySQL 数据库，配置如下：

```typescript
{
    host: 'localhost',
    port: 3306,
    user: 'xdd_user',
    password: 'xdd123456',
    dbName: 'xdd-api',
    entities: ['dist/**/*.entity.js'],
    entitiesTs: ['src/**/*.entity.ts'],
    debug: true,
    loadStrategy: LoadStrategy.JOINED,
    extensions: [Migrator],
    migrations: {
        path: 'dist/migrations',
        pathTs: 'src/migrations',
    },
    driverOptions: {
        connection: {
            timezone: '+08:00',
            charset: 'utf8mb4_general_ci',
        },
    },
}
```

主要配置说明：

- **连接配置**

    - `host`: 数据库主机地址
    - `port`: 数据库端口
    - `user`: 数据库用户名
    - `password`: 数据库密码
    - `dbName`: 数据库名称

- **实体配置**

    - `entities`: 编译后的实体文件路径
    - `entitiesTs`: TypeScript 源码中的实体文件路径
    - `loadStrategy`: 实体加载策略，使用 JOINED 策略优化查询性能

- **迁移配置**

    - `migrations.path`: 编译后的迁移文件路径
    - `migrations.pathTs`: TypeScript 源码中的迁移文件路径

- **驱动配置**
    - `timezone`: 设置为东八区
    - `charset`: 使用 utf8mb4 字符集

### 数据库模块集成

在 `src/modules/database/database.module.ts` 中，我们通过 `DatabaseModule` 统一管理数据库连接：

```typescript
@Module({})
export class DatabaseModule {
    static forRoot(options: Options): DynamicModule {
        return {
            global: true,
            module: DatabaseModule,
            imports: [MikroOrmModule.forRoot(options)],
        };
    }
}
```

### 实体定义示例

```typescript
import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '../core/entities/base.entity';

@Entity()
export class Demo extends BaseEntity {
    @Property()
    name: string;

    @Property({ nullable: true })
    description?: string;

    @Property()
    status: number = 1;

    @Property()
    sort: number = 0;
}
```

### 常用数据库操作

1. **查询操作**

```typescript
// 查找所有记录
const demos = await this.em.find(Demo, {});

// 条件查询
const demo = await this.em.findOne(Demo, { id });

// 分页查询
const [demos, total] = await this.em.findAndCount(
    Demo,
    {},
    {
        limit: 10,
        offset: 0,
        orderBy: { createdAt: 'DESC' },
    },
);
```

2. **新增操作**

```typescript
// 创建实体
const demo = this.em.create(Demo, createDto);

// 保存到数据库
await this.em.persistAndFlush(demo);
```

3. **更新操作**

```typescript
// 更新实体
demo.assign(updateDto);

// 保存更改
await this.em.flush();
```

4. **删除操作**

```typescript
// 软删除
demo.isDeleted = true;
await this.em.flush();

// 硬删除
await this.em.removeAndFlush(demo);
```

5. **事务操作**

```typescript
await this.em.transactional(async (em) => {
    const demo = em.create(Demo, createDto);
    await em.persistAndFlush(demo);
    // 其他操作...
});
```

### 查询构建器

MikroORM 提供了强大的查询构建器功能：

```typescript
// 复杂查询示例
const qb = this.em.createQueryBuilder(Demo);
const demos = await qb
    .select('*')
    .where({ status: 1 })
    .andWhere({ isDeleted: false })
    .orderBy({ createdAt: 'DESC' })
    .limit(10)
    .offset(0)
    .getResult();
```

### 关联关系

MikroORM 支持多种关联关系：

1. **一对一关系**

```typescript
@Entity()
class UserProfile {
    @OneToOne()
    user: User;
}

@Entity()
class User {
    @OneToOne(() => UserProfile, (profile) => profile.user)
    profile: UserProfile;
}
```

2. **一对多关系**

```typescript
@Entity()
class User {
    @OneToMany(() => Post, (post) => post.author)
    posts = new Collection<Post>(this);
}

@Entity()
class Post {
    @ManyToOne()
    author: User;
}
```

3. **多对多关系**

```typescript
@Entity()
class User {
    @ManyToMany(() => Role)
    roles = new Collection<Role>(this);
}

@Entity()
class Role {
    @ManyToMany(() => User, (user) => user.roles)
    users = new Collection<User>(this);
}
```

### 优化

1. **查询优化**

    - 使用适当的索引
    - 避免 N+1 查询问题
    - 合理使用延迟加载和预加载

2. **缓存策略**

    - 启用实体缓存
    - 使用查询缓存
    - 合理设置缓存失效时间

3. **连接池配置**

    - 根据实际需求配置连接池大小
    - 监控连接池使用情况
    - 及时释放不需要的连接

4. **批量操作**
    - 使用批量插入和更新
    - 合理使用事务
    - 避免频繁的单条操作

### 最佳实践

1. **实体设计**

    - 使用合适的字段类型
    - 添加必要的索引
    - 遵循命名规范
    - 合理使用关联关系

2. **查询编写**

    - 只查询需要的字段
    - 使用适当的查询条件
    - 注意查询性能
    - 合理使用分页

3. **事务管理**

    - 确保事务边界明确
    - 避免长事务
    - 正确处理事务回滚
    - 注意事务隔离级别

4. **错误处理**
    - 捕获并处理数据库异常
    - 提供友好的错误信息
    - 记录关键操作日志
    - 实现重试机制

### MikroORM CLI 命令

#### 数据库结构命令

```bash
# 创建数据库表结构
pnpm schema:create

# 更新数据库表结构
pnpm schema:update

# 删除数据库表结构（慎用）
pnpm schema:drop

# 刷新数据库结构（删除并重新创建）
pnpm schema:fresh
```

#### 迁移相关命令

```bash
# 创建新的数据库迁移文件
pnpm migration:create

# 执行向上迁移（应用迁移）
pnpm migration:up

# 执行向下迁移（回滚迁移）
pnpm migration:down

# 查看待执行的迁移列表
pnpm migration:pending

# 查看已执行的迁移历史
pnpm migration:list
```

#### 实体生成命令

```bash
# 从现有数据库生成实体类
pnpm entity:generate

# 从实体类生成 TS 类型
pnpm entity:type-generate
```

### 命令使用场景说明

#### Schema 命令

- `schema:create`

    - 场景：首次部署项目时使用
    - 作用：根据实体类定义创建所有数据库表
    - 注意：仅在空数据库中使用，已有数据会报错

- `schema:update`

    - 场景：开发环境中，实体类发生变化时使用
    - 作用：将数据库表结构更新为最新的实体定义
    - 注意：可能会导致数据丢失，生产环境请使用迁移

- `schema:drop`

    - 场景：需要完全重置数据库时使用
    - 作用：删除所有数据库表
    - 注意：会删除所有数据，请谨慎使用

- `schema:fresh`
    - 场景：需要重置数据库结构时使用
    - 作用：删除所有表并重新创建
    - 注意：会删除所有数据，通常用于开发环境

#### Migration 命令

- `migration:create`

    - 场景：需要对数据库结构进行变更时
    - 作用：创建新的迁移文件
    - 用法：`pnpm migration:create --name=AddUserTable`
    - 说明：会在 migrations 目录下创建时间戳命名的迁移文件

- `migration:up`

    - 场景：需要应用新的数据库变更时
    - 作用：执行所有未应用的迁移
    - 用法：可指定步数 `pnpm migration:up --steps=1`
    - 说明：按时间顺序执行迁移文件中的 up 方法

- `migration:down`

    - 场景：需要回滚数据库变更时
    - 作用：回滚最近的迁移
    - 用法：可指定步数 `pnpm migration:down --steps=1`
    - 说明：按时间顺序倒序执行迁移文件中的 down 方法

- `migration:pending`

    - 场景：部署前检查待执行的迁移
    - 作用：显示所有未执行的迁移列表
    - 说明：帮助了解即将进行的数据库变更

- `migration:list`
    - 场景：查看迁移历史记录
    - 作用：显示所有已执行的迁移列表
    - 说明：帮助追踪数据库变更历史

#### Entity 命令

- `entity:generate`

    - 场景：从现有数据库反向工程实体类
    - 作用：根据数据库表结构生成 TypeScript 实体类
    - 说明：适用于已有数据库的项目迁移

- `entity:type-generate`
    - 场景：需要实体类的类型定义时
    - 作用：为实体类生成 TypeScript 类型定义
    - 说明：帮助改善类型提示和代码补全

### 实践

1. 开发环境：

    - 可以使用 `schema:update` 快速更新表结构
    - 建议同时创建迁移文件，方便后续部署

2. 生产环境：

    - 严禁使用 schema 相关命令直接修改数据库
    - 必须使用迁移来管理数据库变更
    - 部署前先在测试环境验证迁移脚本
    - 建议保留回滚方案（down 方法）

3. 迁移管理：
    - 迁移文件应该是幂等的
    - 每个迁移应该只做一件事
    - 保持迁移文件的可读性和可维护性
    - 在提交代码前测试迁移的 up 和 down 方法

## OpenAPI 文档

服务默认运行在 `http://localhost:3100`，API 文档地址为 `http://localhost:3100/api-docs`。

### Swagger OpenAPI 配置

项目使用 `@nestjs/swagger` 包来生成 OpenAPI (Swagger) 文档。主要配置位于 `src/main.ts` 和 `nest-cli.json` 中。

#### CLI 插件配置

NestJS 提供了一个 CLI 插件，可以通过 TypeScript 编译过程来增强 Swagger 文档的生成。插件可以自动：

1. 为所有 DTO 属性添加 `@ApiProperty` 注解（除非使用了 `@ApiHideProperty`）
2. 根据问号设置 required 属性（例如 `name?: string` 会设置 `required: false`）
3. 根据类型设置 type 或 enum 属性（支持数组）
4. 根据默认值设置 default 属性
5. 基于 class-validator 装饰器设置验证规则（当 classValidatorShim 设置为 true 时）
6. 为每个端点添加带有适当状态和类型的响应装饰器
7. 基于注释生成属性和端点的描述（当 introspectComments 设置为 true 时）
8. 基于注释生成属性的示例值（当 introspectComments 设置为 true 时）

注意：文件名必须具有以下后缀之一：['.dto.ts', '.entity.ts']（例如：create-user.dto.ts）才能被插件分析。

##### 插件配置示例

```json
{
    "collection": "@nestjs/schematics",
    "sourceRoot": "src",
    "compilerOptions": {
        "plugins": [
            {
                "name": "@nestjs/swagger",
                "options": {
                    "classValidatorShim": true,
                    "introspectComments": true,
                    "dtoFileNameSuffix": [".dto.ts", ".entity.ts"],
                    "controllerFileNameSuffix": ".controller.ts",
                    "dtoKeyOfComment": "description",
                    "controllerKeyOfComment": "summary"
                }
            }
        ]
    }
}
```

##### 配置选项说明

| 选项                     | 默认值                    | 描述                                 |
| ------------------------ | ------------------------- | ------------------------------------ |
| dtoFileNameSuffix        | ['.dto.ts', '.entity.ts'] | DTO 文件后缀                         |
| controllerFileNameSuffix | .controller.ts            | 控制器文件后缀                       |
| classValidatorShim       | true                      | 是否复用 class-validator 验证装饰器  |
| dtoKeyOfComment          | 'description'             | 设置注释文本到 ApiProperty 的属性键  |
| controllerKeyOfComment   | 'summary'                 | 设置注释文本到 ApiOperation 的属性键 |
| introspectComments       | false                     | 是否基于注释生成描述和示例值         |

##### 注释生成文档示例

1. **DTO 属性注释**

```typescript
// 原始代码（不使用插件）
export class CreateUserDto {
    @ApiProperty({
        description: '用户邮箱',
        example: 'user@example.com',
    })
    email: string;

    @ApiProperty({
        description: '用户密码',
        example: '123456',
    })
    password: string;
}

// 使用插件后（启用 introspectComments）
export class CreateUserDto {
    /**
     * 用户邮箱
     * @example user@example.com
     */
    email: string;

    /**
     * 用户密码
     * @example 123456
     */
    password: string;
}
```

2. **控制器方法注释**

```typescript
// 原始代码（不使用插件）
@Post()
@ApiOperation({
    summary: '创建新用户',
    description: '此操作允许创建一个新的用户账户'
})
@ApiResponse({ status: 201, description: '用户创建成功' })
async createUser(@Body() createUserDto: CreateUserDto) {}

// 使用插件后（启用 introspectComments）
/**
 * 创建新用户
 *
 * @remarks 此操作允许创建一个新的用户账户
 * @throws {400} 请求参数验证失败
 * @throws {201} 用户创建成功
 */
@Post()
async createUser(@Body() createUserDto: CreateUserDto) {}
```

3. **枚举类型注释**

```typescript
/**
 * 用户角色枚举
 * @example ['admin']
 */
export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

export class CreateUserDto {
    /**
     * 用户角色列表
     * @example ['admin']
     */
    roles: UserRole[] = [];
}
```

##### 实践

1. **注释规范**

    - 使用清晰的描述性语言
    - 包含必要的示例值
    - 说明可能的错误情况
    - 保持注释的一致性

2. **类型定义**

    - 使用准确的类型定义
    - 合理使用可选属性
    - 为枚举类型提供说明
    - 使用适当的默认值

3. **验证规则**

    - 配合使用 class-validator 装饰器
    - 提供合适的验证消息
    - 设置合理的验证规则
    - 处理好可选字段的验证

4. **文档维护**
    - 及时更新注释
    - 保持示例值的有效性
    - 确保描述的准确性
    - 定期检查文档生成结果

#### 基础配置

在 `src/main.ts` 中的配置：

```typescript
const config = new DocumentBuilder()
    .setTitle('XDD API') // API文档标题
    .setDescription('API文档描述') // API文档描述
    .setVersion('1.0') // 版本号
    .build();

const documentFactory = () => SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api-docs', app, documentFactory);
```

在 `nest-cli.json` 中的插件配置：

```json
{
    "compilerOptions": {
        "plugins": [
            {
                "name": "@nestjs/swagger",
                "options": {
                    "classValidatorShim": true,
                    "introspectComments": true
                }
            }
        ]
    }
}
```

#### 常用装饰器

1. **控制器装饰器**

```typescript
@ApiTags('模块名称') // 定义模块分组
@Controller('demo')
export class DemoController {}
```

2. **接口装饰器**

```typescript
@ApiOperation({ summary: '接口说明' })  // 接口描述
@ApiResponse({ status: 200, description: '成功响应说明', type: ResponseType })  // 响应说明
@Get()
findAll() {}
```

3. **参数装饰器**

```typescript
@ApiQuery({ name: 'page', type: Number, required: false })  // 查询参数
@ApiParam({ name: 'id', type: String })  // 路径参数
@ApiBody({ type: CreateDemoDto })  // 请求体
```

4. **DTO 装饰器**

```typescript
@ApiProperty({
    description: '名称',
    example: '示例名称',
    required: true
})
name: string;
```

5. **实体装饰器**

```typescript
@ApiTags('实体名称')
@Entity()
export class Demo {
    @ApiProperty({ description: '主键ID' })
    @PrimaryKey()
    id: number;
}
```

#### 高级用法

1. **分组和版本**

```typescript
@ApiTags('v1/demo')
@Controller({ path: 'demo', version: '1' })
export class DemoController {}
```

2. **安全认证**

```typescript
// 全局配置
const config = new DocumentBuilder()
    .addBearerAuth()
    .build();

// 控制器或方法配置
@ApiBearerAuth()
@UseGuards(AuthGuard)
```

3. **请求示例**

```typescript
@ApiBody({
    type: CreateDemoDto,
    examples: {
        example1: {
            summary: '示例1',
            value: { name: 'test', description: 'description' }
        }
    }
})
```

4. **Schema 定义**

```typescript
@ApiExtraModels(PaginatedResponse)
@ApiOkResponse({
    schema: {
        allOf: [
            { $ref: getSchemaPath(PaginatedResponse) },
            {
                properties: {
                    results: {
                        type: 'array',
                        items: { $ref: getSchemaPath(Demo) }
                    }
                }
            }
        ]
    }
})
```

#### 实践

1. **文档注释**

```typescript
/**
 * 创建新的演示数据
 * @remarks 此操作将在数据库中创建一条新记录
 * @param createDemoDto - 创建数据传输对象
 * @returns 返回创建的实体对象
 * @throws {BadRequestException} 当数据验证失败时抛出
 */
@Post()
@ApiOperation({ summary: '创建演示数据' })
create(@Body() createDemoDto: CreateDemoDto) {}
```

2. **响应封装**

```typescript
@ApiResponse({
    status: 200,
    description: '操作成功',
    schema: {
        type: 'object',
        properties: {
            code: { type: 'number', example: 0 },
            data: { $ref: getSchemaPath(Demo) },
            message: { type: 'string', example: '操作成功' }
        }
    }
})
```

3. **枚举处理**

```typescript
export enum UserRole {
    ADMIN = 'admin',
    USER = 'user'
}

@ApiProperty({
    enum: UserRole,
    description: '用户角色',
    example: UserRole.USER
})
role: UserRole;
```

4. **文件上传**

```typescript
@ApiConsumes('multipart/form-data')
@ApiBody({
    schema: {
        type: 'object',
        properties: {
            file: {
                type: 'string',
                format: 'binary',
            },
        },
    },
})
@Post('upload')
uploadFile(@UploadedFile() file: Express.Multer.File) {}
```

### 访问和使用

1. 启动服务后访问 `http://localhost:3100/api-docs`
2. 文档界面提供以下功能：
    - API 接口列表和分组
    - 请求参数说明和示例
    - 在线接口测试
    - 响应格式预览
    - 模型（Schema）定义
    - 认证功能

### 注意事项

1. 保持文档的实时性

    - 及时更新 API 文档
    - 确保示例代码可用
    - 维护文档注释

2. 安全考虑

    - 生产环境可以禁用 Swagger
    - 敏感信息不要在文档中展示
    - 添加适当的访问控制

3. 性能优化
    - 按需加载文档
    - 合理使用缓存
    - 控制文档大小

## 核心功能实现

### 实现原理概述

本项目采用了 NestJS 框架提供的多层架构，通过拦截器、过滤器、管道等机制实现了请求处理的完整生命周期管理：

```
请求 → 拦截器(前) → 管道 → 控制器 → 服务 → 拦截器(后) → 响应
         ↓              ↓        ↓        ↓         ↓
      序列化          验证     路由     业务逻辑   格式化
         ↓              ↓        ↓        ↓         ↓
    异常过滤器 ← ← ← ← ← ← ← ← ← 错误处理 → → → → → →
```

#### 请求生命周期

1. **请求进入**：

    - 客户端发起 HTTP 请求
    - 首先经过全局中间件的处理（如 CORS、压缩等）

2. **拦截器（前置处理）**：

    - 处理请求上下文信息
    - 进行请求参数的序列化和转换
    - 可以修改请求对象

3. **管道处理**：

    - 执行参数验证和转换
    - 确保数据符合预期的格式和规则
    - 处理 DTO (Data Transfer Object) 的验证

4. **控制器处理**：

    - 根据路由规则分发请求
    - 解析请求参数
    - 调用相应的处理方法

5. **服务层处理**：

    - 执行具体的业务逻辑
    - 进行数据库操作
    - 调用外部服务
    - 处理业务规则

6. **拦截器（后置处理）**：

    - 转换和格式化响应数据
    - 添加额外的响应头
    - 处理响应缓存

7. **错误处理**：

    - 在整个生命周期中，任何阶段出现的异常都会被异常过滤器捕获
    - 统一的错误响应格式
    - 根据异常类型返回适当的 HTTP 状态码

8. **响应返回**：
    - 将处理结果返回给客户端
    - 确保响应格式统一
    - 处理响应头和状态码

### 响应序列化实现原理

`AppInterceptor` 通过继承 `ClassSerializerInterceptor` 实现了响应数据的自动序列化：

1. **拦截机制**

```typescript
@Injectable()
export class AppInterceptor extends ClassSerializerInterceptor {
    intercept(context: ExecutionContext, next: CallHandler) {
        return next.handle().pipe(map((data) => this.serialize(data)));
    }
}
```

2. **序列化流程**

- 使用 `class-transformer` 处理实体类的序列化
- 支持 `@Exclude()` 和 `@Expose()` 装饰器控制字段暴露
- 处理嵌套对象和循环引用
- 自动转换日期和特殊类型

3. **分页数据处理**

```typescript
private handlePaginatedData(data: any) {
    if ('items' in data && 'meta' in data) {
        return {
            ...data,
            items: this.serializeItems(data.items)
        };
    }
    return data;
}
```

### 异常过滤实现原理

`AppFilter` 通过继承 `BaseExceptionFilter` 实现了统一的异常处理：

1. **异常捕获链**

```typescript
@Catch()
export class AppFilter extends BaseExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        // 1. 尝试处理 HTTP 异常
        if (exception instanceof HttpException) {
            return this.handleHttpException(exception, host);
        }

        // 2. 尝试处理数据库异常
        if (this.isDatabaseException(exception)) {
            return this.handleDatabaseException(exception, host);
        }

        // 3. 处理未知异常
        return this.handleUnknownError(exception, host);
    }
}
```

2. **异常映射机制**

```typescript
private mapException(exception: Error): ErrorResponse {
    const mapping = this.exceptionMappings.find(
        m => exception instanceof m.class
    );

    return {
        statusCode: mapping?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: mapping?.message || exception.message,
        // ... 其他错误信息
    };
}
```

3. **错误响应格式化**

- 统一的错误响应结构
- 安全的错误信息处理
- 开发环境错误堆栈

### 参数验证实现原理

`AppPipe` 通过继承 `ValidationPipe` 实现了请求参数的验证和转换：

1. **验证流程**

```typescript
@Injectable()
export class AppPipe extends ValidationPipe {
    async transform(value: any, metadata: ArgumentMetadata) {
        // 1. 获取验证选项
        const options = this.getValidationOptions(metadata);

        // 2. 转换数据类型
        const toValidate = this.toValidate(metadata, value);

        // 3. 执行验证
        const errors = await this.validate(toValidate, options);

        // 4. 处理验证结果
        if (errors.length > 0) {
            throw new BadRequestException(this.formatErrors(errors));
        }

        return value;
    }
}
```

2. **装饰器实现**

```typescript
export const DtoValidation = (options?: ValidatorOptions) => {
    return (target: any) => {
        // 设置元数据
        Reflect.defineMetadata(DTO_VALIDATION_OPTIONS, options || {}, target);
    };
};
```

3. **验证规则处理**

- 支持嵌套验证
- 自定义验证规则
- 条件验证
- 分组验证

### 数据转换实现原理

1. **类型转换**

```typescript
private transformValue(value: any, metatype: any) {
    if (!metatype || !this.toValidate(metatype)) {
        return value;
    }

    // 处理数组
    if (Array.isArray(value)) {
        return value.map(v => this.transformValue(v, metatype));
    }

    // 处理普通值
    return plainToClass(metatype, value);
}
```

2. **自定义转换器**

```typescript
@Transform(({ value }) => {
    if (typeof value === 'string') {
        return value.trim();
    }
    return value;
})
```

3. **转换管道链**

- 类型转换
- 值清理
- 默认值处理
- 特殊类型转换

### 优化

1. **序列化优化**

- 使用类转换器缓存
- 按需序列化
- 避免深层嵌套

2. **验证优化**

- 验证规则缓存
- 跳过不必要的验证
- 并行验证处理

3. **异常处理优化**

- 异常类型快速判断
- 错误堆栈按需收集
- 日志级别控制

### 实践

1. **序列化处理**

- 使用 `@Exclude()` 默认隐藏敏感字段
- 通过 `@Expose()` 显式暴露必要字段
- 合理使用序列化组控制不同场景的数据展示

2. **异常处理**

- 定义业务异常基类
- 使用异常码区分异常类型
- 提供友好的错误信息

3. **参数验证**

- 组合使用多个验证规则
- 添加自定义验证消息
- 实现复杂的业务验证规则

## 模块开发

### 模块结构

每个功能模块应遵循以下目录结构：

```
modules/
└── your-module/
    ├── controllers/        # 控制器目录
    │   ├── *.controller.ts
    │   └── *.controller.spec.ts
    ├── services/          # 服务目录
    │   ├── *.service.ts
    │   └── *.service.spec.ts
    ├── dtos/             # 数据传输对象
    │   ├── create-*.dto.ts
    │   └── update-*.dto.ts
    ├── entities/         # 实体类
    │   └── *.entity.ts
    ├── interfaces/       # 接口定义
    │   └── *.interface.ts
    ├── constants/        # 常量定义
    │   └── *.constant.ts
    └── your-module.module.ts  # 模块定义文件
```

### 创建新模块

1. **创建模块文件**

```bash
# 使用 NestJS CLI 创建模块
nest g module your-module

# 创建控制器
nest g controller your-module

# 创建服务
nest g service your-module
```

2. **定义实体类**

```typescript
import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '../core/entities/base.entity';

@Entity()
export class YourEntity extends BaseEntity {
    @Property()
    name: string;

    @Property()
    description?: string;
}
```

3. **创建 DTO**

```typescript
import { IsString, IsOptional } from 'class-validator';

export class CreateYourEntityDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;
}
```

4. **实现服务**

```typescript
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { YourEntity } from '../entities/your-entity.entity';

@Injectable()
export class YourService {
    constructor(private readonly em: EntityManager) {}

    async findAll() {
        return this.em.find(YourEntity, {});
    }

    async create(data: CreateYourEntityDto) {
        const entity = this.em.create(YourEntity, data);
        await this.em.persistAndFlush(entity);
        return entity;
    }
}
```

5. **实现控制器**

```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { YourService } from '../services/your.service';
import { CreateYourEntityDto } from '../dtos/create-your-entity.dto';

@Controller('your-endpoint')
export class YourController {
    constructor(private readonly service: YourService) {}

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Post()
    create(@Body() createDto: CreateYourEntityDto) {
        return this.service.create(createDto);
    }
}
```

### 模块开发实践

1. **职责分离**

    - 控制器只负责处理 HTTP 请求和响应
    - 服务层包含所有业务逻辑
    - DTO 负责数据验证和转换
    - 实体类定义数据结构和关系

2. **依赖注入**

    - 使用构造函数注入依赖
    - 避免使用全局服务
    - 在模块中正确声明 providers

3. **错误处理**

    - 使用自定义异常过滤器
    - 统一错误响应格式
    - 适当的错误日志记录

4. **数据验证**

    - 使用 class-validator 进行输入验证
    - 在 DTO 中定义验证规则
    - 使用管道进行转换和验证

5. **测试覆盖**
    - 为每个服务编写单元测试
    - 为控制器编写集成测试
    - 保持较高的测试覆盖率

### 示例模块

参考 `demo` 模块的实现：

```typescript
// demo.module.ts
import { Module } from '@nestjs/common';
import { DemoController } from './controllers/demo.controller';
import { DemoService } from './services/demo.service';

@Module({
    controllers: [DemoController],
    providers: [DemoService],
})
export class DemoModule {}
```

更多示例代码可以参考 `src/modules/demo` 目录。

## 树形数据开发指南

### 实现原理

本项目采用邻接表(Adjacency List)模式结合物化路径(Materialized Path)来实现树形结构：

1. **邻接表模式**

    - 每个节点存储指向父节点的引用
    - 使用 `parent_id` 字段建立节点间的关系
    - 支持 `@ManyToOne` 和 `@OneToMany` 关联

2. **物化路径**
    - 存储从根节点到当前节点的完整路径
    - 使用点号分隔的ID序列，如 "1.2.3"
    - 便于快速查询祖先和后代节点

### 核心实体设计

```typescript
@Entity()
export class DemoTree {
    @PrimaryKey()
    id!: number;

    @Property()
    name!: string;

    @Property({ nullable: true })
    description?: string;

    @Property({ default: 0 })
    sort: number = 0;

    @Property({ default: 0 })
    level: number = 0;

    @ManyToOne(() => DemoTree, { nullable: true })
    parent?: DemoTree;

    @OneToMany(() => DemoTree, (node) => node.parent)
    children = new Collection<DemoTree>(this);

    @Property({ length: 255 })
    path: string = '';
}
```

### 主要功能实现

1. **树形结构查询**

```typescript
async findTree() {
    const allNodes = await this.em.find(DemoTree, {});
    const nodeMap = new Map<number, DemoTree>();

    // 构建节点映射
    allNodes.forEach(node => {
        node.children = new Collection<DemoTree>(node);
        nodeMap.set(node.id, node);
    });

    // 构建树形结构
    const roots: DemoTree[] = [];
    allNodes.forEach(node => {
        const parentId = node.parent?.id;
        if (!parentId || parentId === node.id || !nodeMap.has(parentId)) {
            roots.push(node);
        } else {
            const parent = nodeMap.get(parentId);
            parent.children.add(node);
        }
    });

    return roots;
}
```

2. **节点创建**

```typescript
async create(dto: CreateDemoTreeDto) {
    const node = this.em.create(DemoTree, {
        name: dto.name,
        description: dto.description,
        sort: dto.sort ?? 0,
    });

    // 设置父节点关系
    if (dto.parentId) {
        const parent = await this.findOne(dto.parentId);
        node.parent = parent;
        node.level = parent.level + 1;
    }

    // 生成物化路径
    await this.em.persistAndFlush(node);
    node.path = await this.generatePath(node, dto.parentId);
    await this.em.flush();

    return node;
}
```

3. **节点移动**

```typescript
async update(id: number, dto: UpdateDemoTreeDto) {
    const node = await this.findOne(id);

    if (dto.parentId !== undefined) {
        // 获取所有子孙节点
        const descendants = await this.getAllDescendants(id);

        // 更新父节点关系
        if (dto.parentId === null) {
            node.parent = null;
            node.level = 0;
            node.path = String(node.id);
        } else {
            const parent = await this.findOne(dto.parentId);
            node.parent = parent;
            node.level = parent.level + 1;
            node.path = await this.generatePath(node, dto.parentId);
        }

        // 更新所有子孙节点的路径
        for (const descendant of descendants) {
            const relativePathPart = descendant.path.substring(node.path.length);
            descendant.path = node.path + relativePathPart;
            descendant.level = descendant.path.split('.').length - 1;
        }
    }

    await this.em.flush();
    return node;
}
```

### 数据完整性

1. **约束检查**

    - 防止自引用：节点不能将自己设为父节点
    - 防止循环引用：不能将节点移动到其子节点下
    - 限制树的最大深度（默认10层）

2. **错误处理**

    ```typescript
    // 检查树的深度
    private checkDepth(path: string): void {
        const depth = path.split('.').length;
        if (depth > this.MAX_DEPTH) {
            throw new BadRequestException(`树的深度不能超过 ${this.MAX_DEPTH} 层`);
        }
    }

    // 检查循环引用
    if (descendants.some(d => d.id === parentId)) {
        throw new BadRequestException('不能将节点移动到其子节点下');
    }
    ```

### 实践

1. **设计**

    - 使用复合策略：邻接表 + 物化路径
    - 合理设置字段长度和索引
    - 实现软删除机制
    - 添加乐观锁控制并发

2. **性能**

    - 控制树的深度和广度
    - 分页加载大量子节点
    - 实现节点缓存机制
    - 优化批量操作性能

3. **扩展**

    - 实现节点拖拽排序
    - 支持节点展开/折叠
    - 添加节点访问控制
    - 实现树形数据导入导出

### 使用示例

1. **创建节点**

```typescript
// 创建根节点
const root = await demoTreeService.create({
    name: '根节点',
    description: '这是根节点',
});

// 创建子节点
const child = await demoTreeService.create({
    name: '子节点',
    parentId: root.id,
    sort: 1,
});
```

2. **查询树形结构**

```typescript
// 获取完整树
const tree = await demoTreeService.findTree();

// 获取指定节点的子节点
const children = await demoTreeService.findChildren(nodeId);

// 获取所有子孙节点
const descendants = await demoTreeService.getAllDescendants(nodeId);
```

3. **移动节点**

```typescript
// 移动节点到新的父节点下
await demoTreeService.update(nodeId, {
    parentId: newParentId,
});

// 将节点设为根节点
await demoTreeService.update(nodeId, {
    parentId: null,
});
```

### API 接口说明

| 接口                    | 方法   | 描述                   |
| ----------------------- | ------ | ---------------------- |
| /demo-tree/tree         | GET    | 获取完整树形结构       |
| /demo-tree              | GET    | 获取所有节点(扁平结构) |
| /demo-tree/:id          | GET    | 获取单个节点           |
| /demo-tree/:id/children | GET    | 获取子节点             |
| /demo-tree              | POST   | 创建节点               |
| /demo-tree/:id          | PATCH  | 更新节点               |
| /demo-tree/:id          | DELETE | 删除节点               |

## 测试

### 运行测试

```bash
# 单元测试
pnpm test

# 单元测试（监听模式）
pnpm test:watch

# e2e 测试
pnpm test:e2e

# 测试覆盖率报告
pnpm test:cov
```

### 理解测试结果

当运行测试后，你会看到类似这样的输出：

```
 PASS  src/modules/demo/controllers/demo.controller.spec.ts (5.526 s)
 PASS  src/modules/demo/services/demo.service.spec.ts (5.679 s)

Test Suites: 2 passed, 2 total
Tests:       16 passed, 16 total
Snapshots:   0 total
Time:        9.423 s
```

测试结果解释：

1. **测试文件状态**

    - `PASS`：表示测试文件中的所有测试用例都通过
    - `FAIL`：表示测试文件中有测试用例失败
    - 括号中的时间表示该文件的测试执行时间

2. **Test Suites（测试套件）**

    - 表示测试文件的数量
    - 例如：`2 passed, 2 total` 表示2个测试文件都通过了

3. **Tests（测试用例）**

    - 表示具体测试用例的数量
    - 例如：`16 passed, 16 total` 表示16个测试用例都通过了

4. **Snapshots（快照测试）**

    - 用于UI组件或数据结构的快照对比测试
    - `0 total` 表示没有使用快照测试

5. **Time（执行时间）**
    - 表示整个测试套件的总执行时间

可能的测试状态：

- `PASS`：测试通过
- `FAIL`：测试失败
- `SKIP`：测试被跳过
- `TODO`：测试待实现
- `PENDING`：测试等待执行

常见错误类型：

- 断言失败：实际结果与预期不符
- 语法错误：代码存在语法问题
- 超时错误：测试执行时间超过限制
- 依赖错误：测试依赖的模块或服务不可用

### NestJS 测试

在 NestJS 应用中，我们主要关注以下几个层面的测试：

#### 1. 服务层测试（Service Tests）

服务层包含主要的业务逻辑，是最重要的测试对象：

```typescript
// demo.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { DemoService } from './demo.service';
import { EntityManager } from '@mikro-orm/mysql';

describe('DemoService', () => {
    let service: DemoService;
    let em: EntityManager;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DemoService,
                {
                    provide: EntityManager,
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        persistAndFlush: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<DemoService>(DemoService);
        em = module.get<EntityManager>(EntityManager);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of demos', async () => {
            const result = [{ id: 1, name: 'Demo' }];
            jest.spyOn(em, 'find').mockResolvedValue(result);

            expect(await service.findAll()).toBe(result);
        });
    });

    describe('create', () => {
        it('should create a new demo', async () => {
            const createDto = { name: 'New Demo', description: 'Test' };
            jest.spyOn(em, 'persistAndFlush').mockResolvedValue(undefined);

            const result = await service.create(createDto);
            expect(result.name).toBe(createDto.name);
        });
    });
});
```

#### 2. 控制器测试（Controller Tests）

控制器测试关注 HTTP 请求处理和响应：

```typescript
// demo.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';

describe('DemoController', () => {
    let controller: DemoController;
    let service: DemoService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DemoController],
            providers: [
                {
                    provide: DemoService,
                    useValue: {
                        findAll: jest.fn(),
                        findOne: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                        remove: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<DemoController>(DemoController);
        service = module.get<DemoService>(DemoService);
    });

    describe('findAll', () => {
        it('should return an array of demos', async () => {
            const result = [{ id: 1, name: 'Demo' }];
            jest.spyOn(service, 'findAll').mockResolvedValue(result);

            expect(await controller.findAll()).toBe(result);
            expect(service.findAll).toHaveBeenCalled();
        });
    });
});
```

### 测试优先级

在 NestJS 应用中，建议按以下优先级编写测试：

1. **服务层测试（最重要）**

    - 包含核心业务逻辑
    - 需要最全面的测试覆盖
    - 测试所有可能的场景和边界条件

2. **控制器测试**

    - 验证请求处理和响应
    - 测试参数验证和转换
    - 测试错误处理

3. **E2E 测试**

    - 验证关键业务流程
    - 测试接口集成
    - 测试真实场景

4. **实体测试（可选）**
    - 只测试包含业务逻辑的方法
    - 验证计算属性
    - 验证实体关系

### 测试编写基本规则

1. **测试文件组织**

    - 测试文件与源文件放在同一目录下
    - 使用 `.spec.ts` 后缀命名单元测试
    - 使用 `.e2e-spec.ts` 后缀命名 E2E 测试

2. **依赖处理**

    - 使用 `@nestjs/testing` 包创建测试模块
    - 合理使用 Mock 替代外部依赖
    - 使用 `beforeEach` 重置测试状态

3. **异步测试**

    - 正确处理异步操作
    - 使用 `async/await` 语法
    - 注意异步错误处理

4. **测试隔离**
    - 每个测试用例独立运行
    - 避免测试间的状态共享
    - 清理测试数据和环境

### 常见测试场景

1. **数据库操作**

```typescript
describe('Database Operations', () => {
    it('should handle database errors', async () => {
        jest.spyOn(em, 'findOne').mockRejectedValue(new Error('DB Error'));

        await expect(service.findOne(1)).rejects.toThrow('DB Error');
    });
});
```

2. **验证和转换**

```typescript
describe('Validation', () => {
    it('should validate input data', async () => {
        const invalidDto = { name: '' };

        await expect(service.create(invalidDto)).rejects.toThrow('Name should not be empty');
    });
});
```

3. **错误处理**

```typescript
describe('Error Handling', () => {
    it('should handle not found error', async () => {
        jest.spyOn(em, 'findOne').mockResolvedValue(null);

        await expect(service.findOne(999)).rejects.toThrow('Demo not found');
    });
});
```

### 测试工具和技巧

1. **Jest 常用功能**

```typescript
// 监视函数调用
const spy = jest.spyOn(service, 'method');
expect(spy).toHaveBeenCalledWith(args);

// 模拟实现
jest.spyOn(service, 'method').mockImplementation(() => 'mock');

// 模拟异步
jest.spyOn(service, 'method').mockResolvedValue(result);
jest.spyOn(service, 'method').mockRejectedValue(new Error());
```

2. **测试辅助函数**

```typescript
// 创建测试数据
const createTestDemo = (override = {}) => ({
    id: 1,
    name: 'Test Demo',
    description: 'Test Description',
    ...override,
});

// 通用错误检查
const expectThrowsAsync = async (method, errorMessage) => {
    try {
        await method();
        fail('Expected to throw');
    } catch (e) {
        expect(e.message).toContain(errorMessage);
    }
};
```

### 测试覆盖率报告

运行 `pnpm test:cov` 后，你会看到类似这样的覆盖率报告：

```
-----------------|---------|----------|---------|---------|-------------------
File            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------|---------|----------|---------|---------|-------------------
All files       |   85.71 |    78.26 |   83.33 |   85.71 |
 demo.service.ts |   85.71 |    78.26 |   83.33 |   85.71 | 25-30,45-50
-----------------|---------|----------|---------|---------|-------------------
```

覆盖率指标说明：

1. **Statements（语句覆盖率）**

    - 表示代码中的语句被执行的百分比
    - 例如：`85.71%` 表示大约86%的代码语句被测试用例执行到了

2. **Branches（分支覆盖率）**

    - 表示代码中的条件分支（if/else等）被测试的百分比
    - 例如：`78.26%` 表示约78%的分支被测试覆盖

3. **Functions（函数覆盖率）**

    - 表示代码中的函数被调用的百分比
    - 例如：`83.33%` 表示约83%的函数被测试用例调用了

4. **Lines（行覆盖率）**

    - 表示代码行被执行的百分比
    - 例如：`85.71%` 表示约86%的代码行被执行

5. **Uncovered Line #s（未覆盖行号）**
    - 显示哪些代码行没有被测试覆盖
    - 例如：`25-30,45-50` 表示第25-30行和第45-50行没有被测试覆盖

测试覆盖率目标：

- 建议保持在80%以上的覆盖率
- 核心业务逻辑应该达到90%以上
- 重点关注分支覆盖率，确保各种条件都被测试
- 定期检查未覆盖的代码行，评估是否需要补充测试

## License

[MIT licensed](LICENSE)
