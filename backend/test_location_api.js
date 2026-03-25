#!/usr/bin/env node

/**
 * 微信定位API测试脚本
 * 使用方法: node test_location_api.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api/utils';

// 测试坐标（广州天河城）
const TEST_LATITUDE = '23.129163';
const TEST_LONGITUDE = '113.264435';
const TEST_ADDRESS = '广州市天河区体育西路';

async function testReverseGeocode() {
  console.log('🧪 测试逆地理编码（坐标转地址）...');
  try {
    const response = await axios.get(`${BASE_URL}/map/${TEST_LATITUDE}/${TEST_LONGITUDE}`);
    console.log('✅ 请求成功');
    console.log('状态码:', response.status);
    
    if (response.data.success) {
      const data = response.data.data;
      console.log('📌 地址:', data.formatted_address);
      console.log('🏙️ 省份:', data.address_component?.province);
      console.log('🏙️ 城市:', data.address_component?.city);
      console.log('🏙️ 区县:', data.address_component?.district);
      console.log('📍 坐标:', `纬度 ${data.location.lat}, 经度 ${data.location.lng}`);
      console.log('🏪 周边POI数量:', data.pois?.length || 0);
    } else {
      console.log('❌ API返回错误:', response.data.message);
      console.log('详细信息:', response.data.details);
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
    if (error.response) {
      console.log('状态码:', error.response.status);
      console.log('错误信息:', error.response.data);
    }
  }
  console.log('---\n');
}

async function testGeocode() {
  console.log('🧪 测试地理编码（地址转坐标）...');
  try {
    const response = await axios.get(`${BASE_URL}/geocode`, {
      params: { address: TEST_ADDRESS }
    });
    console.log('✅ 请求成功');
    console.log('状态码:', response.status);
    
    if (response.data.success) {
      const data = response.data.data;
      console.log('📌 地址:', data.address);
      console.log('📍 坐标:', `纬度 ${data.location.lat}, 经度 ${data.location.lng}`);
    } else {
      console.log('❌ API返回错误:', response.data.message);
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
    if (error.response) {
      console.log('状态码:', error.response.status);
      console.log('错误信息:', error.response.data);
    }
  }
  console.log('---\n');
}

async function testNearbyPoi() {
  console.log('🧪 测试周边POI搜索...');
  try {
    const response = await axios.get(`${BASE_URL}/poi/nearby`, {
      params: {
        latitude: TEST_LATITUDE,
        longitude: TEST_LONGITUDE,
        keyword: '餐厅',
        radius: 1000,
        page_size: 5
      }
    });
    console.log('✅ 请求成功');
    console.log('状态码:', response.status);
    
    if (response.data.success) {
      const data = response.data.data;
      console.log('🔍 搜索结果数量:', data.count);
      console.log('🏪 返回POI数量:', data.pois?.length || 0);
      
      if (data.pois && data.pois.length > 0) {
        console.log('📋 前3个结果:');
        data.pois.slice(0, 3).forEach((poi, index) => {
          console.log(`  ${index + 1}. ${poi.title} - ${poi.address}`);
          console.log(`     分类: ${poi.category}, 距离: ${poi.distance}米`);
        });
      }
    } else {
      console.log('❌ API返回错误:', response.data.message);
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
    if (error.response) {
      console.log('状态码:', error.response.status);
      console.log('错误信息:', error.response.data);
    }
  }
  console.log('---\n');
}

async function testDistrict() {
  console.log('🧪 测试行政区划查询...');
  try {
    const response = await axios.get(`${BASE_URL}/district`, {
      params: { id: '440000' } // 广东省
    });
    console.log('✅ 请求成功');
    console.log('状态码:', response.status);
    
    if (response.data.success) {
      const data = response.data.data;
      console.log('🗺️ 行政区划数量:', data.length);
      
      if (data.length > 0) {
        console.log('📋 前5个行政区划:');
        data.slice(0, 5).forEach((district, index) => {
          console.log(`  ${index + 1}. ${district.fullname} (ID: ${district.id})`);
        });
      }
    } else {
      console.log('❌ API返回错误:', response.data.message);
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
    if (error.response) {
      console.log('状态码:', error.response.status);
      console.log('错误信息:', error.response.data);
    }
  }
  console.log('---\n');
}

async function testErrorHandling() {
  console.log('🧪 测试错误处理...');
  
  // 测试缺少参数
  console.log('1. 测试缺少经纬度参数...');
  try {
    await axios.get(`${BASE_URL}/map//`);
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ 正确返回400错误');
      console.log('错误信息:', error.response.data.message);
    }
  }
  
  // 测试无效坐标
  console.log('\n2. 测试无效坐标...');
  try {
    await axios.get(`${BASE_URL}/map/999/999`);
  } catch (error) {
    console.log('状态码:', error.response?.status);
    console.log('错误信息:', error.response?.data?.message || error.message);
  }
  
  console.log('---\n');
}

async function runAllTests() {
  console.log('🚀 开始测试微信定位API\n');
  console.log('测试服务器:', BASE_URL);
  console.log('测试坐标:', `${TEST_LATITUDE}, ${TEST_LONGITUDE}`);
  console.log('测试地址:', TEST_ADDRESS);
  console.log('='.repeat(50) + '\n');
  
  await testReverseGeocode();
  await testGeocode();
  await testNearbyPoi();
  await testDistrict();
  await testErrorHandling();
  
  console.log('='.repeat(50));
  console.log('✅ 所有测试完成');
  console.log('💡 提示: 如果看到"key每日调用量已达到上限"错误，');
  console.log('     请申请自己的腾讯地图API密钥并更新配置');
}

// 运行测试
runAllTests().catch(console.error);