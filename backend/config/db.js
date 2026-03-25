const { Pool } = require('pg');
require('dotenv').config();

let pool;

try {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'lost_found',
    user: process.env.DB_USER || 'lockey',
    password: process.env.DB_PASSWORD || 'lockey23',
  });
console.log(pool)
  // 测试数据库连接
  pool.connect((err, client, release) => {
    if (err) {
      console.warn('⚠️  数据库连接失败:', err.message);
      console.log('系统将以模拟模式运行，部分功能受限');
    } else {
      console.log('✅ 数据库连接成功');
      release();
    }
  });
} catch (error) {
  console.warn('⚠️  数据库配置错误:', error.message);
  console.log('系统将以模拟模式运行，部分功能受限');
  
  // 创建模拟的pool对象
  pool = {
    query: async () => {
      console.warn('数据库未连接，返回模拟数据');
      return { rows: [], rowCount: 0 };
    }
  };
}

module.exports = pool;
