// src/pages/Admin/CustomerDetail.jsx

// Thêm useState, useEffect
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, MessageSquare } from 'lucide-react'; 
import { useParams, useNavigate } from 'react-router-dom';

// Import file CSS
import './Vouchers.css';
import './CustomerDetail.css';

// --- CẤU HÌNH API ---
const API_URL = 'https://localhost:7132/api/customers';

// --- CÁC HÀM HỖ TRỢ (Giữ nguyên) ---

const getStatusColor = (status) => {
    switch (status) {
        case 'Pending': return 'badge-orange';
        case 'Confirmed': return 'badge-blue';
        case 'Shipped': return 'badge-purple';
        case 'Delivered': return 'badge-green';
        case 'Cancelled': return 'badge-red';
        default: return 'badge-gray';
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'Pending': return 'Chờ xử lý';
        case 'Confirmed': return 'Đã xác nhận';
        case 'Shipped': return 'Đang giao';
        case 'Delivered': return 'Đã giao';
        case 'Cancelled': return 'Đã hủy';
        default: return status;
    }
};

export default function CustomerDetail() {
    const { customerId } = useParams(); // Lấy ID từ URL (ví dụ: "U2")
    const navigate = useNavigate();

    // --- STATE MỚI ĐỂ LẤY DỮ LIỆU TỪ API ---
    const [customer, setCustomer] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- [EFFECT] GỌI API KHI COMPONENT MỞ RA ---
    useEffect(() => {
        if (!customerId) return;

        setLoading(true);
        fetch(`${API_URL}/${customerId}`)
            .then(res => {
                if (res.status === 404) {
                    throw new Error(`Không tìm thấy khách hàng với ID: ${customerId}`);
                }
                if (!res.ok) {
                    throw new Error('Không thể tải chi tiết khách hàng. Lỗi server.');
                }
                return res.json();
            })
            .then(data => {
                // 🛑 LỆNH DEBUG QUAN TRỌNG: IN TOÀN BỘ DỮ LIỆU ĐỂ TÌM TÊN TRƯỜNG ID CHÍNH XÁC
                console.log("--- DEBUG: DỮ LIỆU CUSTOMER TỪ API ---", data);
                
                setCustomer(data); // Lưu dữ liệu khách hàng vào state
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi fetch chi tiết:", err);
                setError(err.message);
                setLoading(false);
            });
    }, [customerId]);

    const handleBack = () => {
        navigate(-1);
    };
    
    const handleStartChat = () => {
    
    // 1. Lấy ID thô (ƯU TIÊN TRƯỜNG ĐÃ ĐƯỢC XÁC ĐỊNH LÀ 'accountId')
    const rawId = 
        customer?.accountId ||   // 👈 FIX: Ưu tiên trường 'accountId' đã tìm thấy
        customer?.AccountID || 
        customer?.Id || 
        customer?.id; 

    if (!customer || !rawId) { 
        console.error(
            "Lỗi: Không tìm thấy Account ID khách hàng hợp lệ trong đối tượng customer. " +
            "VUI LÒNG KIỂM TRA LOG TRÊN ĐỂ XEM TÊN TRƯỜNG ID CHÍNH XÁC."
        );
        return;
    }

    // 2. Ép kiểu về số nguyên (Bắt buộc cho API C#)
    const finalCustomerId = parseInt(rawId);

    if (isNaN(finalCustomerId)) {
        console.error(`Lỗi: ID khách hàng ('${rawId}') không phải là số nguyên. Không thể mở chat.`);
        return;
    }
    
    try {
        console.log(`Chuyển hướng thành công. Chuẩn bị mở chat với ID số: ${finalCustomerId}`);
        
        // 3. Chuyển hướng và truyền ID DẠNG SỐ (int)
        navigate('/admin/chat', { 
            state: { 
                targetCustomerId: finalCustomerId, 
                customerName: customer.fullName 
            } 
        });
    } catch (e) {
        console.error("Lỗi khi thực hiện navigate:", e);
    }
};

    // --- RENDER LOADING VÀ LỖI ---
    if (loading) {
        return <div className="page-container">Đang tải chi tiết khách hàng...</div>;
    }

    if (error) {
        return (
            <div className="page-container">
                <button className="back-button" onClick={handleBack}>
                    <ArrowLeft className="back-icon" />
                    Quay lại
                </button>
                <p className="error-message">Lỗi: {error}</p>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="page-container">
                <button className="back-button" onClick={handleBack}>
                    <ArrowLeft className="back-icon" />
                    Quay lại
                </button>
                <p>Không tìm thấy dữ liệu khách hàng.</p>
            </div>
        );
    }

    // --- TÍNH TOÁN ---
    const orders = customer.orders || [];
    const addresses = customer.addresses || [];
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = totalSpent > 0 ? totalSpent / orders.length : 0;

    // --- RENDER DỮ LIỆU TỪ STATE 'customer' ---
    return (
        <div className="page-container">
            <div className="order-detail-header">
                <button className="back-button" onClick={handleBack}>
                    <ArrowLeft className="back-icon" />
                    Quay lại
                </button>
                <h1 className="order-detail-title">Chi tiết khách hàng</h1>
                <div className="header-spacer-right" />
            </div>

            <div className="main-grid">
                {/* Cột trái */}
                <div className="grid-left-col">
                    {/* Lịch sử đơn hàng */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Lịch sử đơn hàng</h3>
                        </div>
                        <div className="card-content">
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Mã ĐH</th>
                                            <th>Ngày đặt</th>
                                            <th>Tổng tiền</th>
                                            <th>Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order.id}>
                                                <td>{order.id}</td>
                                                <td>{new Date(order.date).toLocaleDateString('vi-VN')}</td>
                                                <td>{order.total.toLocaleString('vi-VN')} đ</td>
                                                <td>
                                                    <span className={`badge ${getStatusColor(order.status)}`}>
                                                        {getStatusLabel(order.status)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Địa chỉ */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Địa chỉ</h3>
                        </div>
                        <div className="card-content address-list">
                            {addresses.map((address) => (
                                <div key={address.id} className="address-block">
                                    <div className="address-header">
                                        <h4 className="address-name">{address.name}</h4>
                                        {address.isDefault && (
                                            <span className="badge badge-blue">Mặc định</span>
                                        )}
                                    </div>
                                    <div className="address-details">
                                        <div className="address-line">
                                            <MapPin width={16} height={16} />
                                            <span>{address.address}</span>
                                        </div>
                                        <div className="address-line">
                                            <Phone width={16} height={16} />
                                            <span>{address.phone}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cột phải */}
                <div className="grid-right-col">
                    {/* Thông tin khách hàng */}
                    <div className="card">
                        <div className="card-header customer-info-header">
                            <h3 className="card-title">Thông tin khách hàng</h3>
                            {/* 🟢 NÚT CHAT MỚI */}
                            <button 
                                className="button-primary button-sm chat-button"
                                onClick={handleStartChat}
                            >
                                <MessageSquare width={16} height={16} />
                                Chat với khách
                            </button>
                            {/* --------------------- */}
                        </div>
                        <div className="card-content info-card-content">
                            <div className="info-row">
                                <p className="info-label">Họ tên</p>
                                <p className="info-value">{customer.fullName}</p>
                            </div>
                            <div className="info-row">
                                <p className="info-label">Username (Email)</p>
                                <p className="info-value">{customer.email}</p>
                            </div>
                            <div className="info-row-icon">
                                <Mail width={16} height={16} className="info-icon" />
                                <div className="info-text-group">
                                    <p className="info-label">Email</p>
                                    <p className="info-value">{customer.email}</p>
                                </div>
                            </div>
                            <div className="info-row-icon">
                                <Phone width={16} height={16} className="info-icon" />
                                <div className="info-text-group">
                                    <p className="info-label">Số điện thoại</p>
                                    <p className="info-value">{customer.phone}</p>
                                </div>
                            </div>
                            <div className="info-row">
                                <p className="info-label">Ngày đăng ký</p>
                                <p className="info-value">{new Date(customer.registeredDate).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <div className="info-row">
                                <p className="info-label">Trạng thái</p>
                                <span className={`badge ${customer.isActive ? 'badge-green' : 'badge-red'}`}>
                                    {customer.isActive ? 'Hoạt động' : 'Đã khóa'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Thống kê */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Thống kê</h3>
                        </div>
                        <div className="card-content info-card-content">
                            <div className="info-row">
                                <p className="info-label">Tổng đơn hàng</p>
                                <p className="stats-value">{orders.length}</p>
                            </div>
                            <div className="info-row">
                                <p className="info-label">Tổng chi tiêu</p>
                                <p className="stats-value">{totalSpent.toLocaleString('vi-VN')} đ</p>
                            </div>
                            <div className="info-row">
                                <p className="info-label">Giá trị trung bình</p>
                                <p className="stats-value">{avgOrderValue.toLocaleString('vi-VN')} đ</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}