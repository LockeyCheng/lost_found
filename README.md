# 失物招领系统

一个完整的失物招领平台，使用现代Web技术栈构建。

## 🚀 技术栈

### 前端
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全
- **Material-UI (MUI)** - 组件库和样式
- **React Router DOM** - 路由管理
- **Axios** - HTTP客户端
- **date-fns** - 日期处理

### 后端
- **Node.js** - 运行时环境
- **Express** - Web框架
- **PostgreSQL** - 关系型数据库
- **JWT** - 用户认证
- **bcryptjs** - 密码加密
- **multer** - 文件上传
- **cors** - 跨域支持

## 📁 项目结构

```
lost-and-found-system/
├── backend/                    # 后端代码
│   ├── config/                # 配置文件
│   │   ├── db.js             # 数据库连接
│   │   └── init.sql          # 数据库初始化脚本
│   ├── routes/               # 路由文件
│   │   ├── auth.js           # 认证路由
│   │   ├── items.js          # 物品路由
│   │   └── clues.js          # 线索路由
│   ├── .env                  # 环境变量
│   ├── package.json          # 依赖配置
│   └── server.js             # 服务器入口
├── frontend/                  # 前端代码
│   ├── src/
│   │   ├── contexts/         # React上下文
│   │   ├── pages/            # 页面组件
│   │   ├── services/         # API服务
│   │   ├── App.tsx           # 主应用组件
│   │   └── index.tsx         # 入口文件
│   ├── .env                  # 环境变量
│   └── package.json          # 依赖配置
├── start.sh                  # 启动脚本
└── README.md                 # 项目说明
```

## 🎯 功能特性

### 用户功能
- ✅ 用户注册和登录
- ✅ JWT令牌认证
- ✅ 个人信息管理

### 物品管理
- ✅ 发布遗失物品
- ✅ 物品列表展示（支持搜索、筛选、分页）
- ✅ 物品详情查看
- ✅ 更新物品状态（遗失中/已找到/已归还）
- ✅ 删除物品

### 线索功能
- ✅ 为物品提供线索
- ✅ 线索列表展示
- ✅ 上传线索图片
- ✅ 删除线索

### 其他功能
- ✅ 图片上传和预览
- ✅ 响应式设计
- ✅ 错误处理和验证
- ✅ 友好的用户界面

## 🚀 快速开始

### 前提条件
1. **Node.js** (v14+)
2. **PostgreSQL** (v12+)
3. **npm** 或 **yarn**

### 安装和启动

#### 方法一：使用启动脚本（推荐）

```bash
# 1. 进入项目目录
cd lost-and-found-system

# 2. 运行启动脚本
./start.sh
```

启动脚本会自动：
- 检查依赖
- 安装必要的包
- 初始化数据库
- 启动前后端服务

#### 方法二：手动启动

**后端：**
```bash
cd backend
npm install
npm start
```

**前端：**
```bash
cd frontend
npm install
npm start
```

### 数据库配置

1. 确保PostgreSQL服务正在运行
2. 创建数据库：
   ```bash
   createdb lost_and_found
   ```
3. 初始化数据库表：
   ```bash
   psql -h localhost -U postgres -d lost_and_found -f backend/config/init.sql
   ```

## 🔧 配置说明

### 后端配置 (`backend/.env`)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lost_and_found
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

PORT=5000
```

### 前端配置 (`frontend/.env`)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_UPLOAD_URL=http://localhost:5000/uploads
```

## 📡 API接口

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 物品相关
- `GET /api/items` - 获取物品列表（支持分页、筛选）
- `GET /api/items/:id` - 获取物品详情
- `POST /api/items` - 创建新物品（支持图片上传）
- `PATCH /api/items/:id/status` - 更新物品状态
- `DELETE /api/items/:id` - 删除物品

### 线索相关
- `GET /api/clues/item/:itemId` - 获取物品的线索列表
- `POST /api/clues` - 创建新线索（支持图片上传）
- `PUT /api/clues/:id` - 更新线索
- `DELETE /api/clues/:id` - 删除线索

## 👤 测试账号

系统已预置测试账号：
- **用户名**: `testuser`
- **密码**: `test123`

## 🖥️ 访问地址

启动后可通过以下地址访问：

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:5000
- **健康检查**: http://localhost:5000/health
- **API文档**: http://localhost:5000/

## 🛠️ 开发说明

### 数据库设计

系统包含4个核心表：

1. **users** - 用户信息
2. **items** - 物品信息
3. **clues** - 线索信息
4. **item_images** - 物品图片

详细表结构见 `backend/config/init.sql`

### 文件上传

- 支持上传图片文件（jpg, png, gif）
- 单个文件大小限制：5MB
- 物品最多可上传5张图片
- 线索最多可上传1张图片
- 文件存储在 `backend/uploads/` 目录

### 安全特性

- 密码使用bcrypt加密存储
- JWT令牌认证
- SQL注入防护
- 文件类型验证
- 跨域资源共享（CORS）

## 📱 响应式设计

系统支持各种设备尺寸：
- 桌面端 (≥1200px)
- 平板端 (768px-1199px)
- 移动端 (<768px)

## 🐛 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查PostgreSQL服务是否运行
   - 验证数据库配置信息
   - 确保数据库用户有访问权限

2. **端口冲突**
   - 后端默认端口：5000
   - 前端默认端口：3000
   - 可在配置文件中修改端口号

3. **文件上传失败**
   - 检查上传目录权限
   - 验证文件类型和大小
   - 确保磁盘空间充足

### 日志查看

**后端日志：**
```bash
cd backend
npm start
```

**前端日志：**
```bash
cd frontend
npm start
```

## 📄 许可证

本项目仅供学习和演示使用。

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 📞 支持

如有问题，请：
1. 查看本文档的故障排除部分
2. 检查控制台错误信息
3. 提交Issue描述问题