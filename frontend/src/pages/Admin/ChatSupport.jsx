// src/pages/Admin/ChatSupport.jsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, X, MessageSquare } from 'lucide-react';

// Import CSS (Cần cả file CSS chung và file riêng)
import './Orders.css'; // Hoặc file CSS chung chứa .card, .badge...
import './ChatSupport.css';

// Dữ liệu mẫu (giữ nguyên)
const chatRooms = [
    { id: 'CR001', customerId: 'U001', customerName: 'Nguyễn Văn A', lastMessage: 'Cho em hỏi về sản phẩm iPhone 15 Pro Max', lastMessageTime: '2025-10-25 14:30', unread: true, isClosed: false },
    { id: 'CR002', customerId: 'U002', customerName: 'Trần Thị B', lastMessage: 'Em cảm ơn shop nhiều ạ!', lastMessageTime: '2025-10-25 13:15', unread: false, isClosed: false },
    { id: 'CR003', customerId: 'U003', customerName: 'Lê Văn C', lastMessage: 'Khi nào shop có hàng thì báo em nhé', lastMessageTime: '2025-10-25 11:20', unread: true, isClosed: false },
    { id: 'CR004', customerId: 'U004', customerName: 'Phạm Thị D', lastMessage: 'Đơn hàng của em đến đâu rồi ạ?', lastMessageTime: '2025-10-24 16:45', unread: false, isClosed: false },
];

const chatMessages = {
    CR001: [
        { id: 1, roomId: 'CR001', senderId: 'U001', senderName: 'Nguyễn Văn A', isAdmin: false, message: 'Xin chào shop!', timestamp: '2025-10-25 14:25' },
        { id: 2, roomId: 'CR001', senderId: 'ADMIN', senderName: 'Admin', isAdmin: true, message: 'Chào bạn! Shop có thể giúp gì cho bạn?', timestamp: '2025-10-25 14:26' },
        { id: 3, roomId: 'CR001', senderId: 'U001', senderName: 'Nguyễn Văn A', isAdmin: false, message: 'Cho em hỏi về sản phẩm iPhone 15 Pro Max', timestamp: '2025-10-25 14:30' },
    ],
    CR002: [
        { id: 1, roomId: 'CR002', senderId: 'U002', senderName: 'Trần Thị B', isAdmin: false, message: 'Shop ơi, em muốn đổi địa chỉ giao hàng', timestamp: '2025-10-25 13:10' },
        { id: 2, roomId: 'CR002', senderId: 'ADMIN', senderName: 'Admin', isAdmin: true, message: 'Dạ, bạn gửi địa chỉ mới cho shop nhé', timestamp: '2025-10-25 13:12' },
        { id: 3, roomId: 'CR002', senderId: 'U002', senderName: 'Trần Thị B', isAdmin: false, message: '789 Trần Hưng Đạo, Quận 5, TP.HCM', timestamp: '2025-10-25 13:13' },
        { id: 4, roomId: 'CR002', senderId: 'ADMIN', senderName: 'Admin', isAdmin: true, message: 'Đã cập nhật địa chỉ mới cho bạn. Cảm ơn bạn!', timestamp: '2025-10-25 13:14' },
        { id: 5, roomId: 'CR002', senderId: 'U002', senderName: 'Trần Thị B', isAdmin: false, message: 'Em cảm ơn shop nhiều ạ!', timestamp: '2025-10-25 13:15' },
    ],
    // Thêm data cho CR003, CR004 nếu cần
    CR003: [],
    CR004: [],
};


