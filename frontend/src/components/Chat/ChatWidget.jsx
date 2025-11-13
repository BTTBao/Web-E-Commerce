import React, { useState, useEffect, useRef } from 'react';
// Import icons (bạn cần cài 'lucide-react')
import { MessageSquare, Send, X, ArrowDown } from 'lucide-react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import './ChatWidget.css'; // File CSS sẽ tạo ở bước 2

// Cập nhật URL này cho đúng
const API_URL = 'https://localhost:7132/api/chat';
const HUB_URL = 'https://localhost:7132/chathub';

// Component này nhận thông tin user và token sau khi họ đăng nhập
export default function ChatWidget({ token, currentUser }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [hubConnection, setHubConnection] = useState(null);
    const [roomId, setRoomId] = useState(null); // ID phòng chat (ví dụ: CR1)
    const messagesEndRef = useRef(null);

    // Tự cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    // --- EFFECT 1: Kết nối SignalR (Một lần) ---
    useEffect(() => {
        if (!token) return; // Chỉ kết nối khi có token

        // Kết nối dùng token để xác thực (nếu Hub của bạn yêu cầu)
        const connection = new HubConnectionBuilder()
            .withUrl(HUB_URL, {
                // Gửi token để Hub có thể xác thực user
                accessTokenFactory: () => token 
            })
            .withAutomaticReconnect()
            .build();

        // Lắng nghe tin nhắn từ Admin
        connection.on('ReceiveMessage', (newMessage) => {
            // Chỉ thêm tin nhắn nếu nó là của phòng này
            setMessages(prev => [...prev, newMessage]);
        });

        connection.start()
            .then(() => {
                console.log('Chat Widget SignalR Connected!');
                setHubConnection(connection);
            })
            .catch(e => console.error('Chat Widget Connection Error: ', e));

        return () => {
            connection.stop();
        };
    }, [token]); // Chỉ chạy lại khi token thay đổi

    // --- EFFECT 2: Lấy/Tạo phòng và tải lịch sử chat ---
    useEffect(() => {
        // Cần có Hub, ID user, và token
        if (!hubConnection || !currentUser?.accountId || !token) return;

        // Hàm async tự gọi bên trong effect
        const setupChat = async () => {
            try {
                // 1. Gọi API (POST /api/chat/rooms) để lấy/tạo phòng cho user này
                // API này bạn đã có (CreateRoom)
                const roomResponse = await fetch(`${API_URL}/rooms`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Gửi token
                    },
                    body: JSON.stringify({ customerId: currentUser.accountId })
                });

                if (!roomResponse.ok) throw new Error('Failed to get or create chat room');

                const roomData = await roomResponse.json();
                const userRoomId = roomData.roomId; // Ví dụ: "CR4"
                setRoomId(userRoomId);

                // 2. Join group SignalR
                await hubConnection.invoke('JoinRoom', userRoomId);

                // 3. Tải lịch sử tin nhắn
                const messagesResponse = await fetch(`${API_URL}/rooms/${userRoomId}/messages`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!messagesResponse.ok) throw new Error('Failed to fetch messages');
                
                const history = await messagesResponse.json();
                setMessages(history);

            } catch (error) {
                console.error("Error setting up chat:", error);
            }
        };

        setupChat();

    }, [hubConnection, currentUser, token]); // Chạy khi có kết nối VÀ có thông tin user


    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || !roomId || !hubConnection) return;

        // Vì API (SendMessage) của bạn dùng [FromForm], chúng ta phải gửi FormData
        const tempId = `temp_${Date.now()}`;
        
        // 1. Dữ liệu tin nhắn tạm (cho Optimistic Update)
        const optimisticMessage = {
            id: tempId,
            roomId: roomId,
            senderId: currentUser.accountId,
            senderName: currentUser.fullName || currentUser.phone,
            isAdmin: false, // User không phải admin
            message: message.trim(),
            timestamp: new Date().toISOString(),
            isOptimistic: true // Đánh dấu tin nhắn tạm
        };

        // 2. Thêm tin nhắn tạm vào UI ngay lập tức
        setMessages(prev => [...prev, optimisticMessage]);
        setMessage(''); // Xóa ô input

        // 3. Chuẩn bị FormData để gửi lên API
        const formData = new FormData();
        formData.append('roomId', roomId);
        formData.append('senderId', currentUser.accountId);
        formData.append('message', optimisticMessage.message);
        formData.append('tempId', tempId);
        // formData.append('file', ...); // (Có thể thêm file nếu muốn)

        try {
            // 4. Gọi API để gửi
            // (Tin nhắn thật sẽ được gửi lại qua SignalR và thay thế tin nhắn tạm)
            const res = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // KHÔNG set 'Content-Type' khi dùng FormData,
                    // trình duyệt sẽ tự set
                },
                body: formData
            });

            if (!res.ok) {
                throw new Error('Failed to send message');
            }
            // API sẽ trigger SignalR, SignalR sẽ gửi 'ReceiveMessage'
            // và cập nhật tin nhắn tạm (tempId) thành tin nhắn thật
            
        } catch (error) {
            console.error("Error sending message:", error);
            // Nếu lỗi, xóa tin nhắn tạm
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    };

    // Nếu chưa đăng nhập, không hiển thị gì cả
    if (!token || !currentUser) {
        return null; 
    }

    return (
        <div className="chat-widget-container">
            {/* Cửa sổ Chat (khi mở) */}
            {isOpen && (
                <div className="chat-window" role="dialog">
                    <div className="chat-header">
                        <h3>Hỗ trợ trực tuyến</h3>
                        <button onClick={() => setIsOpen(false)} className="chat-icon-button" title="Đóng">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`message-bubble ${msg.isAdmin ? 'admin-bubble' : 'user-bubble'} ${msg.isOptimistic ? 'optimistic' : ''}`}
                            >
                                <p className="message-text">{msg.message}</p>
                                <span className="message-time">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input-area" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            placeholder="Nhập tin nhắn..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button type="submit" className="chat-icon-button send-button" title="Gửi">
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            {/* Nút bong bóng (khi đóng) */}
            {!isOpen && (
                <button onClick={() => setIsOpen(true)} className="chat-bubble" title="Hỗ trợ">
                    <MessageSquare size={30} />
                </button>
            )}
        </div>
    );
}