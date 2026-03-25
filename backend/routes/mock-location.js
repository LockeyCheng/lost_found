const express = require('express');
const router = express.Router();

// 模拟位置数据（杭州坐标）
const MOCK_LOCATIONS = {
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
    location: {
      lat: 30.18535,
      lng: 120.26457
    },
    ad_info: {
      adcode: "330106",
      city_code: "0571"
    },
    pois: [
      {
        title: "西湖",
        address: "杭州市西湖区",
        category: "风景名胜",
        location: {
          lat: 30.246,
          lng: 120.138
        },
        distance: 12000
      },
      {
        title: "浙江大学玉泉校区",
        address: "杭州市西湖区浙大路38号",
        category: "教育",
        location: {
          lat: 30.265,
          lng: 120.123
        },
        distance: 8000
      }
    ]
  },
  '23.129163,113.264435': {
    address: "广东省广州市天河区",
    formatted_address: "广东省广州市天河区体育西路",
    address_component: {
      province: "广东省",
      city: "广州市",
      district: "天河区",
      street: "体育西路",
      street_number: ""
    },
    location: {
      lat: 23.129163,
      lng: 113.264435
    },
    ad_info: {
      adcode: "440106",
      city_code: "020"
    },
    pois: [
      {
        title: "天河城",
        address: "天河路208号",
        category: "购物中心",
        location: {
          lat: 23.129,
          lng: 113.264
        },
        distance: 150
      }
    ]
  },
  '39.908823,116.397470': {
    address: "北京市东城区",
    formatted_address: "北京市东城区天安门广场",
    address_component: {
      province: "北京市",
      city: "北京市",
      district: "东城区",
      street: "天安门广场",
      street_number: ""
    },
    location: {
      lat: 39.908823,
      lng: 116.397470
    },
    ad_info: {
      adcode: "110101",
      city_code: "010"
    },
    pois: [
      {
        title: "天安门",
        address: "北京市东城区",
        category: "风景名胜",
        location: {
          lat: 39.908,
          lng: 116.397
        },
        distance: 100
      }
    ]
  }
};

// 模拟逆地理编码
router.get('/map/:latitude/:longitude', (req, res) => {
  const { latitude, longitude } = req.params;
  const key = `${parseFloat(latitude).toFixed(5)},${parseFloat(longitude).toFixed(5)}`;
  
  console.log('模拟位置查询:', key);
  
  // 查找最接近的坐标
  let locationKey = key;
  if (!MOCK_LOCATIONS[key]) {
    // 如果没有精确匹配，找一个最接近的
    const availableKeys = Object.keys(MOCK_LOCATIONS);
    locationKey = availableKeys[0]; // 默认使用第一个
    
    // 简单距离计算（实际应该用更精确的算法）
    const inputLat = parseFloat(latitude);
    const inputLng = parseFloat(longitude);
    
    let minDistance = Infinity;
    for (const coord of availableKeys) {
      const [lat, lng] = coord.split(',').map(Number);
      const distance = Math.sqrt(Math.pow(lat - inputLat, 2) + Math.pow(lng - inputLng, 2));
      if (distance < minDistance) {
        minDistance = distance;
        locationKey = coord;
      }
    }
    
    console.log('使用最接近的坐标:', locationKey, '距离差:', minDistance);
  }
  
  const mockData = MOCK_LOCATIONS[locationKey];
  
  // 添加一些随机性，使每次返回略有不同
  const responseData = JSON.parse(JSON.stringify(mockData));
  responseData.location.lat = parseFloat(latitude);
  responseData.location.lng = parseFloat(longitude);
  
  // 随机调整一些POI距离
  if (responseData.pois) {
    responseData.pois.forEach(poi => {
      poi.distance = Math.floor(Math.random() * 5000) + 100;
    });
  }
  
  // 模拟网络延迟
  setTimeout(() => {
    res.json({
      success: true,
      data: responseData,
      message: '位置信息获取成功（模拟数据）',
      mock: true,
      original_coordinates: key,
      used_coordinates: locationKey
    });
  }, 300); // 300ms延迟模拟网络请求
});

