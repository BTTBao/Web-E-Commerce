// src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://localhost:7132/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Thêm interceptor để tự động gắn token vào mọi request
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skynet_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// (Tuỳ chọn) Xử lý lỗi phản hồi
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

export default axiosClient;
