#!/bin/bash

echo "🚀 启动失物招领系统..."

# 检查是否安装了必要的工具
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ 未找到 $1，请先安装 $1"
        exit 1
    fi
}

echo "🔍 检查依赖..."
check_command node
check_command npm
check_command psql

# 创建必要的目录
echo "📁 创建目录..."
mkdir -p backend/uploads

# 启动后端
echo "🔄 启动后端服务..."
cd backend

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装后端依赖..."
    npm install
fi

# 检查数据库连接
echo "🗄️  检查数据库连接..."
if ! psql -h localhost -U postgres -c "SELECT 1" &> /dev/null; then
    echo "⚠️  无法连接到PostgreSQL数据库"
    echo "请确保:"
    echo "1. PostgreSQL已安装并运行"
    echo "2. 数据库用户'postgres'存在"
    echo "3. 数据库'lost_and_found'存在"
    echo ""
    echo "可以运行以下命令创建数据库:"
    echo "  createdb lost_and_found"
    echo "  psql -h localhost -U postgres -d lost_and_found -f config/init.sql"
    exit 1
fi

# 初始化数据库
echo "🗃️  初始化数据库..."
psql -h localhost -U postgres -d lost_and_found -f config/init.sql

# 启动后端服务器（后台运行）
echo "🌐 启动后端服务器..."
npm start &
BACKEND_PID=$!
sleep 3

# 检查后端是否启动成功
if ! curl -s http://localhost:5000/health > /dev/null; then
    echo "❌ 后端启动失败"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ 后端启动成功 (PID: $BACKEND_PID)"

# 启动前端
echo "🔄 启动前端服务..."
cd ../frontend

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装前端依赖..."
    npm install
fi

# 启动前端服务器（后台运行）
echo "🌐 启动前端服务器..."
npm start &
FRONTEND_PID=$!
sleep 5

# 检查前端是否启动成功
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ 前端启动失败"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo "✅ 前端启动成功 (PID: $FRONTEND_PID)"

echo ""
echo "="*50
echo "🎉 失物招领系统启动成功！"
echo "="*50
echo ""
echo "🌐 前端地址: http://localhost:3000"
echo "🔧 后端API: http://localhost:5000"
echo "📊 健康检查: http://localhost:5000/health"
echo "📚 API文档: http://localhost:5000/"
echo ""
echo "📝 测试账号:"
echo "   用户名: testuser"
echo "   密码: test123"
echo ""
echo "🛑 停止系统: 按 Ctrl+C"
echo "="*50

# 等待用户中断
trap "echo '🛑 停止系统...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT
wait