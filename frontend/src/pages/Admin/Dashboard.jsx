// src/pages/Admin/Dashboard.jsx

import React from 'react';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Import file CSS mới
import './Dashboard.css';

// Dữ liệu (giữ nguyên)
const revenueData = [
  { day: 'T2', revenue: 45000000 },
  { day: 'T3', revenue: 52000000 },
  { day: 'T4', revenue: 48000000 },
  { day: 'T5', revenue: 61000000 },
  { day: 'T6', revenue: 55000000 },
  { day: 'T7', revenue: 67000000 },
  { day: 'CN', revenue: 72000000 },
];

const orderStatusData = [
  { name: 'Chờ xử lý', value: 15, color: '#f59e0b' },
  { name: 'Đã xác nhận', value: 25, color: '#3b82f6' },
  { name: 'Đang giao', value: 20, color: '#8b5cf6' },
  { name: 'Đã giao', value: 35, color: '#10b981' },
  { name: 'Đã hủy', value: 5, color: '#ef4444' },
];

const recentOrders = [
  { id: 'DH001', customer: 'Nguyễn Văn A', amount: 1500000, status: 'Chờ xử lý' },
  { id: 'DH002', customer: 'Trần Thị B', amount: 2300000, status: 'Chờ xử lý' },
  { id: 'DH003', customer: 'Lê Văn C', amount: 890000, status: 'Chờ xử lý' },
  { id: 'DH004', customer: 'Phạm Thị D', amount: 3200000, status: 'Chờ xử lý' },
  { id: 'DH005', customer: 'Hoàng Văn E', amount: 1750000, status: 'Chờ xử lý' },
];

const recentReviews = [
  { id: 1, product: 'iPhone 15 Pro Max', customer: 'Nguyễn A', rating: 5, status: 'Pending' },
  { id: 2, product: 'Samsung Galaxy S24', customer: 'Trần B', rating: 4, status: 'Pending' },
  { id: 3, product: 'Laptop Dell XPS 15', customer: 'Lê C', rating: 5, status: 'Pending' },
  { id: 4, product: 'AirPods Pro 2', customer: 'Phạm D', rating: 4, status: 'Pending' },
  { id: 5, product: 'iPad Air M2', customer: 'Hoàng E', rating: 5, status: 'Pending' },
];

export default function Dashboard() {
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
            <div className="kpi-value">1.543.000.000 đ</div>
            <p className="kpi-change">+12.5% so với tháng trước</p>
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
            <div className="kpi-value">45</div>
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
            <div className="kpi-value">127</div>
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
            <div className="kpi-value">8</div>
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
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString('vi-VN')} đ`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Doanh thu" />
              </LineChart>
            </ResponsiveContainer>
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
              {recentOrders.map((order) => (
                <div key={order.id} className="activity-item">
                  <div className="activity-details">
                    <p className="activity-main-text">{order.id}</p>
                    <p className="activity-sub-text">{order.customer}</p>
                  </div>
                  <div className="activity-aside">
                    <p className="activity-main-text">{order.amount.toLocaleString('vi-VN')} đ</p>
                    <span className="badge badge-orange">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
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
              {recentReviews.map((review) => (
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}