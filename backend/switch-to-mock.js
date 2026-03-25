#!/usr/bin/env node

/**
 * 切换到模拟API的脚本
 * 当腾讯地图API密钥达到调用限制时，可以使用模拟数据进行开发测试
 */

const fs = require('fs');
const path = require('path');

const serverFile = path.join(__dirname, 'server.js');
const utilsFile = path.join(__dirname, 'routes/utils.js');

console.log('🔧 切换到模拟API配置...');

// 备份原始文件
const backupServer = serverFile + '.backup';
const backupUtils = utilsFile + '.backup';

if (!fs.existsSync(backupServer)) {
  fs.copyFileSync(serverFile, backupServer);
  console.log('✅ 备份server.js:', backupServer);
}

if (!fs.existsSync(backupUtils)) {
  fs.copyFileSync(utilsFile, backupUtils);
  console.log('✅ 备份utils.js:', backupUtils);
}

// 读取server.js内容
let serverContent = fs.readFileSync(serverFile, 'utf8');

// 修改server.js，将utils路由指向mock
serverContent = serverContent.replace(
  "app.use('/api/utils', utilsRoutes);",
  "// app.use('/api/utils', utilsRoutes); // 注释掉真实API\napp.use('/api/utils', mockLocationRoutes); // 使用模拟API"
);

// 添加注释说明
serverContent = serverContent.replace(
  '// 模拟位置API（开发用）',
  '// 模拟位置API（开发用）- 当前使用模拟数据'
);

fs.writeFileSync(serverFile, serverContent);
console.log('✅ 修改server.js完成：将/utils路由指向模拟API');

// 修改utils.js，添加模拟模式
let utilsContent = fs.readFileSync(utilsFile, 'utf8');

// 在文件开头添加模拟模式开关
if (!utilsContent.includes('// 模拟模式开关')) {
  const mockSwitch = `
// 模拟模式开关
// 设置为true时使用模拟数据，false时使用真实API
const USE_MOCK_DATA = true;

// 模拟数据函数
function getMockLocationData(latitude, longitude) {
  const mockLocations = {
    '30.18535,120.26457': {
      address: "浙江省杭州市西湖区",
      formatted_address: "浙江省杭州市西湖区文三路",
      address_component: {
        province: "浙江省",
        city: "杭州市",
        district: "西湖区",
        street: "文三路",
        street_number: ""
      },
      location: { lat: 30.18535, lng: 120.26457 },
      ad_info: { adcode: "330106", city_code: "0571" },
      pois: [
        {
          title: "西湖",
          address: "杭州市西湖区",
          category: "风景名胜",
          location: { lat: 30.246, lng: 120.138 },
          distance: 12000
        }
      ]
    }
  };
  
  const key = \`\${parseFloat(latitude).toFixed(5)},\${parseFloat(longitude).toFixed(5)}\`;
  return mockLocations[key] || mockLocations['30.18535,120.26457'];
}
`;

  utilsContent = mockSwitch + utilsContent;
  
  // 修改逆地理编码函数，添加模拟分支
  utilsContent = utilsContent.replace(
    '// 获取微信定位信息 - 逆地理编码（坐标转地址）',
    '// 获取微信定位信息 - 逆地理编码（坐标转地址）\n  if (USE_MOCK_DATA) {\n    console.log("使用模拟数据");\n    const mockData = getMockLocationData(latitude, longitude);\n    mockData.location.lat = parseFloat(latitude);\n    mockData.location.lng = parseFloat(longitude);\n    \n    return res.json({\n      success: true,\n      data: mockData,\n      message: "位置信息获取成功（模拟数据）",\n      mock: true\n    });\n  }'
  );
}

fs.writeFileSync(utilsFile, utilsContent);
console.log('✅ 修改utils.js完成：添加模拟模式开关');

console.log('\n🎯 切换完成！');
console.log('📋 当前配置：');
console.log('  1. /api/utils 路由现在指向模拟API');
console.log('  2. utils.js 中添加了模拟模式开关');
console.log('  3. 原始文件已备份：*.backup');

console.log('\n🔧 使用方法：');
console.log('  1. 重启服务器: PORT=5001 node server.js');
console.log('  2. 测试API: curl "http://localhost:5001/api/utils/map/30.18535/120.26457"');
console.log('  3. 应该看到 mock: true 的响应');

console.log('\n💡 切换回真实API：');
console.log('  1. 恢复备份: cp server.js.backup server.js');
console.log('  2. 恢复备份: cp routes/utils.js.backup routes/utils.js');
console.log('  3. 重启服务器');

console.log('\n⚠️  注意：');
console.log('  - 模拟数据仅用于开发和测试');
console.log('  - 生产环境必须使用真实的腾讯地图API密钥');
console.log('  - 申请密钥: https://lbs.qq.com/');