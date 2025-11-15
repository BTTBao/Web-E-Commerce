import React, { useState, useEffect, } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';


export default function Login(){

  const [userName, setUser] = useState('');
  const [passWord, setPass] = useState('');
  const {onLogin} = useCart();
  const navigate = useNavigate();
  const location = useLocation();


  const [loading, setLoading] = useState(false);

  const HandleLogin = async () => {
      if (loading) return toast.warning('Đang load dữ liệu');
      setLoading(true);

      const from = location.state?.from || "/";
      const loginData = {
        Email: userName,
        Password: passWord
      };

      try {
          const res = await fetch('https://localhost:7132/api/Account/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(loginData)
          });

          if (!res.ok) {
              toast.error('Sai mật khẩu hoặc user');
              return;
          }

          const data = await res.json();

          if(!data.account.isActive){
              toast.error('Tài khoản chưa được xác thực, vui lòng vào email để xác thực!!');
              return;
          }

          localStorage.setItem('token', data.token);
          localStorage.setItem('account', JSON.stringify(data.account));

          if (data.account.role === '1') {
              window.location.href = '/admin';
              return;
          }

          onLogin(data.account.accountId);
          navigate(from);

      } catch(err) {
          console.log(err);
          toast.error('Có lỗi xảy ra khi đăng nhập');
      } finally {
          setLoading(false);
      }
  };
  const [loadingForgot, setLoadingForgot] = useState(false);

  const HandleForgotPassword = async () => {
      if (loadingForgot) return toast.success("Đang xử lý...");

      if (!userName.trim()) {
          return toast.error("Vui lòng nhập email để khôi phục!");
      }

      setLoadingForgot(true);

      try {
          const res = await fetch("https://localhost:7132/api/Account/forgot-password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(userName)
          });

          const data = await res.json();

          if (!res.ok) {
              toast.error(data.message || "Không tìm thấy email!");
              return;
          }

          toast.success("Đã gửi mail reset mật khẩu! Vui lòng kiểm tra hộp thư.");

      } catch (err) {
          console.error(err);
          toast.error("Lỗi khi gửi yêu cầu khôi phục mật khẩu.");
      } finally {
          setLoadingForgot(false);
      }
  };
  return (
    <div className="row justify-content-center">
      <div className="col-md-4">
        <h3 className='text-center'>Login</h3>
        <form>
          <div className="mb-3">
            <label>Username</label>
            <input className="form-control" value={userName} onChange={e => {setUser(e.target.value)}}/>
          </div>
          <div className="mb-3">
            <label>Password</label>
            <input type="password" className="form-control" value={passWord}  onChange={e => {setPass(e.target.value)}}/>
          </div>
          <a className='text-decoration-none text-black' href='https://www.facebook.com/pham.thuan.954331'><span>Quên thông tin tài khoản?</span></a>
          <button className="btn btn-primary bg-black border-0 w-100 rounded-0"
            style={{height:50, marginTop:20}} onClick={e =>{e.preventDefault();HandleLogin();}}>Login</button>
          <a href='/register' className='text-decoration-none text-black'><span style={{marginTop:20, display:'flex', justifyContent:'center'}}>Bạn chưa có tài khoản? Đăng ký ngay!</span></a>
          <a href="#" className='text-decoration-none text-black' onClick={e => { 
              e.preventDefault();
              if (userName) {
                  HandleForgotPassword();
              }else toast.error('Nhập email để reset password!');
          }}><span style={{marginTop:20, display:'flex', justifyContent:'center'}}>
              Quên mật khẩu?
              </span>
          </a>
        </form>
      </div>
    </div>
  );
}
