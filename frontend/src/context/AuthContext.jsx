import React, { createContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('skynet_token') || null);

  useEffect(() => {
    if(token){
      // optional: call /auth/me to fetch user
      authApi.me().then(res => setUser(res.data)).catch(()=>{});
    }
  }, [token]);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const tok = res.data.token;
    localStorage.setItem('skynet_token', tok);
    setToken(tok);
    const me = await authApi.me();
    setUser(me.data);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('skynet_token');
    setToken(null);
    setUser(null);
  };

  const register = async (data) => {
    return authApi.register(data);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
