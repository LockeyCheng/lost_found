const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 导入路由
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const clueRoutes = require('./routes/clues');
const utilsRoutes = require('./routes/utils');
const mockLocationRoutes = require('./routes/mock-location');
const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 创建上传目录
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 静态文件服务
app.use('/uploads', express.static(uploadDir));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/clues', clueRoutes);
app.use('/api/utils', utilsRoutes);
app.use('/api/mock/location', mockLocationRoutes); // 模拟位置API（开发用）
// 根路由
app.get('/', (req, res) => {
  res.json({ 
    message: '失物招领系统后端API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      items: {
        list: 'GET /api/items',
        detail: 'GET /api/items/:id',
        create: 'POST /api/items',
        updateStatus: 'PATCH /api/items/:id/status',
        delete: 'DELETE /api/items/:id'
      },
      clues: {
        byItem: 'GET /api/clues/item/:itemId',
        create: 'POST /api/clues',
        update: 'PUT /api/clues/:id',
        delete: 'DELETE /api/clues/:id'
      },
      utils: {
        reverseGeocode: 'GET /api/utils/map/:latitude/:longitude',
        geocode: 'GET /api/utils/geocode?address=地址',
        nearbyPoi: 'GET /api/utils/poi/nearby?latitude=纬度&longitude=经度&keyword=关键词(可选)',
        district: 'GET /api/utils/district?id=行政区划ID(可选)'
      },
      mock: {
        location: 'GET /api/mock/location/* (开发测试用)'
      }
    }
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'lost-and-found-api'
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ error: '路由未找到' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: '文件上传错误: ' + err.message });
  }
  
  res.status(500).json({ 
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 失物招领系统后端启动成功');
  console.log('='.repeat(50));
  console.log(`📡 API地址: http://localhost:${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/health`);
  console.log(`📁 上传目录: ${uploadDir}`);
  console.log(`📚 API文档: http://localhost:${PORT}/`);
  console.log('='.repeat(50));
});