import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [activeOrder, setActiveOrder] = useState('all');
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [address, setAddress] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ addressLine: '', city: '', province: '', isDefault: false });
  const user = JSON.parse(localStorage.getItem('account')) || {};

  const LoadAddress = () => {
    fetch(`https://localhost:7132/api/Address/get?accountId=${user.accountId}`)
      .then(res => res.ok && res.json())
      .then(data => data && setAddress(data))
      .catch(console.error);
  };
  const LoadOrders = (type = 'all') => {
    setPage(1);
    setActiveOrder(type);
    fetch(`https://localhost:7132/api/Order/getall?accountId=${user.accountId}`)
      .then(res => res.ok && res.json())
      .then(data => data && setOrders(data))
      .catch(console.error);
  };
  const HandleDeleteAddress = async (id) => {
    if (!window.confirm("Xóa địa chỉ này?")) return;
    const res = await fetch(`https://localhost:7132/api/Address/delete?id=${id}`, { method: 'DELETE' });
    if (res.ok) LoadAddress(); else alert("Xóa thất bại!");
  };
  const HandleSetDefault = async  (id) => {
    const res = await fetch(`https://localhost:7132/api/Address/setdefault?id=${id}`, { method: 'PUT' });
    if (res.ok) LoadAddress(); else alert("Cập nhật thất bại!");
  };

const HandleAddAddress = async (e) => {
  e.preventDefault();

  // Đảm bảo key đúng kiểu PascalCase (tránh lowercase sai)
  const body = {
    AccountId: user.accountId,
    AddressLine: newAddress.addressLine,
    City: newAddress.city,
    Province: newAddress.province,
    IsDefault: newAddress.isDefault,
  };

  console.log('Gửi địa chỉ:', body);

  try {
    const res = await fetch(`https://localhost:7132/api/Address/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    console.log('Phản hồi server:', data);

    if (res.ok) {
      alert("Thêm địa chỉ thành công!");
      setShowForm(false);
      setNewAddress({ addressLine: '', city: '', province: '', isDefault: false });
      LoadAddress();
    } else {
      // Nên show lỗi chi tiết server trả về
      alert("Thêm thất bại: " + (data?.message || JSON.stringify(data) || "Lỗi không rõ"));
    }
  } catch (err) {
    console.error("Lỗi thêm địa chỉ:", err);
    alert("Lỗi xảy ra, thử lại sau!");
  }
};

  const HandleExit = () => {
    localStorage.clear();
    navigate('/login');
  };


  useEffect(() => {
    if (activeTab === 'order') LoadOrders();
    if (activeTab === 'address') LoadAddress();
  }, [activeTab]);

  return (
    <div className='container'>
      <div className='row bg-pr'>
        <div className='col-12 col-sm-3 bg-menu'>
          <div className='bg-hi'>
            <img src='https://static-cse.canva.com/blob/2198173/1600w-vkBvE1d_xYA.jpg' alt='' />
            <h1>Xin chào</h1>
            <h2>{user.user?.fullName ?? 'Ẩn danh'}</h2>
          </div>
          {['info', 'order', 'address'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className='btn btn-dark'>
              {tab === 'info' ? 'Thông tin của tôi' :
               tab === 'order' ? 'Đơn hàng của tôi' : 'Sổ địa chỉ'}
            </button>
          ))}
          <button onClick={HandleExit} className='btn btn-dark'>Đăng xuất</button>
        </div>

        <div className='col-12 col-sm-9 bg-content'>

          {activeTab === 'info' && (
            <div className='bg-inf'>
              <h2>{'Full name: ' + user.user?.fullName}</h2>
              <h2>{'Sex: ' + user.user?.gender}</h2>
              <h2>{'Date of birth: ' + user.user?.dateOfBirth}</h2>
              <h2>{'Email: ' + user.email}</h2>
              <h2>{'Phone: ' + user.phone}</h2>
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
          {activeTab === 'address' && (
            <div>
              {address.length === 0 ? <p>Không có địa chỉ nào!</p> : (
                <div className='add-bg'>
                  {address.map(a => (
                    <div key={a.addressId} className='add-item'>
                      <b>{a.isDefault ? 'Mặc định' : ''}</b>
                      <p>{a.addressLine}, {a.province}, {a.city}</p>
                      <div className='d-flex gap-2 justify-content-center'>
                        <button className='btn btn-danger' onClick={() => HandleDeleteAddress(a.addressId)}>Xóa</button>
                        <button className='btn btn-success' onClick={() => HandleSetDefault(a.addressId)}>Đặt mặc định</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button className='btn btn-primary mt-3' onClick={() => setShowForm(true)}>Thêm địa chỉ</button>

              {showForm && (
                <form className='border p-3 rounded bg-light mt-3' onSubmit={HandleAddAddress}>
                  <input className='form-control mb-2' placeholder='Địa chỉ' value={newAddress.addressLine}
                    onChange={e => setNewAddress({ ...newAddress, addressLine: e.target.value })} required />
                  <input className='form-control mb-2' placeholder='Tỉnh/Thành phố' value={newAddress.province}
                    onChange={e => setNewAddress({ ...newAddress, province: e.target.value })} required />
                  <input className='form-control mb-2' placeholder='Quận/Huyện' value={newAddress.city}
                    onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                  <div className='form-check mb-2'>
                    <input type='checkbox' className='form-check-input'
                      checked={newAddress.isDefault}
                      onChange={e => setNewAddress({ ...newAddress, isDefault: e.target.checked })} />
                    <label className='form-check-label'>Đặt làm mặc định</label>
                  </div>
                  <div className='d-flex gap-2'>
                    <button type='submit' className='btn btn-success'>Lưu</button>
                    <button type='button' className='btn btn-secondary' onClick={() => setShowForm(false)}>Hủy</button>
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
