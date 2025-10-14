import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Register(){
  const [form, setForm] = useState({username:'', password:'', email:''});
  const { register } = useContext(AuthContext);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try{
      await register(form);
      alert('Registered. Please login.');
      nav('/login');
    }catch(err){
      alert('Register failed');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h3>Register</h3>
        <form onSubmit={submit}>
          <div className="mb-3">
            <label>Username</label>
            <input className="form-control" value={form.username} onChange={e=>setForm({...form, username:e.target.value})} />
          </div>
          <div className="mb-3">
            <label>Email</label>
            <input className="form-control" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
          </div>
          <div className="mb-3">
            <label>Password</label>
            <input type="password" className="form-control" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
          </div>
          <button className="btn btn-primary">Register</button>
        </form>
      </div>
    </div>
  );
}
