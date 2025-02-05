# Git 提交规范

## 提交格式

```
<类型>[可选 范围]: <描述>

[可选 正文]

[可选 脚注]
```

## Commit 类型

- 🎯 `feat` - 新功能
- 🐛 `fix` - Bug 修复
- 📚 `docs` - 文档变更
- 🎨 `style` - 代码格式调整（不影响代码运行的变动）
- ♻️ `refactor` - 代码重构（既不修复错误也不添加功能）
- ⚡️ `perf` - 性能优化
- ✅ `test` - 添加或修改测试
- 🔧 `chore` - 构建过程或辅助工具的变动
- 🔨 `build` - 影响构建系统或外部依赖的更改
- 👷 `ci` - CI 配置文件和脚本的变动
- ⏪️ `revert` - 回退之前的提交

## 范围说明

范围应该是对改动模块的说明，例如：

- `feat(auth)`: 身份验证模块的新功能
- `fix(api)`: API 模块的 bug 修复
- `docs(readme)`: README 文档的变更

## 描述规范

- 使用中文
- 以动词开头，使用第三人称现在时
- 第一个字母不需要大写
- 结尾不加句号

## 正文规范

- 使用中文
- 说明代码变动的动机，以及与以前行为的对比

## 脚注规范

- 必须包含以下任意一种：
    - `BREAKING CHANGE`: 当前变动与上一版本不兼容的地方
    - `Closes`: 关闭相关 issue，例如：`Closes #123, #245`
    - `Refs`: 引用相关 issue 或 PR，例如：`Refs #123`

## 示例

```
feat(user): 添加用户登录功能

1. 实现用户名密码登录
2. 添加 JWT token 验证
3. 集成 Redis 存储 session

BREAKING CHANGE: 用户验证方式从 Session 改为 JWT
Closes #123
```

## Git 分支管理

- `main`: 主分支，用于生产环境
- `develop`: 开发分支，用于开发环境
- `feature/*`: 功能分支，用于开发新功能
- `hotfix/*`: 热修复分支，用于修复生产环境的紧急问题
- `release/*`: 发布分支，用于版本发布

## 提交前检查清单

- [ ] 代码是否通过 ESLint 检查
- [ ] 代码是否通过单元测试
- [ ] commit message 是否符合规范
- [ ] 是否在正确的分支上进行提交

## 工具建议

- 使用 `commitlint` 检查提交信息
- 使用 `husky` 配置 Git hooks
- 使用 `lint-staged` 在提交前进行代码检查
- 使用 `conventional-changelog` 生成变更日志
