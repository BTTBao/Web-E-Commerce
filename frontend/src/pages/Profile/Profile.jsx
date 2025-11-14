// CÁC IMPORT CỦA BẠN
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import provinces from '../../../data/provinces.json';
import districts from '../../../data/districts.json';
import wards from '../../../data/wards.json';
import { Eye, PencilLineIcon, SquarePen } from 'lucide-react';





const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  try {
    let date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      // parts[0] = DD, parts[1] = MM, parts[2] = YYYY
      const isoDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      date = new Date(isoDate);
      if (!isNaN(date.getTime())) {
        return isoDate;
      }
    }
    console.warn("Không thể định dạng ngày:", dateStr);
    return '';
  } catch (error) {
    console.error('Lỗi định dạng ngày:', error);
    return '';
  }
};


export default function Profile() {

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [activeOrder, setActiveOrder] = useState('all');
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [address, setAddress] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [user, setUser] = useState(JSON.parse(localStorage.getItem('account')) || {});


  const [newAddress, setNewAddress] = useState({
    receiverFullName: '',
    receiverPhone: '',
    addressLine: '',
    ward: '',
    district: '',
    province: '',
    isDefault: false,
  });

  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    email: '',
    phone: '',
  });

  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableWards, setAvailableWards] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.user?.fullName || '',
        gender: user.user?.gender || '',
        dateOfBirth: formatDateForInput(user.user?.dateOfBirth),
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (newAddress.province) {
      const provinceData = provinces.find(p => p.name === newAddress.province);
      const filtered = provinceData
        ? districts.filter(d => d.province_code === Number(provinceData.code))
        : [];
      setAvailableDistricts(filtered);
    } else {
      setAvailableDistricts([]);
    }
    setNewAddress(prev => ({ ...prev, district: '', ward: '' }));
  }, [newAddress.province]);
  useEffect(() => {
    if (newAddress.district) {
      const districtData = districts.find(d => d.name === newAddress.district);
      const filtered = districtData
        ? wards.filter(w => w.district_code === Number(districtData.code))
        : [];
      setAvailableWards(filtered);
    } else {
      setAvailableWards([]);
    }
    setNewAddress(prev => ({ ...prev, ward: '' }));
  }, [newAddress.district]);

  const handleNewAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetAddressForm = () => {
    setShowForm(false);
    setNewAddress({
      receiverFullName: '',
      receiverPhone: '',
      addressLine: '',
      ward: '',
      district: '',
      province: '',
      isDefault: false,
    });
    setAvailableDistricts([]);
    setAvailableWards([]);
  };

