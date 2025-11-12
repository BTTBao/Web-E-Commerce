// src/pages/Admin/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dashboardService from './dashboardService.js';
import './Dashboard.css';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    kpi: null,
    revenueData: [],
    orderStatusData: [],
    recentOrders: [],
    recentReviews: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await dashboardService.getAllDashboardData();
      
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError(response.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          fontSize: '18px',
          color: '#666'
        }}>
          <div>
            <div className="spinner" style={{ 
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div style={{ 
          textAlign: 'center', 
          padding: '50px',
          backgroundColor: '#fee',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <p style={{ color: '#c33', fontSize: '16px', marginBottom: '20px' }}>
            ⚠️ {error}
          </p>
          <button 
            onClick={fetchDashboardData}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Thử lại
          </button>
        </div>
      </div>
    );
  }

  const { kpi, revenueData, orderStatusData, recentOrders, recentReviews } = dashboardData;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Chào mừng trở lại! Đây là tổng quan hệ thống của bạn.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="card kpi-card kpi-green">
          <div className="card-header kpi-header">
            <h3 className="card-title kpi-title">Doanh thu tháng</h3>
            <div className="kpi-icon-wrapper">
              <DollarSign />
            </div>
          </div>
          <div className="card-content">
            <div className="kpi-value">
              {kpi ? formatCurrency(kpi.monthlyRevenue) : '0 đ'}
            </div>
            <p className="kpi-change">
              {kpi ? (
                <span style={{ color: kpi.revenueChangePercent >= 0 ? '#10b981' : '#ef4444' }}>
                  {kpi.revenueChangePercent > 0 ? '+' : ''}{kpi.revenueChangePercent}% so với tháng trước
                </span>
              ) : 'Đang tải...'}
            </p>
          </div>
        </div>

        <div className="card kpi-card kpi-blue">
          <div className="card-header kpi-header">
            <h3 className="card-title kpi-title">Đơn hàng mới</h3>
            <div className="kpi-icon-wrapper">
              <ShoppingCart />
            </div>
          </div>
          <div className="card-content">
            <div className="kpi-value">{kpi ? kpi.newOrdersCount : 0}</div>
            <p className="kpi-change">Chờ xử lý</p>
          </div>
        </div>

        <div className="card kpi-card kpi-purple">
          <div className="card-header kpi-header">
            <h3 className="card-title kpi-title">Khách hàng mới</h3>
            <div className="kpi-icon-wrapper">
              <Users />
            </div>
          </div>
          <div className="card-content">
            <div className="kpi-value">{kpi ? kpi.newCustomersCount : 0}</div>
            <p className="kpi-change">Trong tháng này</p>
          </div>
        </div>

        <div className="card kpi-card kpi-red">
          <div className="card-header kpi-header">
            <h3 className="card-title kpi-title">Sản phẩm sắp hết</h3>
            <div className="kpi-icon-wrapper">
              <Package />
            </div>
          </div>
          <div className="card-content">
            <div className="kpi-value">{kpi ? kpi.lowStockProductsCount : 0}</div>
            <p className="kpi-change">Cần nhập thêm</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="card chart-card">
          <div className="card-header">
            <h3 className="card-title chart-title">
              <div className="chart-icon-wrapper icon-blue">
                <DollarSign />
              </div>
              Doanh thu 7 ngày qua
            </h3>
          </div>
          <div className="card-content">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Doanh thu" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: 'center', color: '#999', padding: '50px' }}>Chưa có dữ liệu</p>
            )}
          </div>
        </div>

        <div className="card chart-card">
          <div className="card-header">
            <h3 className="card-title chart-title">
              <div className="chart-icon-wrapper icon-purple">
                <ShoppingCart />
              </div>
              Trạng thái đơn hàng
            </h3>
          </div>
          <div className="card-content">
            {orderStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: 'center', color: '#999', padding: '50px' }}>Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="recent-activity-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title chart-title">
              <div className="chart-icon-wrapper icon-orange">
                <ShoppingCart />
              </div>
              Đơn hàng mới nhất
            </h3>
          </div>
          <div className="card-content">
            <div className="activity-list">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="activity-item">
                    <div className="activity-details">
                      <p className="activity-main-text">{order.id}</p>
                      <p className="activity-sub-text">{order.customer}</p>
                    </div>
                    <div className="activity-aside">
                      <p className="activity-main-text">{formatCurrency(order.amount)}</p>
                      <span className="badge badge-orange">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>Chưa có đơn hàng mới</p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title chart-title">
              <div className="chart-icon-wrapper icon-yellow">
                <span className="star-icon">★</span>
              </div>
              Đánh giá mới nhất
            </h3>
          </div>
          <div className="card-content">
            <div className="activity-list">
              {recentReviews.length > 0 ? (
                recentReviews.map((review) => (
                  <div key={review.id} className="activity-item">
                    <div className="activity-details">
                      <p className="activity-main-text">{review.product}</p>
                      <p className="activity-sub-text">{review.customer}</p>
                    </div>
                    <div className="activity-aside-reviews">
                      <div className="star-rating">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'star-filled' : 'star-empty'}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="badge badge-blue">
                        Chờ duyệt
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>Chưa có đánh giá mới</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}