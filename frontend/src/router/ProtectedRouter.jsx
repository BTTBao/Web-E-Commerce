import React from "react";
import { jwtDecode } from 'jwt-decode'; // (Giữ nguyên import đúng)

// Đây là tên claim "role" mà backend của bạn đang dùng
const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

const ProtectedRouter = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
    return null; 
  }

  try {
    const decoded = jwtDecode(token);
    
    const roleClaim = decoded[ROLE_CLAIM];
    const userRole = parseInt(roleClaim, 10);
    console.log(userRole);
    if (requiredRole !== undefined && (isNaN(userRole) || userRole < requiredRole)) {
      window.location.href = "/";
      return null;
    }

  } catch (err) {
    alert('lỗi');
    localStorage.removeItem("token");
    localStorage.removeItem("account");
    window.location.href = "/login";
    return null; 
  }
  return <>{children}</>;
};

export default ProtectedRouter;