// 模拟地理编码
router.get('/geocode', (req, res) => {
  const { address } = req.query;
  
  console.log('模拟地理编码:', address);
  
  // 简单地址匹配
  let location = { lat: 30.18535, lng: 120.26457 }; // 默认杭州
  
  if (address.includes('广州') || address.includes('天河')) {
    location = { lat: 23.129163, lng: 113.264435 };
  } else if (address.includes('北京') || address.includes('天安门')) {
    location = { lat: 39.908823, lng: 116.397470 };
  } else if (address.includes('上海') || address.includes('外滩')) {
    location = { lat: 31.239879, lng: 121.499718 };
  }
  
  setTimeout(() => {
    res.json({
      success: true,
      data: {
        address: address || '未知地址',
        location,
        address_component: {
          province: address?.includes('省') ? address.split('省')[0] + '省' : '未知省份',
          city: address?.includes('市') ? address.split('市')[0].split('省').pop() + '市' : '未知城市',
          district: '未知区县'
        }
      },
      message: '地址解析成功（模拟数据）',
      mock: true
    });
  }, 300);
});

// 模拟周边POI搜索
router.get('/poi/nearby', (req, res) => {
  const { latitude, longitude, keyword } = req.query;
  
  console.log('模拟周边POI搜索:', { latitude, longitude, keyword });
  
  // 生成模拟POI数据
  const mockPois = [];
  const categories = ['餐厅', '咖啡厅', '超市', '医院', '银行', '学校', '公园', '商场'];
  const baseLat = parseFloat(latitude) || 30.18535;
  const baseLng = parseFloat(longitude) || 120.26457;
  
  for (let i = 1; i <= 10; i++) {
    const category = keyword 
      ? `${keyword}:${categories[i % categories.length]}`
      : `生活服务:${categories[i % categories.length]}`;
    
    mockPois.push({
      id: `mock_poi_${i}`,
      title: `${keyword || '地点'}${i}`,
      address: `模拟地址${i}号`,
      category,
      location: {
        lat: baseLat + (Math.random() - 0.5) * 0.01,
        lng: baseLng + (Math.random() - 0.5) * 0.01
      },
      distance: Math.floor(Math.random() * 2000) + 100
    });
  }
  
  setTimeout(() => {
    res.json({
      success: true,
      data: {
        count: mockPois.length * 10, // 模拟更多结果
        pois: mockPois
      },
      message: '周边信息获取成功（模拟数据）',
      mock: true
    });
  }, 400);
});

// 模拟行政区划查询
router.get('/district', (req, res) => {
  const { id } = req.query;
  
  console.log('模拟行政区划查询:', id);
  
  const districts = [
    { id: '330100', name: '杭州市', fullname: '浙江省杭州市' },
    { id: '330200', name: '宁波市', fullname: '浙江省宁波市' },
    { id: '330300', name: '温州市', fullname: '浙江省温州市' },
    { id: '330400', name: '嘉兴市', fullname: '浙江省嘉兴市' },
    { id: '330500', name: '湖州市', fullname: '浙江省湖州市' }
  ];
  
  setTimeout(() => {
    res.json({
      success: true,
      data: districts,
      message: '行政区划获取成功（模拟数据）',
      mock: true
    });
  }, 200);
});

// 清除缓存端点（用于测试）
router.get('/clear-cache', (req, res) => {
  // 这里可以添加缓存清理逻辑
  res.json({
    success: true,
    message: '模拟API缓存已重置',
    timestamp: new Date().toISOString()
  });
});

// 获取模拟数据配置
router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: {
      available_locations: Object.keys(MOCK_LOCATIONS),
      description: '腾讯地图API模拟服务',
      note: '此服务返回模拟数据，用于开发和测试。生产环境请使用真实的腾讯地图API密钥。'
    }
  });
});

module.exports = router;