export default function ChatSupport() {
    const [selectedRoom, setSelectedRoom] = useState('CR001');
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef(null); // Ref để cuộn xuống cuối

    const activeRooms = chatRooms.filter((room) => !room.isClosed);
    // Calculate currentMessages only when selectedRoom changes
    const currentMessages = useMemo(() => {
        return selectedRoom ? chatMessages[selectedRoom] || [] : [];
    }, [selectedRoom]); // <-- Dependency: only recalculate if selectedRoom changes
    const currentRoom = chatRooms.find((room) => room.id === selectedRoom);

    // Tự động cuộn xuống cuối khi có tin nhắn mới hoặc đổi phòng
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentMessages, selectedRoom]);


    const handleSendMessage = () => {
        if (!message.trim() || !selectedRoom) return;

        // Logic gửi tin nhắn (thêm vào state hoặc gửi lên server)
        const newMessage = {
            id: Date.now(), // ID tạm thời
            roomId: selectedRoom,
            senderId: 'ADMIN',
            senderName: 'Admin',
            isAdmin: true,
            message: message.trim(),
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };

        // Cập nhật state (đây là cách làm đơn giản, thực tế cần phức tạp hơn)
        if (chatMessages[selectedRoom]) {
            chatMessages[selectedRoom].push(newMessage);
        } else {
            chatMessages[selectedRoom] = [newMessage];
        }
        // Cập nhật giao diện (ép re-render bằng cách tạo object mới)
        setSelectedRoom(selectedRoom); // Trick nhỏ để re-render

        console.log('Sending message:', message);
        setMessage('');
    };

    const handleCloseChat = () => {
        if (!selectedRoom) return;
        // Logic đóng chat (cập nhật state hoặc gửi lên server)
        console.log('Closing chat room:', selectedRoom);
        // Ví dụ: cập nhật isClosed và bỏ chọn phòng
        const roomIndex = chatRooms.findIndex(r => r.id === selectedRoom);
        if (roomIndex !== -1) {
            chatRooms[roomIndex].isClosed = true;
        }
        setSelectedRoom(null); // Bỏ chọn phòng sau khi đóng
    };

    return (
        <div className="chat-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Hỗ trợ Trực tuyến</h1>
                    <p className="page-subtitle">Quản lý và trả lời tin nhắn từ khách hàng</p>
                </div>
                <span className="badge badge-green-solid">
                    {activeRooms.filter(r => r.unread).length} tin nhắn mới
                </span>
            </div>

            <div className="chat-layout">
                {/* Cột Danh sách phòng chat */}
                <div className="card room-list-card">
                    <div className="card-header room-list-header">
                        <h3 className="card-title room-list-title">
                            <span>Phòng chat</span>
                            <span className="badge room-count-badge">
                                {activeRooms.length}
                            </span>
                        </h3>
                    </div>
                    <div className="card-content room-list-content">
                        <div className="scroll-area">
                            <div className="room-items">
                                {activeRooms.map((room) => (
                                    <button
                                        key={room.id}
                                        onClick={() => setSelectedRoom(room.id)}
                                        className={`room-item ${selectedRoom === room.id ? 'active' : ''}`}
                                    >
                                        <div className="room-item-inner">
                                            <div className="avatar-wrapper">
                                                <div className="avatar">
                                                    {room.customerName.charAt(0)}
                                                </div>
                                                {room.unread && <div className="unread-dot" />}
                                            </div>
                                            <div className="room-details">
                                                <div className="room-details-header">
                                                    <span className="customer-name">{room.customerName}</span>
                                                    <span className="last-time">{room.lastMessageTime.split(' ')[1]}</span>
                                                </div>
                                                <p className={`last-message ${room.unread ? 'unread' : ''}`}>
                                                    {room.lastMessage}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cột Cửa sổ chat */}
                <div className="card chat-window-card">
                    {selectedRoom && currentRoom ? (
                        <>
                            <div className="card-header chat-window-header">
                                <div className="chat-header-info">
                                    <div className="avatar avatar-large">
                                        {currentRoom.customerName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="card-title customer-chat-name">{currentRoom.customerName}</h3>
                                        <div className="status-indicator">
                                            <div className="status-dot active" />
                                            <p className="status-text">
                                                {currentRoom.isClosed ? 'Đã đóng' : 'Đang hoạt động'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <button className="button-secondary button-sm close-chat-button" onClick={handleCloseChat}>
                                    <X width={16} height={16} />
                                    Đóng chat
                                </button>
                            </div>

                            <div className="card-content chat-window-content">
                                {/* Khu vực tin nhắn */}
                                <div className="scroll-area messages-area">
                                    <div className="message-list">
                                        {currentMessages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`message-bubble-wrapper ${msg.isAdmin ? 'admin' : 'customer'}`}
                                            >
                                                <div className={`message-bubble ${msg.isAdmin ? 'admin' : 'customer'}`}>
                                                    <p className="message-text">{msg.message}</p>
                                                    <p className="message-timestamp">{msg.timestamp}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {/* Element trống để cuộn xuống */}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>

                                {/* Khu vực nhập tin nhắn */}
                                <div className="message-input-area">
                                    <input
                                        type="text"
                                        placeholder="Nhập tin nhắn của bạn..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') handleSendMessage();
                                        }}
                                        className="message-input"
                                    />
                                    <button onClick={handleSendMessage} className="button-primary send-button">
                                        <Send width={16} height={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        // Giao diện khi chưa chọn phòng
                        <div className="card-content no-room-selected">
                            <div className="no-room-icon-wrapper">
                                <MessageSquare width={40} height={40} />
                            </div>
                            <h3 className="no-room-title">Chưa chọn phòng chat</h3>
                            <p className="no-room-text">Chọn một phòng chat từ danh sách bên trái để bắt đầu trò chuyện</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}