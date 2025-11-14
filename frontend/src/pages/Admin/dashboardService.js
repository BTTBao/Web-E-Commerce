// src/services/dashboardService.js

import axios from 'axios';

const API_BASE_URL = 'https://localhost:7132/api';

// Tạo axios instance với config mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});




const dashboardService = {
  /**
   * Lấy tất cả dữ liệu dashboard
   */
  getAllDashboardData: async () => {
    try {
      const response = await apiClient.get('/dashboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy thông tin KPI
   */
  getKpiData: async () => {
    try {
      const response = await apiClient.get('/dashboard/kpi');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy dữ liệu doanh thu theo số ngày
   * @param {number} days - Số ngày (mặc định 7)
   */
  getRevenueData: async (days = 7) => {
    try {
      const response = await apiClient.get(`/dashboard/revenue?days=${days}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy thống kê trạng thái đơn hàng
   */
  getOrderStatusData: async () => {
    try {
      const response = await apiClient.get('/dashboard/order-status');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy danh sách đơn hàng mới nhất
   * @param {number} count - Số lượng đơn hàng (mặc định 5)
   */
  getRecentOrders: async (count = 5) => {
    try {
      const response = await apiClient.get(`/dashboard/recent-orders?count=${count}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy danh sách đánh giá mới nhất
   * @param {number} count - Số lượng đánh giá (mặc định 5)
   */
  getRecentReviews: async (count = 5) => {
    try {
      const response = await apiClient.get(`/dashboard/recent-reviews?count=${count}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTopSellingProducts: async (count = 10) => {
    try {
      const response = await apiClient.get(`/dashboard/top-selling-products?count=${count}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default dashboardService;