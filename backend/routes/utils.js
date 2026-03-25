const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../config/db');

// 腾讯地图API配置
const TENCENT_MAP_KEY = process.env.TENCENT_MAP_KEY || 'AADBZ-TV5AH-QP2DZ-WXX4E-MPSD3-CWB5L'; // 从环境变量读取，失败时使用测试key
const TENCENT_MAP_BASE_URL = 'https://apis.map.qq.com';

const GAODE_MAP_KEY = process.env.GAODE_MAP_KEY || '6742bfc52d5ecd6ba872e8275282782f'; // 从环境变量读取，失败时使用测试key
const GAODE_MAP_BASE_URL = "https://restapi.amap.com";
// 简单的内存缓存（开发环境使用）
const locationCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24小时缓存

// 缓存工具函数
function getCacheKey(latitude, longitude, type = 'reverse') {
  return `${type}:${parseFloat(latitude).toFixed(6)}:${parseFloat(longitude).toFixed(6)}`;
}

function getFromCache(key) {
  const cached = locationCache.get(key);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    console.log('从缓存获取位置信息:', key);
    return cached.data;
  }
  locationCache.delete(key); // 删除过期缓存
  return null;
}

function setToCache(key, data) {
  locationCache.set(key, {
    data,
    timestamp: Date.now()
  });
  // 限制缓存大小
  if (locationCache.size > 1000) {
    const firstKey = locationCache.keys().next().value;
    locationCache.delete(firstKey);
  }
}

// 获取微信定位信息 - 逆地理编码（坐标转地址）
router.get('/map/:latitude/:longitude', async (req, res) => {
//   return res.json(
//     {
//     "success": true,
//     "data": {
//         "address": "浙江省杭州市西湖区",
//         "formatted_address": "浙江省杭州市西湖区文三路",
//         "address_component": {
//             "province": "浙江省",
//             "city": "杭州市",
//             "district": "西湖区",
//             "street": "文三路",
//             "street_number": ""
//         },
//         "location": {
//             "lat": 30.18534,
//             "lng": 121.26411
//         },
//         "ad_info": {
//             "adcode": "330106",
//             "city_code": "0571"
//         },
//         "pois": [
//             {
//                 "title": "西湖",
//                 "address": "杭州市西湖区",
//                 "category": "风景名胜",
//                 "location": {
//                     "lat": 30.246,
//                     "lng": 120.138
//                 },
//                 "distance": 1315
//             },
//             {
//                 "title": "浙江大学玉泉校区",
//                 "address": "杭州市西湖区浙大路38号",
//                 "category": "教育",
//                 "location": {
//                     "lat": 30.265,
//                     "lng": 120.123
//                 },
//                 "distance": 2502
//             }
//         ]
//     },
//     "message": "位置信息获取成功（模拟数据）",
//     "mock": true,
//     "original_coordinates": "30.18534,121.26411",
//     "used_coordinates": "30.18535,120.26457"
// }
//   )
  try {
    const { latitude, longitude } = req.params;
    
    // 验证坐标参数
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: '参数错误',
        message: '请提供有效的经纬度坐标' 
      });
    }

    // 检查缓存
    const cacheKey = getCacheKey(latitude, longitude, 'reverse');
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      return res.json({
        success: true,
        data: cachedData,
        message: '位置信息获取成功（来自缓存）',
        cached: true
      });
    }

    // 构建腾讯地图API请求URL
    const apiUrl = `${GAODE_MAP_BASE_URL}/v3/geocode/regeo?location=${longitude},${latitude}&key=${GAODE_MAP_KEY}`;

    // 调用腾讯地图API
    const response = await axios.get(apiUrl);
    const result = response.data;
    console.dir(response)
    // 检查API返回状态
    if (result.status === 0) {
      console.error('腾讯地图API错误:', result.message);
      return res.status(500).json({ 
        error: '地图服务错误',
        message: result.message || '获取位置信息失败',
        details: result
      });
    }

    // 提取有用的位置信息
    const locationInfo = {
      address: result.regeocode.formatted_address,
      formatted_address: result.regeocode.formatted_addresses,
      address_component: {
        province: result.regeocode.addressComponent?.province,
        city: result.regeocode.address_component?.city,
        district: result.regeocode.address_component?.district,
        //street: result.regeocode.address_component?.street,
        //street_number: result.regeocode.address_component?.street_number
      },
      location: {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude)
      },
      ad_info: result.regeocode.ad_info || [],
      pois: result.regeocode.pois || [] // 周边兴趣点
    };

    console.log('位置信息获取成功:', locationInfo.formatted_address);

    // 存入缓存
    setToCache(cacheKey, locationInfo);

    res.json({
      success: true,
      data: locationInfo,
      message: '位置信息获取成功',
      cached: false
    });

  } catch (error) {
    console.error('获取定位错误:', error.message);
    
    if (error.response) {
      // 腾讯地图API返回的错误
      console.error('API响应错误:', error.response.data);
      res.status(error.response.status).json({ 
        error: '地图服务错误',
        message: error.response.data?.message || '地图服务请求失败',
        details: error.response.data
      });
    } else if (error.request) {
      // 请求发送了但没有收到响应
      console.error('网络请求错误:', error.request);
      res.status(503).json({ 
        error: '网络错误',
        message: '无法连接到地图服务，请检查网络连接'
      });
    } else {
      // 其他错误
      res.status(500).json({ 
        error: '服务器错误',
        message: '处理位置信息时发生错误',
        details: error.message
      });
    }
  }
});

