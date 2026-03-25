# 微信定位API快速使用指南

## 1. 启动服务器

```bash
cd /Users/lockey/mygit/lost_found/backend
npm install  # 如果还没有安装依赖
PORT=5001 node server.js  # 使用5001端口避免冲突
```

## 2. 测试API是否正常工作

### 方法1: 使用测试脚本
```bash
node test_location_api.js
```

### 方法2: 手动测试
```bash
# 健康检查
curl http://localhost:5001/health

# 查看API文档
curl http://localhost:5001/

# 测试逆地理编码（使用测试坐标）
curl "http://localhost:5001/api/utils/map/23.129163/113.264435"

# 测试地理编码
curl "http://localhost:5001/api/utils/geocode?address=广州市天河区体育西路"

# 测试周边POI搜索
curl "http://localhost:5001/api/utils/poi/nearby?latitude=23.129163&longitude=113.264435&keyword=餐厅"
```

## 3. 申请自己的腾讯地图API密钥

由于测试密钥有调用限制，生产环境需要申请自己的密钥：

1. **访问官网**: https://lbs.qq.com/
2. **注册登录**: 使用微信或QQ登录
3. **创建应用**: 进入控制台 → 创建应用
4. **获取密钥**: 在应用设置中找到WebService API的密钥
5. **更新配置**: 将密钥添加到 `.env` 文件：
   ```
   TENCENT_MAP_KEY=你的新密钥
   ```

## 4. 前端集成示例

### React组件示例
```jsx
import React, { useState } from 'react';
import axios from 'axios';

function LocationSearch() {
  const [address, setAddress] = useState('');
  const [locationInfo, setLocationInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/utils/geocode', {
        params: { address }
      });
      if (response.data.success) {
        setLocationInfo(response.data.data);
      }
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="输入地址..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? '搜索中...' : '搜索'}
      </button>
      
      {locationInfo && (
        <div>
          <p>地址: {locationInfo.address}</p>
          <p>坐标: 纬度 {locationInfo.location.lat}, 经度 {locationInfo.location.lng}</p>
        </div>
      )}
    </div>
  );
}
```

### 微信小程序示例
```javascript
// 获取用户位置并转换为地址
Page({
  data: {
    location: null,
    address: ''
  },

  onLoad() {
    this.getUserLocation();
  },

  getUserLocation() {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        const { latitude, longitude } = res;
        this.getAddressFromCoordinates(latitude, longitude);
      }
    });
  },

  getAddressFromCoordinates(lat, lng) {
    wx.request({
      url: 'https://your-domain.com/api/utils/map/' + lat + '/' + lng,
      success: (res) => {
        if (res.data.success) {
          this.setData({
            location: res.data.data.location,
            address: res.data.data.formatted_address
          });
        }
      }
    });
  }
});
```

## 5. 常见问题解决

### Q1: 出现 "key每日调用量已达到上限" 错误
**原因**: 测试密钥已达到腾讯地图API的每日调用限制
**解决**: 
1. 申请自己的腾讯地图API密钥
2. 更新 `.env` 文件中的 `TENCENT_MAP_KEY`
3. 重启服务器

### Q2: 服务器启动失败，端口被占用
**解决**: 
```bash
# 使用其他端口
PORT=5002 node server.js

# 或者查找并杀死占用进程
lsof -ti:5000 | xargs kill -9  # macOS/Linux
```

### Q3: 数据库连接失败
**解决**:
1. 确保PostgreSQL服务正在运行
2. 检查 `.env` 文件中的数据库配置
3. 确认数据库 `lost_found` 已创建

### Q4: API返回404错误
**解决**:
1. 确认服务器正在运行
2. 检查URL是否正确
3. 查看 `server.js` 中的路由配置

## 6. 生产环境部署建议

### 安全性
1. **使用环境变量**存储敏感信息（API密钥、数据库密码等）
2. **启用HTTPS**保护数据传输
3. **实施API限流**防止滥用
4. **添加CORS配置**限制允许的域名

### 性能优化
1. **添加缓存层**减少API调用
2. **使用连接池**优化数据库连接
3. **启用压缩**减少传输数据量
4. **实施日志轮转**管理日志文件

### 监控和维护
1. **添加健康检查端点**
2. **设置错误监控**（如Sentry）
3. **定期备份数据库**
4. **监控API调用量**

## 7. 扩展功能建议

### 已实现功能
- ✅ 逆地理编码（坐标 → 地址）
- ✅ 地理编码（地址 → 坐标）
- ✅ 周边POI搜索
- ✅ 行政区划查询

### 可扩展功能
- 🔄 路径规划（导航）
- 🔄 距离计算
- 🔄 地点搜索建议
- 🔄 批量地理编码
- 🔄 地图静态图生成

## 8. 联系和支持

### 文档
- 详细API文档: `WECHAT_LOCATION_API.md`
- 测试脚本: `test_location_api.js`
- 快速指南: 本文档

### 调试技巧
1. 查看服务器控制台日志
2. 使用Postman或curl测试API
3. 检查腾讯地图API控制台的使用统计
4. 验证环境变量是否正确加载

### 注意事项
1. 腾讯地图API有QPS限制，请合理设计调用频率
2. 用户位置信息属于敏感数据，需遵守隐私政策
3. 生产环境务必使用自己的API密钥
4. 定期更新依赖包确保安全性