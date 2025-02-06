# XDD-API 新手部署指南 🚀

## 目录

- [前置准备](#前置准备)
- [部署步骤](#部署步骤)
- [常见问题](#常见问题)
- [运维指南](#运维指南)
- [安全建议](#安全建议)

## 前置准备

### 1. 硬件要求 💻

| 配置项 | 最低要求 | 推荐配置 |
| ------ | -------- | -------- |
| CPU    | 2核      | 4核      |
| 内存   | 4GB      | 8GB      |
| 硬盘   | 20GB     | 50GB     |
| 带宽   | 2Mbps    | 5Mbps    |

### 2. 软件要求 📦

- 操作系统：Ubuntu 20.04+ / CentOS 8+ / Windows 10 Pro+
- Docker: 24.0.0+
- Docker Compose: v2.0.0+
- Git: 任意最新版本

### 3. 端口使用 🔌

| 端口 | 服务    | 说明           |
| ---- | ------- | -------------- |
| 3100 | API服务 | 主应用服务端口 |
| 3306 | MySQL   | 数据库服务端口 |
| 3006 | Adminer | 数据库管理界面 |

⚠️ **注意**：请确保这些端口未被其他服务占用！

## 部署步骤

### 1. 安装 Docker 🐳

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户添加到 docker 组（可选，但推荐）
sudo usermod -aG docker $USER
newgrp docker  # 使用户组变更生效
```

### 2. 安装 Docker Compose 🐙

```bash
# 下载 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 添加执行权限
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version
```

### 3. 获取项目代码 📂

```bash
# 克隆项目
git clone <repository_url>
cd xdd-api

# 切换到生产分支
git checkout main
```

### 4. 配置环境变量 ⚙️

```bash
# 复制环境变量模板
cp .env.example .env.production

# 修改生产环境配置
nano .env.production  # 或者使用 vim .env.production
```

⚠️ **必须修改的重要配置**：

```ini
# 数据库密码（使用强密码！）
DB_PASSWORD=<生成一个强密码>

# JWT密钥（使用随机字符串！）
JWT_ACCESS_SECRET=<使用 openssl rand -base64 32 生成>
JWT_REFRESH_SECRET=<使用 openssl rand -base64 32 生成>
```

🔐 **生成安全的随机值**：

```bash
# 生成数据库密码
openssl rand -base64 24

# 生成 JWT 密钥
openssl rand -base64 32
```

### 5. 启动服务 🚀

```bash
# 进入 docker 目录
cd docker

# 启动所有服务
docker-compose --env-file ../.env.production up -d --build

# 查看服务状态
docker-compose ps
```

### 6. 执行数据库迁移 🔄

```bash
# 等待几秒钟确保数据库服务完全启动
sleep 10

# 执行迁移
docker exec -it xdd-api pnpm migration:up
```

### 7. 验证部署 ✅

访问以下地址检查服务是否正常运行：

- API服务：http://你的域名:3100
- API文档：http://你的域名:3100/api-docs
- 数据库管理：http://你的域名:3006

## 常见问题

### 1. 服务无法启动？🤔

```bash
# 1. 检查环境变量
cat .env.production

# 2. 检查服务日志
docker-compose logs -f api
docker-compose logs -f db

# 3. 检查端口占用
netstat -tunlp | grep -E '3100|3306|3006'
```

### 2. 数据库连接失败？🔍

```bash
# 1. 检查数据库服务状态
docker-compose ps db

# 2. 检查数据库日志
docker-compose logs db

# 3. 尝试直接连接数据库
docker exec -it xdd-mysql mysql -u xdd_user -p
```

### 3. 日志相关问题？📝

```bash
# 1. 检查日志目录权限
ls -la logs/

# 2. 修复日志目录权限
sudo chown -R 1000:1000 logs/
sudo chmod -R 755 logs/

# 3. 查看错误日志
tail -f logs/error.log
```

## 运维指南

### 1. 服务管理 🛠️

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启特定服务
docker-compose restart api    # 重启 API 服务
docker-compose restart db     # 重启数据库

# 查看日志
docker-compose logs -f       # 查看所有日志
docker-compose logs -f api   # 只看 API 日志
```

### 2. 数据库维护 💾

```bash
# 备份数据库
docker exec xdd-mysql mysqldump -u xdd_user -p<你的密码> xdd-api > backup_$(date +%Y%m%d).sql

# 还原数据库
docker exec -i xdd-mysql mysql -u xdd_user -p<你的密码> xdd-api < backup.sql
```

### 3. 更新应用 🔄

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建并启动
docker-compose down
docker-compose --env-file ../.env.production up -d --build

# 3. 执行数据库迁移
docker exec -it xdd-api pnpm migration:up
```