const LoadOrders = async (type = 'all') => {
      setLoading(true);
      const token = localStorage.getItem('token');
      setPage(1);
      setActiveOrder(type);

      try {
        const res = await fetch(`https://localhost:7132/api/Order/getall?accountId=${user.accountId}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        } else {
          console.error("Lỗi load đơn hàng!");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const LoadAddress = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://localhost:7132/api/Address/get?accountId=${user.accountId}`);
        if (res.ok) {
          const data = await res.json();
          setAddress(data);
        } else console.error("Lỗi load địa chỉ!");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const HandleDeleteAddress = async (id) => {
      if (!window.confirm("Xóa địa chỉ này?")) return;
      setLoading(true);
      try {
        const res = await fetch(`https://localhost:7132/api/Address/delete?id=${id}`, { method: 'DELETE' });
        if (res.ok) LoadAddress(); 
        else alert("Xóa thất bại!");
      } catch (err) {
        console.error(err);
        alert("Lỗi xảy ra!");
      } finally {
        setLoading(false);
      }
    };

    const HandleSetDefault = async (id) => {
      setLoading(true);
      try {
        const res = await fetch(`https://localhost:7132/api/Address/setdefault?id=${id}`, { method: 'PUT' });
        if (res.ok) LoadAddress(); 
        else alert("Cập nhật thất bại!");
      } catch (err) {
        console.error(err);
        alert("Lỗi xảy ra!");
      } finally {
        setLoading(false);
      }
    };

    const HandleAddAddress = async (e) => {
      e.preventDefault();
      if (loading) return; // tránh spam
      setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      navigate('/login');
      return;
    }
    
    const body = {
      AccountId: user.accountId,
      ReceiverFullName: newAddress.receiverFullName,
      ReceiverPhone: newAddress.receiverPhone,
      AddressLine: newAddress.addressLine,
      Ward: newAddress.ward,
      District: newAddress.district,
      Province: newAddress.province,
      IsDefault: newAddress.isDefault,
    };
    console.log('Gửi địa chỉ:', body);
    
    try {
      const res = await fetch(`https://localhost:7132/api/Address/add`, {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(body)
      });

        const data = await res.json();

        if (res.ok) {
          alert("Thêm địa chỉ thành công!");
          resetAddressForm();
          LoadAddress();
        } else {
          alert("Thêm thất bại: " + (data.message || JSON.stringify(data) || "Lỗi không rõ"));
        }
      } catch (err) {
        console.error(err);
        alert("Lỗi xảy ra, thử lại sau!");
      } finally {
        setLoading(false);
      }
    };

  const HandleExit = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMessage, setPasswordMessage] = useState(''); // Thông báo thành công
  const [passwordError, setPasswordError] = useState(''); // Thông báo lỗi

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const HandleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    // 1. Kiểm tra mật khẩu xác nhận
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('Mật khẩu mới và mật khẩu xác nhận không khớp.');
      return;
    }

    // 2. Lấy token
    const token = localStorage.getItem('token');
    if (!token) {
      setPasswordError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      return;
    }

    // 3. Gọi API đổi mật khẩu
    try {
      const res = await fetch('https://localhost:7132/api/Account/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          OldPassword: passwords.oldPassword,
          NewPassword: passwords.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordMessage('Đổi mật khẩu thành công!');
        setPasswordError('');

        // Xóa dữ liệu trong form
        setPasswords({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        // Hiển thị lỗi từ server (ví dụ: "Mật khẩu cũ không chính xác.")
        setPasswordError(data.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Lỗi đổi mật khẩu:', err);
      setPasswordError('Không thể kết nối đến máy chủ.');
    }
  };

  const HandleUpdateInfo = async (e) => {
    e.preventDefault();

    const accountData = JSON.parse(localStorage.getItem('account'));
  if (!formData.fullName.trim()) {
    alert("Họ tên không được để trống!");
    return;
  }

  if (!formData.gender) {
    alert("Vui lòng chọn giới tính!");
    return;
  }

  if (!formData.dateOfBirth) {
    alert("Vui lòng chọn ngày sinh!");
    return;
  }

  const d = new Date(formData.dateOfBirth);
  if (isNaN(d.getTime())) {
    alert("Ngày sinh không hợp lệ!");
    return;
  }

  const today = new Date();
  if (d > today) {
    alert("Ngày sinh không được lớn hơn hôm nay!");
    return;
  }

  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  if (age < 10) {
    alert("Bạn phải ít nhất 10 tuổi.");
    return;
  }

  const phoneRegex = /^(0[0-9]{9})$/;
  if (!phoneRegex.test(formData.phone)) {
    alert("Số điện thoại không hợp lệ! Phải 10 số và bắt đầu bằng 0.");
    return;
  }
  const token = localStorage.getItem('token');

  if (!token) {
    alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." + token);
    navigate('/login');
    return;
  }

    const body = {
      fullName: formData.fullName,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      phone: formData.phone,
    };

    // 4. Gọi API
    try {
      const res = await fetch(`https://localhost:7132/api/Account/update-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Gửi token để xác thực
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        // 5. CẬP NHẬT THÀNH CÔNG
        alert(data.message); // Hiển thị "Cập nhật thông tin thành công!"

        // Lấy token cũ, vì server không trả về token mới khi update info
        const updatedAccountData = { ...data.account, token: token };

        // Cập nhật lại 'account' trong localStorage
        localStorage.setItem('account', JSON.stringify(updatedAccountData));

        // Cập nhật state 'account' để component re-render
        // (Điều này sẽ tự động kích hoạt useEffect để cập nhật lại formData)
        setUser(updatedAccountData);

      } else {
        // 6. XỬ LÝ LỖI TỪ SERVER
        alert("Cập nhật thất bại: " + (data.message || "Lỗi không rõ"));
      }

    } catch (err) {
      // 7. XỬ LÝ LỖI MẠNG
      console.error("Lỗi cập nhật thông tin:", err);
      alert("Lỗi kết nối máy chủ. Vui lòng thử lại.");
    }
  };

const [cancelingOrderId, setCancelingOrderId] = useState(null);
const HandleCancelOrder = async (orderId) => {
  if (!window.confirm("Bạn có chắc muốn hủy đơn này?")) return;

  setCancelingOrderId(orderId);
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`https://localhost:7132/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (res.ok) {
      alert("Hủy đơn thành công!");
      LoadOrders(activeOrder);
    } else {
      alert("Hủy đơn thất bại: " + (data.message || "Lỗi không rõ"));
    }
  } catch (err) {
    console.error(err);
    alert("Lỗi kết nối máy chủ.");
  } finally {
    setCancelingOrderId(null);
  }
};

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }
    if (activeTab === 'order') LoadOrders();
    if (activeTab === 'address') LoadAddress();
  }, [activeTab, user.accountId, navigate]); 


  return (
    <div className='container'>
      <div className='row bg-pr'>
        <div className='col-12 col-sm-3 bg-menu'>
          <div className='bg-hi'>
            <img src='https://static-cse.canva.com/blob/2198173/1600w-vkBvE1d_xYA.jpg' alt='' />
            <h1>Xin chào</h1>
            <h2>{user.user?.fullName ?? 'Ẩn danh'}</h2>
          </div>
          {['info', 'order', 'address', 'password'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className='btn btn-dark'>
              {tab === 'info'
                ? 'Thông tin của tôi'
                : tab === 'order'
                  ? 'Đơn hàng của tôi'
                  : tab === 'password' ? 'Đổi mật khẩu' : 'Địa chỉ'}

            </button>
          ))}
          <button onClick={HandleExit} className='btn btn-dark'>Đăng xuất</button>
        </div>

        <div className='col-12 col-sm-9 bg-content'>
          {activeTab === 'info' && (
            <div className='bg-white text-dark p-3 p-md-4 rounded shadow-sm'>
              <h2 className="mb-4 fw-bold">Thông tin cá nhân</h2>

              <form onSubmit={HandleUpdateInfo}>
                <div className="mb-3">
                  <label htmlFor="fullName" className="form-label">Họ và tên</label>
                  <input
                    type="text"
                    className="form-control"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInfoChange}
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="gender" className="form-label">Giới tính</label>
                    <select
                      className="form-select"
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInfoChange}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Male">Nam</option>
                      <option value="Female">Nữ</option>
                      <option value="Other">Khác</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="dateOfBirth" className="form-label">Ngày sinh</label>
                    <input
                      type="date"
                      className="form-control"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInfoChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    disabled
                    style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                  />
                </div>

                {/* Phone */}
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Số điện thoại</label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInfoChange}
                  />
                </div>

                {/* Nút Submit */}
                <div className="mt-4">
                  <button
                    type="submit"
                    className="btn btn-dark w-100 py-2 fw-bold"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          )}
          {activeTab === 'order' && (
            <div className='d-flex flex-column'>
              <div className='menu-order'>
                {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(type => (
                  <button key={type} onClick={() => LoadOrders(type)} className='btn btn-dark'>
                    {type === 'all' ? 'Tất cả' :
                      type === 'pending' ? 'Đang chờ' :
                        type === 'confirmed' ? 'Đã xác nhận' :
                          type === 'shipped' ? 'Đang giao' :
                            type === 'delivered' ? 'Đã giao' : 'Đã hủy'}
                  </button>
                ))}
              </div>

              <div className='content-order p-3 flex-grow-1'>
                {orders.length === 0 ? (
                  <p>Không có đơn hàng nào.</p>
                ) : (() => {
                  const filtered = orders.filter(o => activeOrder === 'all' || o.status?.toLowerCase() === activeOrder);
                  const totalPages = Math.ceil(filtered.length / 3);
                  const current = filtered.slice((page - 1) * 3, page * 3);
                  if (!current.length) return <p>Không có đơn hàng ở trang này.</p>;
                  return (
                    <>
                      {current.map(o => (
                        <div key={o.orderId} className='order-card'>
                          <h4>Đơn #{o.orderId} - <b>{o.status}</b></h4>
                          <p><b>Ngày tạo:</b> {o.createdAt}</p>
                          <p><b>Tổng tiền:</b> {o.totalAmount?.toLocaleString()} đ</p>
                          {o.address && <p><b>Địa chỉ:</b> {o.address.addressLine}, {o.address.city}</p>}
                          <table className='table table-sm mt-3'>
                            <thead><tr><th>Sản phẩm</th><th>Số lượng</th><th>Đơn giá</th><th>Tổng</th></tr></thead>
                            <tbody>
                              {o.orderDetails.map(d => (
                                <tr key={d.orderDetailId}>
                                  <td>{d.productName}</td>
                                  <td>{d.quantity}</td>
                                  <td>{d.unitPrice?.toLocaleString()} đ</td>
                                  <td>{d.subTotal?.toLocaleString()} đ</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {o.status === 'Pending' && (
                            <button 
                              className='btn btn-dark' 
                              onClick={() => HandleCancelOrder(o.orderId)}
                            >
                              Hủy đơn
                            </button>
                          )}
                        </div>
                      ))}
                      <div className='d-flex justify-content-center gap-2 mt-3'>
                        <button className='btn btn-outline-dark' disabled={page === 1} onClick={() => setPage(p => p - 1)}>&lt; Trước</button>
                        <span>Trang {page} / {totalPages}</span>
                        <button className='btn btn-outline-dark' disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Sau &gt;</button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
          {activeTab === 'password' && (
            <div className="bg-white text-dark p-3 p-md-4 rounded shadow-sm" style={{ width: 500 }}>
              <h2 className="mb-4 fw-bold">Đổi mật khẩu</h2>

              <form onSubmit={HandleChangePassword}>
                {/* Thông báo thành công */}
                {passwordMessage && (
                  <div className="alert alert-success">{passwordMessage}</div>
                )}

                {/* Thông báo lỗi */}
                {passwordError && (
                  <div className="alert alert-danger">{passwordError}</div>
                )}

                {/* Mật khẩu cũ */}
                <div className="mb-3">
                  <label htmlFor="oldPassword" className="form-label">
                    Mật khẩu cũ
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="oldPassword"
                    name="oldPassword"
                    value={passwords.oldPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                {/* Mật khẩu mới */}
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="newPassword"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <div className="mt-4">
                  <button
                    type="submit"
                    className="btn btn-dark w-100 py-2 fw-bold"
                  >
                    Thay đổi mật khẩu
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'address' && (
            <div>
              {address.length === 0 ? (
                <p>Không có địa chỉ nào!</p>
              ) : (
                <div className='add-bg'>
                  {address.map(a => (
                    <div key={a.addressId} className='add-item'>
                      <b>{a.isDefault ? 'Mặc định' : ''}</b>
                      <p><strong>Người nhận:</strong> {a.receiverFullName}</p>
                      <p><strong>SĐT người nhận:</strong> {a.receiverPhone}</p>
                      <p><strong>Địa chỉ:</strong> {a.addressLine}, {a.ward}, {a.district}, {a.province}</p>

                      <div className='d-flex gap-2 justify-content-center'>
                        <button className='btn btn-danger' onClick={() => HandleDeleteAddress(a.addressId)}>Xóa</button>
                        {!a.isDefault && (
                          <button className='btn btn-success' onClick={() => HandleSetDefault(a.addressId)}>Đặt mặc định</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button className='btn btn-dark mt-3' onClick={() => setShowForm(true)}>Thêm địa chỉ</button>

              {showForm && (
                <form className='border p-3 rounded bg-light mt-3' onSubmit={HandleAddAddress}>
                  <h4>Thêm địa chỉ mới</h4>

                  {/* Nhóm Họ tên và SĐT */}
                  <div className="row g-2 mb-2">
                    <div className="col-md">
                      <input
                        className='form-control'
                        placeholder='Tên người nhận'
                        name="receiverFullName" // Thêm name
                        value={newAddress.receiverFullName}
                        onChange={handleNewAddressChange} // Dùng handler chung
                        required
                      />
                    </div>
                    <div className="col-md">
                      <input
                        className='form-control'
                        placeholder='Số điện thoại người nhận'
                        name="receiverPhone" // Thêm name
                        value={newAddress.receiverPhone}
                        onChange={handleNewAddressChange}
                        required
                        type="tel"
                      />
                    </div>
                  </div>

                  {/* Địa chỉ (Số nhà, tên đường) */}
                  <div className="mb-2">
                    <input
                      className='form-control'
                      placeholder='Địa chỉ (Số nhà, tên đường)'
                      name="addressLine" // Thêm name
                      value={newAddress.addressLine}
                      onChange={handleNewAddressChange}
                      required
                    />
                  </div>

                  {/* Nhóm Tỉnh / Huyện / Xã */}
                  <div className="row g-2 mb-2">
                    {/* Tỉnh/Thành phố */}
                    <div className="col-md">
                      <select
                        className="form-select" // Dùng class của Bootstrap
                        name="province" // Thêm name
                        value={newAddress.province}
                        onChange={handleNewAddressChange}
                        required
                      >
                        <option value="">Chọn Tỉnh / Thành phố</option>
                        {provinces.map(p => (
                          <option key={p.code} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Quận/Huyện */}
                    <div className="col-md">
                      <select
                        className="form-select"
                        name="district" // Thêm name
                        value={newAddress.district}
                        onChange={handleNewAddressChange}
                        required
                        disabled={availableDistricts.length === 0}
                      >
                        <option value="">Chọn Quận / Huyện</option>
                        {availableDistricts.map(d => (
                          <option key={d.code} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md">
                      <select
                        className="form-select"
                        name="ward"
                        value={newAddress.ward}
                        onChange={handleNewAddressChange}
                        required
                        disabled={availableWards.length === 0}
                      >
                        <option value="">Chọn Phường / Xã</option>
                        {availableWards.map(w => (
                          <option key={w.code} value={w.name}>{w.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className='form-check mb-2'>
                    <input
                      type='checkbox'
                      className='form-check-input'
                      name="isDefault"
                      checked={newAddress.isDefault}
                      onChange={handleNewAddressChange}
                      id='defaultAddressCheckbox'
                    />
                    <label className='form-check-label' htmlFor='defaultAddressCheckbox'>Đặt làm mặc định</label>
                  </div>

                  <div className='d-flex gap-2'>
                    <button type='submit' className='btn btn-success' onClick={HandleAddAddress}>Lưu</button>
                    <button type='button' className='btn btn-secondary' onClick={resetAddressForm}>
                      Hủy
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}