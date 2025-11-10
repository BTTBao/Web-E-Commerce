// src/pages/Admin/ChatSupport.jsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, X, MessageSquare } from 'lucide-react';
import { HubConnectionBuilder } from '@microsoft/signalr'; // <-- 1. Import SignalR

// Import CSS
import './Orders.css';
import './ChatSupport.css';

// --- 2. Cấu hình URL Backend ---
// (Hãy đảm bảo port 5001 là port bạn thấy,
// hoặc đổi thành port trong launchSettings.json, ví dụ: https://localhost:7123)
const API_URL = 'https://localhost:7132/api/chat';
const HUB_URL = 'https://localhost:7132/chathub';


export default function ChatSupport() {
    // --- 3. State Mới (thay thế mock data) ---
    const [rooms, setRooms] = useState([]); // State cho danh sách phòng
    const [messages, setMessages] = useState({}); // State cho tin nhắn { 'CR1': [...], 'CR2': [...] }
    const [hubConnection, setHubConnection] = useState(null); // State cho kết nối SignalR

    const [selectedRoom, setSelectedRoom] = useState(null); // Bắt đầu rỗng
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef(null);

    // --- 4. Dùng State Mới ---
    const activeRooms = useMemo(() => rooms.filter((room) => !room.isClosed), [rooms]);

    const currentMessages = useMemo(() => {
        return selectedRoom ? messages[selectedRoom] || [] : [];
    }, [selectedRoom, messages]);

    const currentRoom = useMemo(() => {
        return rooms.find((room) => room.id === selectedRoom);
    }, [rooms, selectedRoom]);

    // Tự động cuộn xuống cuối (Giữ nguyên)
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentMessages]);


    // --- 5. [EFFECT] Kết nối SignalR khi component mount ---
    useEffect(() => {
        // Xây dựng kết nối
        const connection = new HubConnectionBuilder()
            .withUrl(HUB_URL, {
                // Thêm option này nếu bạn dùng http và React (localhost:5173) khác port với API (localhost:5001)
                skipNegotiation: true,
                transport: 1 // HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

        // Lắng nghe tin nhắn mới từ server
        connection.on('ReceiveMessage', (newMessageDto) => {
            console.log('New message received:', newMessageDto);

            // Cập nhật state tin nhắn
            setMessages(prevMessages => {
                const roomMessages = prevMessages[newMessageDto.roomId] || [];
                // Tránh trùng lặp tin nhắn (nếu có)
                if (roomMessages.find(m => m.id === newMessageDto.id)) {
                    return prevMessages;
                }
                return {
                    ...prevMessages,
                    [newMessageDto.roomId]: [...roomMessages, newMessageDto]
                };
            });

            // Cập nhật tin nhắn cuối cùng trên danh sách phòng
            setRooms(prevRooms => prevRooms.map(room =>
                room.id === newMessageDto.roomId
                    ? { ...room, lastMessage: newMessageDto.message, lastMessageTime: newMessageDto.timestamp }
                    : room
            ));
        });

        // Bắt đầu kết nối
        connection.start()
            .then(() => {
                console.log('SignalR Connected!');
                setHubConnection(connection); // Lưu kết nối vào state
            })
            .catch(e => console.error('SignalR Connection Error: ', e));

        // Dọn dẹp khi component unmount
        return () => {
            connection.stop();
        };
    }, []); // Chỉ chạy 1 lần

    // --- 6. [EFFECT] Lấy danh sách phòng chat từ API ---
    useEffect(() => {
        fetch(`${API_URL}/rooms`)
            .then(res => res.json())
            .then(data => {
                setRooms(data);
                // Tự động chọn phòng đầu tiên nếu có
                if (data.length > 0) {
                    setSelectedRoom(data[0].id);
                }
            })
            .catch(e => console.error("Failed to fetch rooms:", e));
    }, []); // Chỉ chạy 1 lần khi load

    // --- 7. [EFFECT] Lấy tin nhắn khi đổi phòng ---
    useEffect(() => {
        // Chỉ chạy khi đã có kết nối VÀ đã chọn phòng
        if (!selectedRoom || !hubConnection) return;

        // Tham gia "nhóm" SignalR của phòng này
        hubConnection.invoke('JoinRoom', selectedRoom)
            .catch(err => console.error(`Failed to join room ${selectedRoom}: `, err));

        // Nếu đã có tin nhắn thì không fetch lại (trừ khi muốn refresh)
        if (messages[selectedRoom]) {
            return;
        }

        // Nếu chưa có, fetch tin nhắn cũ từ API
        fetch(`${API_URL}/rooms/${selectedRoom}/messages`)
            .then(res => res.json())
            .then(data => {
                // Lưu tin nhắn vào state
                setMessages(prev => ({
                    ...prev,
                    [selectedRoom]: data
                }));
            })
            .catch(e => console.error("Failed to fetch messages:", e));

    }, [selectedRoom, hubConnection, messages]); // Chạy khi đổi phòng hoặc khi kết nối hub


    // --- 8. [HÀM] Gửi tin nhắn (POST lên API) ---
    const handleSendMessage = async () => {
        if (!message.trim() || !selectedRoom) return;

        const now = new Date();

        const requestBody = {
            roomId: selectedRoom,
            senderId: 1, // hoặc lấy từ session, userId, v.v.
            senderName: "Admin", // hoặc tên người dùng hiện tại
            isAdmin: true, // tuỳ bạn gán
            message: message.trim(),
            timestamp: now.toISOString()
        };

        try {
            const response = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const err = await response.text();
                console.error("Server error:", err);
                throw new Error('Failed to send message');
            }

            setMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };



    const handleCloseChat = () => {
        if (!selectedRoom) return;
        // TODO: Gọi API để đóng chat
        // (Ví dụ: fetch(`${API_URL}/rooms/${selectedRoom}/close`, { method: 'POST' }) )

        console.log('Closing chat room:', selectedRoom);

        // Cập nhật UI (tạm thời)
        setRooms(prevRooms => prevRooms.map(r =>
            r.id === selectedRoom ? { ...r, isClosed: true } : r
        ));
        setSelectedRoom(null); // Bỏ chọn phòng sau khi đóng
    };

    // --- 9. JSX (Return) ---
    // (Phần JSX gần như giữ nguyên, chỉ sửa 1 chỗ)
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
                                                    {room.customerName?.charAt(0)}
                                                </div>
                                                {room.unread && <div className="unread-dot" />}
                                            </div>
                                            <div className="room-details">
                                                <div className="room-details-header">
                                                    <span className="customer-name">{room.customerName}</span>
                                                    {/* Sửa lại cho an toàn (vì time có thể là "") */}
                                                    <span className="last-time">{room.lastMessageTime?.split(' ')[1] ?? ''}</span>
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
                                        {currentRoom.customerName?.charAt(0)}
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