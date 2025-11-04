import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try{
      await login({ username, password });
      nav('/');
    }catch(err){
      alert('Login failed');
    }
  };
  
  return (
    <div className="row justify-content-center">
      <div className="col-md-4">
        <h3>Login</h3>
        <form onSubmit={submit}>
          <div className="mb-3">
            <label>Username</label>
            <input className="form-control" value={username} onChange={e=>setUsername(e.target.value)} />
          </div>
          <div className="mb-3">
            <label>Password</label>
            <input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary">Login</button>
        </form>
      </div>
    </div>
  );
}
