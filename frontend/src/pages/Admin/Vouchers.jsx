// src/pages/Admin/VoucherList.jsx

import React, { useState , useEffect} from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

import './Vouchers.css';

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
const getStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return 'Scheduled';    // chưa tới ngày bắt đầu
  if (now > end) return 'Expired';        // đã hết hạn
  return 'Active';                        // đang hoạt động
};


export default function VoucherList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false); // State để biết đang Sửa hay Thêm
  const [currentVoucher, setCV] = useState(null);

const handleOpenDialog = (isEditing = false, vou = null) => {
  setIsEdit(isEditing);
  setDialogOpen(true);

  if (isEditing && vou) {
    setCV(vou);
  } else {
    setCV({
      voucherId: 0,
      code: '',
      description: '',
      discountPercent: 0,
      minOrderAmount: 0,
      startDate: '',
      endDate: ''
    });
  }
};


  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

function handleUpdateDialog(voucher) {
  if(voucher.code.length < 6)
    return alert('Code phải 6 ký tự trở lên');
  if(voucher.startDate === '' || voucher.endDate === '')
    return alert('Ngày kết thúc và bắt đầu không dược trống');
  if(voucher.startDate > voucher.endDate)
    return alert('Ngày kết thúc phải sau ngày bắt đầu');
  fetch(`https://localhost:7132/api/Voucher/${voucher.voucherId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(voucher)
  })
    .then(async (res) => {
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Cập nhật thất bại');
      }
      return res.json();
    })
    .then((updatedVoucher) => {
      setVoucher((prev) =>
        prev.map((v) =>
          v.voucherId === updatedVoucher.voucherId ? updatedVoucher : v
        )
      );
      setDialogOpen(false);
      alert('Cập nhật voucher thành công!');
    })
    .catch((err) => {
      alert('Lỗi: ' + err.message);
    });
}

  function handleCreateDialog(voucher) {
    if(voucher.code.length < 6)
      return alert('Code phải 6 ký tự trở lên');
    if(voucher.startDate === '' || voucher.endDate === '')
      return alert('Ngày kết thúc và bắt đầu không dược trống');
    if(voucher.startDate > voucher.endDate)
      return alert('Ngày kết thúc phải sau ngày bắt đầu');
    fetch(`https://localhost:7132/api/Voucher`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(voucher)
    })
    .then(res => {
      if (!res.ok) throw new Error('Tạo voucher thất bại');
      return res.json();
    })
    .then(newVoucher => {
      setVoucher(prev => [...prev, newVoucher]);
      setDialogOpen(false);
    })
    .catch(err => alert(err));
  }
  function handleDeleteVoucher(voucherId) {
    if (!window.confirm("Bạn có chắc muốn xoá voucher này không?")) return;

    fetch(`https://localhost:7132/api/Voucher/${voucherId}`, {
      method: 'DELETE'
    })
    .then(async res => {
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Xoá voucher thất bại");
      }
      setVoucher(prev => prev.filter(v => v.voucherId !== voucherId));
      alert("Xoá thành công");
    })
    .catch(err => alert(err.message));
  }

  const [vouchers, setVoucher] = useState([]);
  useEffect(() =>{
    fetch('https://localhost:7132/api/Voucher').
    then((res)=>{
      if(res.status === 404){
        throw new Error('Null db');
      }
      if(!res.ok)
        throw new Error('Có lỗi xảy ra..');
        return res.json();
    }).then((data)=> setVoucher(data))
    .catch((err)=>{
      console.log(err);
    })
  },[]);
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
                {vouchers.map((voucher) => { 
                  const status = getStatus(voucher.startDate, voucher.endDate);
                  return(
                  <tr key={voucher.voucherId}>
                    <td>
                      <code className="code-badge">{voucher.code}</code>
                    </td>
                    <td>{voucher.description}</td>
                    <td>{voucher.discountPercent}%</td>
                    <td>{voucher.minOrderAmount?.toLocaleString('vi-VN')} đ</td>
                    <td>{new Date(voucher.startDate)?.toLocaleDateString('vi-VN')}</td>
                    <td>{new Date(voucher.endDate)?.toLocaleDateString('vi-VN')}</td>
                    <td>
                      <span className={`badge ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="action-buttons">
                        <button className="action-button-icon" onClick={() => handleOpenDialog(true, voucher)}>
                          <Edit width={16} height={16} />
                        </button>
                        <button className="action-button-icon-destructive" onClick={()=> handleDeleteVoucher(voucher.voucherId)}>
                          <Trash2 width={16} height={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
                <input id="code" className="form-input" placeholder="VD: WELCOME10" defaultValue={currentVoucher?.code || ''}
                onChange={(e)=> {setCV(prev => ({ ...prev, code: e.target.value }))}}/>
              </div>
              <div className="form-group-span-2">
                <label htmlFor="description">Mô tả</label>
                <input id="description" className="form-input" placeholder="Mô tả voucher" defaultValue={currentVoucher?.description || ''}
                onChange={(e)=> {setCV(prev => ({ ...prev, description: e.target.value }))}}/>
              </div>
              <div className="form-group">
                <label htmlFor="discount">Giảm giá (%)</label>
                <input id="discount" type="number" className="form-input" placeholder="0" defaultValue={currentVoucher?.discountPercent || ''}
                onChange={(e)=> {setCV(prev => ({ ...prev, discountPercent: e.target.value }))}}/>
              </div>
              <div className="form-group">
                <label htmlFor="minOrder">Đơn hàng tối thiểu (VNĐ)</label>
                <input id="minOrder" type="number" className="form-input" placeholder="0" defaultValue={currentVoucher?.minOrderAmount || ''}
                onChange={(e)=> {setCV(prev => ({ ...prev, minOrderAmount: e.target.value }))}}/>
              </div>
              <div className="form-group">
                <label htmlFor="startDate">Ngày bắt đầu</label>
                <input id="startDate" type="date" className="form-input" defaultValue={currentVoucher?.startDate ? new Date(currentVoucher.startDate).toISOString().slice(0,10) : ''}
                onChange={(e)=> {setCV(prev => ({ ...prev, startDate: e.target.value }))}}/>
              </div>
              <div className="form-group">
                <label htmlFor="endDate">Ngày kết thúc</label>
                <input id="endDate" type="date" className="form-input" defaultValue={currentVoucher?.endDate ? new Date(currentVoucher.endDate).toISOString().slice(0,10) : ''}
                onChange={(e)=> {setCV(prev => ({ ...prev, endDate: e.target.value }))}}/>
              </div>
            </div>
            <div className="form-footer">
              <button className="button-outline" onClick={handleCloseDialog}>
                Hủy
              </button>
              <button className="button-primary" onClick={()=>{isEdit ? handleUpdateDialog(currentVoucher) : handleCreateDialog(currentVoucher)}}>
                {isEdit ? 'Cập nhật' : 'Tạo voucher'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}