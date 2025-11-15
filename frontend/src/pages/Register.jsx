import React, { useState } from 'react';
import { toast } from 'sonner';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [number, setNumber] = useState('');
  const [email, setEmail] = useState('');
  const [birth, setBirth] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [error, setError] = useState('');

  const isValidPhone = (phone) => /^0\d{9,11}$/.test(phone);
  const isValidDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    if (isNaN(date)) return false;

    const minBirth = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
    return date <= minBirth;
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
      e.preventDefault();

      if (loading) return toast.warning('Đang load dữ liệu!');
      setLoading(true);

      if (!isValidPhone(number)) {
        setError('Số điện thoại phải là 10-12 chữ số, bắt đầu từ 0.');
        setLoading(false);
        return;
      }

      if (!isValidDate(birth)) {
        setError('Ngày sinh không hợp lệ hoặc bạn chưa đủ 10 tuổi.');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự.');
        setLoading(false);
        return;
      }

      if (password !== passwordAgain) {
        setError('Mật khẩu nhập lại không khớp!');
        setLoading(false);
        return;
      }

      if (!email || !email.includes('@')) {
        setError('Email phải chứa ký tự @ và không được để trống.');
        setLoading(false);
        return;
      }

      if (!gender) {
        setError('Vui lòng chọn giới tính.');
        setLoading(false);
        return;
      }

      setError('');

      const data = {
        username: number,
        password,
        email,
        phone: number,
        fullName,
        gender,
        dateOfBirth: birth,
      };

      try {
        const res = await fetch('https://localhost:7132/api/account/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!res.ok) {
          const errData = await res.json();
          setError(errData.message || 'Đăng ký thất bại');
          return;
        }

        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
        window.location.href = '/login';

      } catch (err) {
        setError('Lỗi kết nối server!');
      } finally {
        setLoading(false);
      }
  };


  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h3 className="text-center mb-4">Đăng ký tài khoản</h3>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label>Họ và tên</label>
            <input
              className="form-control"
              placeholder="Nhập họ và tên"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              minLength={3}
              maxLength={150}
            />
          </div>

          <div className="mb-3">
            <label>Số điện thoại (Username)</label>
            <input
              className="form-control"
              placeholder="Nhập số điện thoại (10-12 số)"
              value={number}
              onChange={e => setNumber(e.target.value)}
              required
              pattern="\d{10,12}"
              title="Số điện thoại phải là 10 đến 12 chữ số"
            />
          </div>

          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Nhập email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              maxLength={150}
            />
          </div>

          <div className="mb-3">
            <label>Ngày sinh</label>
            <input
              type="date"
              className="form-control"
              value={birth}
              onChange={e => setBirth(e.target.value)}
              required
              max={new Date().toISOString().split('T')[0]} // ko chọn ngày trong tương lai
            />
          </div>

          <div className="mb-3">
            <label>Giới tính</label>
            <select
              className="form-control"
              value={gender}
              onChange={e => setGender(e.target.value)}
              required
            >
              <option value="">-- Chọn giới tính --</option>
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
              <option value="Other">Khác</option>
            </select>
          </div>

          <div className="mb-3">
            <label>Mật khẩu</label>
            <input
              type="password"
              className="form-control"
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="mb-3">
            <label>Nhập lại mật khẩu</label>
            <input
              type="password"
              className="form-control"
              placeholder="Nhập lại mật khẩu"
              value={passwordAgain}
              onChange={e => setPasswordAgain(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-danger">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary bg-black border-0 w-100 rounded-0"
            style={{ height: 50, marginTop: 20 }}
          >
            Đăng ký
          </button>
          <a href='/login' className='text-decoration-none text-black'>
            <span style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
              Đã có tài khoản, quay về đăng nhập.
            </span>
          </a>
        </form>
      </div>
    </div>
  );
}
