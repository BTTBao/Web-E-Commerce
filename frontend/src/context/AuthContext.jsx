import React, { createContext, useState, useEffect } from 'react';
import authApi from '../api/authApi'; // Giả định hook này tồn tại

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    
    // 1. Tải token từ Local Storage
    const initialToken = localStorage.getItem('token') || null;

    // 2. Tải user và phân tích cú pháp (parse) JSON NGAY LÚC KHỞI TẠO
    const initialUserJson = localStorage.getItem('user');
    let initialUser = null;

    try {
        if (initialUserJson) {
            initialUser = JSON.parse(initialUserJson);
        }
    } catch (e) {
        // Log lỗi nếu JSON bị hỏng, nhưng vẫn để initialUser là null
        console.error("Lỗi: Không thể phân tích cú pháp user JSON từ Local Storage", e);
    }

    const [user, setUser] = useState(initialUser); // Dùng user đã được parse
    const [token, setToken] = useState(initialToken); // Dùng token đã được tải

    // Effect này để kiểm tra tính hợp lệ của token/tải lại user nếu cần thiết,
    // nhưng không còn là nguồn tải user chính nữa.
    useEffect(() => {
        // Chỉ chạy nếu có token nhưng chưa có user (ví dụ: user bị xóa khỏi LocalStorage)
        if (token && !user) {
            authApi.me()
                .then(res => setUser(res.data))
                .catch(() => {
                    // Nếu gọi /me thất bại, token có thể hết hạn hoặc không hợp lệ -> Đăng xuất
                    logout();
                });
        }
    }, [token]);

    const login = async (credentials) => {
        const res = await authApi.login(credentials);
        const tok = res.data.token;
        const userData = res.data.account; // Giả định API trả về account trong data

        // BẮT BUỘC: Lưu token và user vào Local Storage
        localStorage.setItem('token', tok);
        localStorage.setItem('user', JSON.stringify(userData)); // <-- LƯU USER DƯỚI DẠNG CHUỖI JSON

        setToken(tok);
        setUser(userData); // <-- Cập nhật state user

        return res;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user'); // <-- XÓA CẢ USER KHI ĐĂNG XUẤT
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