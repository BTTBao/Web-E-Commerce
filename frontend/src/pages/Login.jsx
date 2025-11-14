import React, { useState, useEffect, } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';



export default function Login(){

  const [userName, setUser] = useState('');
  const [passWord, setPass] = useState('');
  const {onLogin} = useCart();
  const navigate = useNavigate();
  const location = useLocation();


  const HandleLogin = () => {
    const from = location.state?.from || "/";
    const loginData = {
      Email: userName,
      Password: passWord
    };

    fetch(`https://localhost:7132/api/Account/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    })
    .then(res => {
      if (!res.ok) {
        alert('sai mật khẩu hoặc user');
        throw new Error('sai mật khẩu/user');
      } else {
        return res.json();
      }

    }).then(data =>{
      localStorage.setItem('token', data.token);
      localStorage.setItem('account', JSON.stringify(data.account));
      onLogin(data.account.accountId);
      navigate(from);
    })
    .catch(error => {
      console.log(error);
    });
  }
  
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
        </form>
      </div>
    </div>
  );
}
