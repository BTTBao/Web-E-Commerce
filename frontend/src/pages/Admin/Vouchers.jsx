// src/pages/Admin/VoucherList.jsx

import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

// Import file CSS (chỉ cần 1 file này)
import './Vouchers.css';

// Dữ liệu mẫu (giữ nguyên)
const vouchers = [
  {
    id: 'V001',
    code: 'WELCOME10',
    description: 'Giảm 10% cho khách hàng mới',
    discountPercent: 10,
    minOrderAmount: 500000,
    startDate: '2025-10-01',
    endDate: '2025-12-31',
    status: 'Active',
  },
  {
    id: 'V002',
    code: 'FREESHIP',
    description: 'Miễn phí vận chuyển đơn hàng trên 1 triệu',
    discountPercent: 0,
    minOrderAmount: 1000000,
    startDate: '2025-10-01',
    endDate: '2025-10-31',
    status: 'Active',
  },
  {
    id: 'V003',
    code: 'SUMMER20',
    description: 'Giảm 20% mùa hè',
    discountPercent: 20,
    minOrderAmount: 2000000,
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    status: 'Expired',
  },
  {
    id: 'V004',
    code: 'FLASH15',
    description: 'Flash sale giảm 15%',
    discountPercent: 15,
    minOrderAmount: 300000,
    startDate: '2025-11-01',
    endDate: '2025-11-30',
    status: 'Scheduled',
  },
];

// Hàm lấy class CSS (thay cho Tailwind)
const getStatusColor = (status) => {
  switch (status) {
    case 'Active':
      return 'badge-green';
    case 'Expired':
      return 'badge-gray';
    case 'Scheduled':
      return 'badge-blue';
    default:
      return 'badge-gray';
  }
};

// Hàm lấy text (giữ nguyên)
const getStatusLabel = (status) => {
  switch (status) {
    case 'Active':
      return 'Đang hoạt động';
    case 'Expired':
      return 'Đã hết hạn';
    case 'Scheduled':
      return 'Sắp diễn ra';
    default:
      return status;
  }
};

export default function VoucherList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false); // State để biết đang Sửa hay Thêm

  const handleOpenDialog = (isEditing = false) => {
    setIsEdit(isEditing);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Vouchers</h1>
          <p className="page-subtitle">Tạo và quản lý mã giảm giá</p>
        </div>
        <button className="button-primary" onClick={() => handleOpenDialog(false)}>
          <Plus width={16} height={16} style={{ marginRight: '8px' }} />
          Thêm voucher
        </button>
      </div>

      {/* Bảng danh sách */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Danh sách vouchers</h3>
        </div>
        <div className="card-content">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Mô tả</th>
                  <th>Giảm giá</th>
                  <th>Đơn tối thiểu</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày kết thúc</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((voucher) => (
                  <tr key={voucher.id}>
                    <td>
                      <code className="code-badge">{voucher.code}</code>
                    </td>
                    <td>{voucher.description}</td>
                    <td>{voucher.discountPercent}%</td>
                    <td>{voucher.minOrderAmount.toLocaleString('vi-VN')} đ</td>
                    <td>{new Date(voucher.startDate).toLocaleDateString('vi-VN')}</td>
                    <td>{new Date(voucher.endDate).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <span className={`badge ${getStatusColor(voucher.status)}`}>
                        {getStatusLabel(voucher.status)}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="action-buttons">
                        <button className="action-button-icon" onClick={() => handleOpenDialog(true)}>
                          <Edit width={16} height={16} />
                        </button>
                        <button className="action-button-icon-destructive">
                          <Trash2 width={16} height={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- Dialog (Modal) Thêm/Sửa Voucher --- */}
      {dialogOpen && (
        <div className="dialog-overlay" onClick={handleCloseDialog}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3 className="dialog-title">
                {isEdit ? 'Chỉnh sửa voucher' : 'Thêm voucher mới'}
              </h3>
            </div>
            <div className="form-grid-2">
              <div className="form-group-span-2">
                <label htmlFor="code">Mã voucher</label>
                <input id="code" className="form-input" placeholder="VD: WELCOME10" />
              </div>
              <div className="form-group-span-2">
                <label htmlFor="description">Mô tả</label>
                <input id="description" className="form-input" placeholder="Mô tả voucher" />
              </div>
              <div className="form-group">
                <label htmlFor="discount">Giảm giá (%)</label>
                <input id="discount" type="number" className="form-input" placeholder="0" />
              </div>
              <div className="form-group">
                <label htmlFor="minOrder">Đơn hàng tối thiểu (VNĐ)</label>
                <input id="minOrder" type="number" className="form-input" placeholder="0" />
              </div>
              <div className="form-group">
                <label htmlFor="startDate">Ngày bắt đầu</label>
                <input id="startDate" type="date" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">Ngày kết thúc</label>
                <input id="endDate" type="date" className="form-input" />
              </div>
            </div>
            <div className="form-footer">
              <button className="button-outline" onClick={handleCloseDialog}>
                Hủy
              </button>
              <button className="button-primary" onClick={handleCloseDialog}>
                {isEdit ? 'Cập nhật' : 'Tạo voucher'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}