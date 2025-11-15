// src/pages/Admin/VoucherList.jsx

import React, { useState , useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import './Vouchers.css';
import { toast } from 'sonner';

const getStatusColor = (status) => {
  switch (status) {
    case 'Active': return 'badge-green';
    case 'Expired': return 'badge-gray';
    case 'Scheduled': return 'badge-blue';
    default: return 'badge-gray';
  }
};

const getStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return 'Scheduled';
  if (now > end) return 'Expired';
  return 'Active';
};

export default function VoucherList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentVoucher, setCV] = useState(null);

  const [vouchers, setVoucher] = useState([]);

  // SEARCH
  const [searchTerm, setSearchTerm] = useState("");

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetch('https://localhost:7132/api/Voucher')
      .then(res => {
        if (!res.ok) throw new Error('Không thể tải danh sách voucher');
        return res.json();
      })
      .then(data => setVoucher(data))
      .catch(err => toast.error(err.message));
  }, []);

  // FILTER LOGIC
  const filteredVouchers = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return vouchers.filter(v =>
      v.code.toLowerCase().includes(search) ||
      v.description?.toLowerCase().includes(search)
    );
  }, [vouchers, searchTerm]);

  // PAGINATION LOGIC
  const totalPages = Math.ceil(filteredVouchers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredVouchers.slice(startIndex, startIndex + itemsPerPage);

  const handleOpenDialog = (edit = false, vou = null) => {
    setIsEdit(edit);
    setDialogOpen(true);
    setCV(
      edit ? vou : {
        voucherId: 0,
        code: '',
        description: '',
        discountPercent: 0,
        minOrderAmount: 0,
        startDate: '',
        endDate: ''
      }
    );
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  function handleUpdateDialog(voucher) {
    if (!validateVoucher(voucher)) return;

    fetch(`https://localhost:7132/api/Voucher/${voucher.voucherId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voucher)
    })
      .then(res => {
        if (!res.ok) throw new Error('Cập nhật thất bại');
        return res.json();
      })
      .then(updated => {
        setVoucher(prev => prev.map(v => v.voucherId === updated.voucherId ? updated : v));
        toast.success("Cập nhật thành công");
        handleCloseDialog();
      })
      .catch(err => toast.error(err.message));
  }

  function handleCreateDialog(voucher) {
    if (!validateVoucher(voucher)) return;

    fetch(`https://localhost:7132/api/Voucher`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voucher)
    })
      .then(res => {
        if (!res.ok) throw new Error('Tạo voucher thất bại');
        return res.json();
      })
      .then(newVoucher => {
        setVoucher(prev => [...prev, newVoucher]);
        toast.success("Tạo mới thành công");
        handleCloseDialog();
      })
      .catch(err => toast.error(err.message));
  }

  const validateVoucher = (voucher) => {
    if (voucher.code.length < 6)
      return toast.error("Mã phải >= 6 ký tự");

    if (!voucher.startDate || !voucher.endDate)
      return toast.error("Ngày bắt đầu/kết thúc không được trống");

    if (voucher.startDate > voucher.endDate)
      return toast.error("Ngày kết thúc phải sau ngày bắt đầu");

    return true;
  };

  function handleDeleteVoucher(id) {
    if (!window.confirm("Bạn chắc chắn muốn xoá?")) return;
    fetch(`https://localhost:7132/api/Voucher/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error("Xoá thất bại");
        setVoucher(prev => prev.filter(v => v.voucherId !== id));
        toast.success("Xoá thành công");
      })
      .catch(err => toast.error(err.message));
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Vouchers</h1>
          <p className="page-subtitle">Tạo và quản lý mã giảm giá</p>
        </div>
        <button className="button-primary" onClick={() => handleOpenDialog(false)}>
          <Plus width={16} height={16} /> Thêm voucher
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <input
            className="search-input"
            placeholder="Tìm kiếm mã hoặc mô tả..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="card-content">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Mô tả</th>
                  <th>Giảm</th>
                  <th>Tối thiểu</th>
                  <th>Bắt đầu</th>
                  <th>Kết thúc</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {currentItems.map(voucher => {
                  const status = getStatus(voucher.startDate, voucher.endDate);
                  return (
                    <tr key={voucher.voucherId}>
                      <td><code className="code-badge">{voucher.code}</code></td>
                      <td>{voucher.description}</td>
                      <td>{voucher.discountPercent}%</td>
                      <td>{voucher.minOrderAmount.toLocaleString()}</td>
                      <td>{new Date(voucher.startDate).toLocaleDateString('vi-VN')}</td>
                      <td>{new Date(voucher.endDate).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <span className={`badge ${getStatusColor(status)}`}>{status}</span>
                      </td>
                      <td className="text-right">
                        <div className="action-buttons">
                          <button onClick={() => handleOpenDialog(true, voucher)} className="action-button-icon">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDeleteVoucher(voucher.voucherId)} className="action-button-icon-destructive">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>

          {/* PAGINATION UI */}
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              ‹
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={currentPage === i + 1 ? "active" : ""}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              ›
            </button>
          </div>

        </div>
      </div>

      {/* DIALOG */}
      {dialogOpen && (
        <div className="dialog-overlay" onClick={handleCloseDialog}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>

            <h3 className="dialog-title">{isEdit ? "Chỉnh sửa voucher" : "Thêm voucher"}</h3>

            <div className="form-grid-2">
              <div className="form-group-span-2">
                <label>Mã voucher</label>
                <input
                  className="form-input"
                  defaultValue={currentVoucher?.code}
                  onChange={(e) => setCV(prev => ({ ...prev, code: e.target.value }))}
                />
              </div>

              <div className="form-group-span-2">
                <label>Mô tả</label>
                <input
                  className="form-input"
                  defaultValue={currentVoucher?.description}
                  onChange={(e) => setCV(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Giảm (%)</label>
                <input
                  type="number"
                  className="form-input"
                  defaultValue={currentVoucher?.discountPercent}
                  onChange={(e) => setCV(prev => ({ ...prev, discountPercent: Number(e.target.value) }))}
                />
              </div>

              <div className="form-group">
                <label>Tối thiểu (VND)</label>
                <input
                  type="number"
                  className="form-input"
                  defaultValue={currentVoucher?.minOrderAmount}
                  onChange={(e) => setCV(prev => ({ ...prev, minOrderAmount: Number(e.target.value) }))}
                />
              </div>

              <div className="form-group">
                <label>Bắt đầu</label>
                <input
                  type="date"
                  className="form-input"
                  defaultValue={currentVoucher?.startDate?.slice(0, 10)}
                  onChange={(e) => setCV(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Kết thúc</label>
                <input
                  type="date"
                  className="form-input"
                  defaultValue={currentVoucher?.endDate?.slice(0, 10)}
                  onChange={(e) => setCV(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-footer">
              <button className="button-outline" onClick={handleCloseDialog}>Hủy</button>
              <button
                className="button-primary"
                onClick={() =>
                  isEdit ? handleUpdateDialog(currentVoucher) : handleCreateDialog(currentVoucher)
                }
              >
                {isEdit ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
