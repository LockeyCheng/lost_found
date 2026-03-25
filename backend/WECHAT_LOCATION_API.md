# 微信定位API集成文档

## 概述

本模块集成了腾讯地图API，为失物招领系统提供地理位置相关功能。通过调用腾讯地图服务，实现坐标转地址、地址转坐标、周边POI搜索等功能。

## API端点

### 1. 逆地理编码（坐标转地址）
**端点**: `GET /api/utils/map/:latitude/:longitude`

**描述**: 将经纬度坐标转换为详细地址信息

**参数**:
- `latitude` (路径参数): 纬度，如 `23.129163`
- `longitude` (路径参数): 经度，如 `113.264435`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "address": "广东省广州市天河区",
    "formatted_address": "广东省广州市天河区体育西路",
    "address_component": {
      "province": "广东省",
      "city": "广州市",
      "district": "天河区",
      "street": "体育西路",
      "street_number": ""
    },
    "location": {
      "lat": 23.129163,
      "lng": 113.264435
    },
    "ad_info": {
      "adcode": "440106",
      "city_code": "020"
    },
    "pois": [
      {
        "title": "天河城",
        "address": "天河路208号",
        "category": "购物中心",
        "location": {
          "lat": 23.129,
          "lng": 113.264
        }
      }
    ]
  },
  "message": "位置信息获取成功"
}
```

### 2. 地理编码（地址转坐标）
**端点**: `GET /api/utils/geocode`

**描述**: 将地址转换为经纬度坐标

**查询参数**:
- `address` (必需): 地址字符串，如 `"广州市天河区体育西路"`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "address": "广州市天河区体育西路",
    "location": {
      "lat": 23.129163,
      "lng": 113.264435
    },
    "address_component": {
      "province": "广东省",
      "city": "广州市",
      "district": "天河区"
    }
  },
  "message": "地址解析成功"
}
```

### 3. 周边POI搜索
**端点**: `GET /api/utils/poi/nearby`

**描述**: 搜索指定坐标周边的兴趣点

**查询参数**:
- `latitude` (必需): 纬度
- `longitude` (必需): 经度
- `keyword` (可选): 搜索关键词，如 `"餐厅"`、`"医院"`
- `radius` (可选): 搜索半径，单位米，默认 `1000`
- `page_size` (可选): 每页数量，默认 `10`
- `page_index` (可选): 页码，默认 `1`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "count": 25,
    "pois": [
      {
        "id": "123456",
        "title": "星巴克",
        "address": "体育西路101号",
        "category": "咖啡厅",
        "location": {
          "lat": 23.1292,
          "lng": 113.2645
        },
        "distance": 150
      }
    ]
  },
  "message": "周边信息获取成功"
}
```

### 4. 行政区划查询
**端点**: `GET /api/utils/district`

**描述**: 获取行政区划信息

**查询参数**:
- `id` (可选): 行政区划ID，默认 `440000`（广东省）

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "440100",
      "name": "广州市",
      "fullname": "广东省广州市"
    },
    {
      "id": "440300",
      "name": "深圳市",
      "fullname": "广东省深圳市"
    }
  ],
  "message": "行政区划获取成功"
}
```

## 腾讯地图API配置

### API密钥
当前使用的测试密钥: `AADBZ-TV5AH-QP2DZ-WXX4E-MPSD3-CWB5L`

**重要**: 此密钥仅用于测试，生产环境需要申请自己的腾讯地图API密钥。

### 申请自己的API密钥
1. 访问 [腾讯位置服务官网](https://lbs.qq.com/)
2. 注册并登录账号
3. 进入控制台创建应用
4. 获取WebService API的密钥

### 配置方法
1. 在 `.env` 文件中添加:
   ```
   TENCENT_MAP_KEY=你的API密钥
   ```
2. 修改 `routes/utils.js` 中的 `TENCENT_MAP_KEY` 常量:
   ```javascript
   const TENCENT_MAP_KEY = process.env.TENCENT_MAP_KEY || 'AADBZ-TV5AH-QP2DZ-WXX4E-MPSD3-CWB5L';
   ```

## 错误处理

所有API都包含完善的错误处理机制：

### 常见错误响应
```json
{
  "error": "错误类型",
  "message": "错误描述",
  "details": "详细错误信息（开发环境）"
}
```

### 错误状态码
- `400`: 参数错误
- `500`: 服务器内部错误
- `503`: 地图服务不可用

## 使用示例

### 前端调用示例（JavaScript）
```javascript
// 获取当前位置信息
async function getLocationInfo(latitude, longitude) {
  try {
    const response = await fetch(`/api/utils/map/${latitude}/${longitude}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('地址:', data.data.formatted_address);
      console.log('行政区划:', data.data.address_component);
      return data.data;
    } else {
      console.error('获取位置失败:', data.message);
    }
  } catch (error) {
    console.error('网络错误:', error);
  }
}

// 搜索周边餐厅
async function searchNearbyRestaurants(latitude, longitude) {
  try {
    const response = await fetch(
      `/api/utils/poi/nearby?latitude=${latitude}&longitude=${longitude}&keyword=餐厅`
    );
    const data = await response.json();
    
    if (data.success) {
      return data.data.pois;
    }
  } catch (error) {
    console.error('搜索失败:', error);
  }
}
```

### 微信小程序调用示例
```javascript
// 获取用户当前位置
wx.getLocation({
  type: 'wgs84',
  success: (res) => {
    const { latitude, longitude } = res;
    
    // 调用后端API获取地址信息
    wx.request({
      url: 'https://your-domain.com/api/utils/map/' + latitude + '/' + longitude,
      success: (res) => {
        if (res.data.success) {
          const location = res.data.data;
          console.log('当前位置:', location.formatted_address);
        }
      }
    });
  }
});
```

## 集成到失物招领系统

### 1. 登记失物时自动获取位置
当用户登记失物时，可以使用微信定位获取坐标，然后调用逆地理编码API获取详细地址。

### 2. 搜索功能集成
- 用户可以根据地址搜索附近的失物
- 系统可以根据坐标计算距离并排序

### 3. 地图展示
- 在地图上显示失物的位置
- 显示周边相关地点（如派出所、失物招领处）

## 注意事项

1. **API调用限制**: 腾讯地图API有每日调用次数限制，请合理使用
2. **密钥安全**: 不要在前端代码中暴露API密钥
3. **错误处理**: 做好网络异常和API限制的处理
4. **用户体验**: 添加加载状态和错误提示
5. **隐私保护**: 妥善处理用户位置信息，遵守相关法律法规

## 调试和测试

### 测试坐标
- 广州天河城: `23.129163, 113.264435`
- 北京天安门: `39.908823, 116.397470`
- 上海外滩: `31.239879, 121.499718`

### 日志查看
所有API调用都会在控制台输出日志，便于调试：
```
调用腾讯地图API: https://apis.map.qq.com/ws/geocoder/v1/ { location: '23.129163,113.264435', key: '...' }
位置信息获取成功: 广东省广州市天河区体育西路
```

## 性能优化建议

1. **缓存机制**: 对常见位置信息进行缓存，减少API调用
2. **批量处理**: 多个位置查询可以合并处理
3. **延迟加载**: 非关键位置信息可以延迟加载
4. **错误重试**: 对临时性错误实现自动重试机制