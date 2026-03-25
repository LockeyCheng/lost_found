import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// 物品相关API
export const itemAPI = {
  getItems: (params?: any) => api.get('/items', { params }),
  getItem: (id: string) => api.get(`/items/${id}`),
  createItem: (data: FormData) => api.post('/items', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateItemStatus: (id: string, status: string) => 
    api.patch(`/items/${id}/status`, { status }),
  deleteItem: (id: string) => api.delete(`/items/${id}`),
  // 新增：统计相关API
  incrementViewCount: (id: string) => api.post(`/items/${id}/view`),
  toggleFollow: (id: string) => api.post(`/items/${id}/follow`),
  recommendItem: (id: string) => api.post(`/items/${id}/recommend`),
  recordShare: (id: string, shareType: string = 'copy_link') => 
    api.post(`/items/${id}/share`, { share_type: shareType }),
};

// 线索相关API
export const clueAPI = {
  getCluesByItem: (itemId: string) => api.get(`/clues/item/${itemId}`),
  createClue: (data: FormData) => api.post('/clues', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateClue: (id: string, data: FormData) => 
    api.put(`/clues/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteClue: (id: string) => api.delete(`/clues/${id}`),
};

export default api;