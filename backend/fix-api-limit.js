#!/usr/bin/env node

/**
 * 快速修复API调用限制问题
 * 针对 "此key每日调用量已达到上限" 错误
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 修复腾讯地图API调用限制问题\n');

// 检查当前问题
console.log('1. 检查当前API状态...');
try {
  const testUrl = 'https://apis.map.qq.com/ws/geocoder/v1/?location=30.18535,120.26457&key=AADBZ-TV5AH-QP2DZ-WXX4E-MPSD3-CWB5L';
  const result = execSync(`curl -s "${testUrl}"`, { encoding: 'utf8' });
  const data = JSON.parse(result);
  
  if (data.status === 121) {
    console.log('❌ 确认问题：API密钥已达到每日调用上限');
    console.log('   错误信息:', data.message);
  }
} catch (error) {
  console.log('⚠️  无法测试API状态，继续修复流程...');
}

// 提供解决方案
console.log('\n2. 提供解决方案：\n');

console.log('方案A：立即使用模拟数据（推荐用于开发）');
console.log('   运行: node switch-to-mock.js');
console.log('   然后重启服务器');
console.log('   优点：立即可用，无需等待');
console.log('   缺点：返回模拟数据，非真实位置\n');

console.log('方案B：申请自己的API密钥（生产环境必须）');
console.log('   步骤：');
console.log('   1. 访问 https://lbs.qq.com/');
console.log('   2. 注册/登录账号');
console.log('   3. 创建应用（选择WebService API）');
console.log('   4. 获取密钥');
console.log('   5. 更新 .env 文件：');
console.log('      TENCENT_MAP_KEY=你的新密钥');
console.log('   6. 重启服务器');
console.log('   优点：使用真实数据，无限制问题');
console.log('   缺点：需要注册和等待审核\n');

console.log('方案C：使用其他地图服务（替代方案）');
console.log('   可选服务：');
console.log('   - 高德地图: https://lbs.amap.com/');
console.log('   - 百度地图: https://lbsyun.baidu.com/');
console.log('   需要修改代码适配不同的API\n');

console.log('方案D：等待到明天（临时方案）');
console.log('   腾讯地图API每日限额会在北京时间0点重置');
console.log('   可以等到明天再测试');
console.log('   优点：无需任何操作');
console.log('   缺点：需要等待，无法立即开发\n');

// 检查当前配置
console.log('\n3. 检查当前配置：\n');

const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  if (envContent.includes('TENCENT_MAP_KEY')) {
    console.log('✅ 找到 .env 文件中的 TENCENT_MAP_KEY 配置');
    const match = envContent.match(/TENCENT_MAP_KEY=(.+)/);
    if (match) {
      const key = match[1];
      const maskedKey = key.length > 10 
        ? key.substring(0, 6) + '...' + key.substring(key.length - 4)
        : key;
      console.log(`   当前密钥: ${maskedKey}`);
      
      if (key === 'AADBZ-TV5AH-QP2DZ-WXX4E-MPSD3-CWB5L') {
        console.log('⚠️  正在使用公共测试密钥，请申请自己的密钥');
      }
    }
  } else {
    console.log('❌ 未找到 TENCENT_MAP_KEY 配置');
    console.log('   请在 .env 文件中添加：');
    console.log('   TENCENT_MAP_KEY=你的密钥');
  }
} else {
  console.log('❌ 未找到 .env 文件');
  console.log('   请创建 .env 文件并添加配置');
}

// 检查服务器状态
console.log('\n4. 检查服务器状态：\n');
try {
  const portCheck = execSync('lsof -ti:5001 2>/dev/null || echo "未运行"', { encoding: 'utf8' }).trim();
  if (portCheck !== '未运行') {
    console.log('✅ 服务器正在运行（端口5001）');
    console.log('   进程ID:', portCheck);
    
    // 测试本地API
    try {
      const localTest = execSync('curl -s http://localhost:5001/health', { encoding: 'utf8', timeout: 3000 });
      console.log('✅ 本地API健康检查正常');
    } catch {
      console.log('⚠️  无法连接到本地API');
    }
  } else {
    console.log('❌ 服务器未运行');
    console.log('   启动命令: PORT=5001 node server.js');
  }
} catch (error) {
  console.log('⚠️  无法检查服务器状态');
}

// 提供快速操作
console.log('\n5. 快速操作命令：\n');
console.log('   启动服务器:');
console.log('     PORT=5001 node server.js');
console.log('');
console.log('   切换到模拟API:');
console.log('     node switch-to-mock.js');
console.log('     PORT=5001 node server.js');
console.log('');
console.log('   测试API（使用模拟数据）:');
console.log('     curl "http://localhost:5001/api/mock/location/map/30.18535/120.26457"');
console.log('');
console.log('   恢复真实API:');
console.log('     cp server.js.backup server.js');
console.log('     cp routes/utils.js.backup routes/utils.js');

console.log('\n6. 建议操作流程：\n');
console.log('   对于开发测试：');
console.log('     1. node switch-to-mock.js');
console.log('     2. PORT=5001 node server.js');
console.log('     3. 开始开发，使用模拟数据');
console.log('');
console.log('   对于生产环境：');
console.log('     1. 申请腾讯地图API密钥');
console.log('     2. 更新 .env 文件');
console.log('     3. 确保使用真实API（恢复备份）');
console.log('     4. 部署到生产环境');

console.log('\n📞 需要帮助？');
console.log('   - 查看文档: cat WECHAT_LOCATION_API.md | head -50');
console.log('   - 测试脚本: node test_location_api.js');
console.log('   - 快速指南: cat QUICK_START.md | head -30');

console.log('\n✅ 修复指南完成！');