// 地理编码（地址转坐标）
router.get('/geocode', async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({ 
        error: '参数错误',
        message: '请提供地址信息' 
      });
    }

    const apiUrl = `${TENCENT_MAP_BASE_URL}/ws/geocoder/v1/`;
    const params = {
      address: address,
      key: TENCENT_MAP_KEY
    };

    console.log('地理编码请求:', address);

    const response = await axios.get(apiUrl, { params });
    const result = response.data;

    if (result.status !== 0) {
      console.error('地理编码错误:', result.message);
      return res.status(500).json({ 
        error: '地理编码错误',
        message: result.message || '地址解析失败'
      });
    }

    const location = result.result.location;
    
    res.json({
      success: true,
      data: {
        address: result.result.title || address,
        location: {
          lat: location.lat,
          lng: location.lng
        },
        address_component: result.result.address_components
      },
      message: '地址解析成功'
    });

  } catch (error) {
    console.error('地理编码错误:', error.message);
    res.status(500).json({ 
      error: '服务器错误',
      message: '地址解析失败',
      details: error.message
    });
  }
});

// 获取周边POI（兴趣点）信息
router.get('/poi/nearby', async (req, res) => {
  try {
    const { latitude, longitude, keyword, radius = 1000, page_size = 10, page_index = 1 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: '参数错误',
        message: '请提供经纬度坐标' 
      });
    }

    const apiUrl = `${TENCENT_MAP_BASE_URL}/ws/place/v1/search`;
    const params = {
      boundary: `nearby(${latitude},${longitude},${radius})`,
      key: TENCENT_MAP_KEY,
      page_size,
      page_index,
      orderby: '_distance' // 按距离排序
    };

    if (keyword) {
      params.keyword = keyword;
    }

    console.log('搜索周边POI:', params);

    const response = await axios.get(apiUrl, { params });
    const result = response.data;

    if (result.status !== 0) {
      console.error('POI搜索错误:', result.message);
      return res.status(500).json({ 
        error: 'POI搜索错误',
        message: result.message || '搜索周边信息失败'
      });
    }

    res.json({
      success: true,
      data: {
        count: result.count,
        pois: result.data || []
      },
      message: '周边信息获取成功'
    });

  } catch (error) {
    console.error('POI搜索错误:', error.message);
    res.status(500).json({ 
      error: '服务器错误',
      message: '搜索周边信息失败',
      details: error.message
    });
  }
});

// 获取行政区划信息
router.get('/district', async (req, res) => {
  try {
    const { id = 440000 } = req.query; // 默认广东省

    const apiUrl = `${TENCENT_MAP_BASE_URL}/ws/district/v1/getchildren`;
    const params = {
      id,
      key: TENCENT_MAP_KEY
    };

    console.log('获取行政区划:', id);

    const response = await axios.get(apiUrl, { params });
    const result = response.data;

    if (result.status !== 0) {
      console.error('行政区划错误:', result.message);
      return res.status(500).json({ 
        error: '行政区划错误',
        message: result.message || '获取行政区划失败'
      });
    }

    res.json({
      success: true,
      data: result.result[0] || [],
      message: '行政区划获取成功'
    });

  } catch (error) {
    console.error('行政区划错误:', error.message);
    res.status(500).json({ 
      error: '服务器错误',
      message: '获取行政区划失败',
      details: error.message
    });
  }
});

module.exports = router;