#!/bin/bash

echo "🚀 启动失物招领系统（简化版）..."

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

# 启动后端服务器（后台运行）
echo "🌐 启动后端服务器..."
node server.js &
BACKEND_PID=$!
sleep 3

# 检查后端是否启动成功
if curl -s http://localhost:5000/health > /dev/null; then
    echo "✅ 后端启动成功 (PID: $BACKEND_PID)"
else
    echo "⚠️  后端可能启动失败，但继续启动前端..."
fi

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

echo ""
echo "="*50
echo "🎉 失物招领系统启动中..."
echo "="*50
echo ""
echo "🌐 前端地址: http://localhost:3000"
echo "🔧 后端API: http://localhost:5000"
echo "📊 健康检查: http://localhost:5000/health"
echo ""
echo "⚠️  注意：由于缺少数据库连接，部分功能可能受限"
echo "     如需完整功能，请确保PostgreSQL已安装并运行"
echo ""
echo "🛑 停止系统: 按 Ctrl+C"
echo "="*50

# 等待用户中断
trap "echo '🛑 停止系统...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT
wait