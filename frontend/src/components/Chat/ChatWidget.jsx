import React, { useState, useEffect, useRef } from 'react';
// Import icons
import { MessageSquare, Send, X, Paperclip } from 'lucide-react'; // Thêm Paperclip
import { HubConnectionBuilder } from '@microsoft/signalr';
import './ChatWidget.css'; 

const API_URL = 'https://localhost:7132/api/chat';
const HUB_URL = 'https://localhost:7132/chathub';

export default function ChatWidget({ token, currentUser }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [hubConnection, setHubConnection] = useState(null);
    const [roomId, setRoomId] = useState(null); 
    
    // [BỔ SUNG] State và Ref cho File Upload
    const [selectedFile, setSelectedFile] = useState(null); 
    const fileInputRef = useRef(null); 

    const messagesEndRef = useRef(null);

    // Tự cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    // --- EFFECT 1: Kết nối SignalR (Giữ nguyên) ---
    useEffect(() => {
        if (!token) return; 

        const connection = new HubConnectionBuilder()
            .withUrl(HUB_URL, {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        connection.on('ReceiveMessage', (newMessage) => {
            setMessages(prev => {
                // Xóa tin nhắn tạm nếu cùng tempId
                const filtered = prev.filter(m => m.id !== newMessage.tempId);
                // Thêm tin thật
                return [...filtered, newMessage];
            });
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
    }, [token]); 

    // --- EFFECT 2: Lấy/Tạo phòng và tải lịch sử chat (Giữ nguyên) ---
    useEffect(() => {
        if (!hubConnection || !currentUser?.accountId || !token) return;

        const setupChat = async () => {
            try {
                // 1. Gọi API (POST /api/chat/rooms) để lấy/tạo phòng cho user này
                const roomResponse = await fetch(`${API_URL}/rooms`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({ customerId: currentUser.accountId })
                });

                if (!roomResponse.ok) throw new Error('Failed to get or create chat room');

                const roomData = await roomResponse.json();
                const userRoomId = roomData.roomId; 
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

    }, [hubConnection, currentUser, token]); 

    // [BỔ SUNG] Xử lý chọn file
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
        event.target.value = null; // Reset input để cho phép chọn lại cùng một file
    };

    // [BỔ SUNG] Kích hoạt input file
    const handleAttachClick = () => {
        fileInputRef.current.click();
    };

    // --- CẬP NHẬT: Xử lý gửi tin nhắn/file ---
    const handleSendMessage = async (e) => {
        e.preventDefault();
        // Kiểm tra điều kiện gửi
        if (!message.trim() && !selectedFile) return;
        if (!roomId || !hubConnection) return;

        const tempId = `temp_${Date.now()}`;
        
        // Tạo URL tạm thời nếu có file (cho tin nhắn optimistic)
        const tempAttachmentUrl = selectedFile ? URL.createObjectURL(selectedFile) : null;

        // 1. Dữ liệu tin nhắn tạm (cho Optimistic Update)
        const optimisticMessage = {
            id: tempId,
            roomId: roomId,
            senderId: currentUser.accountId,
            senderName: currentUser.fullName || currentUser.phone,
            isAdmin: false, 
            message: message.trim(),
            timestamp: new Date().toISOString(),
            isOptimistic: true, 
            // [BỔ SUNG] thông tin file
            attachmentUrl: tempAttachmentUrl,
            attachmentType: selectedFile ? selectedFile.type : null,
        };

        // 2. Thêm tin nhắn tạm vào UI ngay lập tức
        setMessages(prev => [...prev, optimisticMessage]);
        setMessage(''); // Xóa ô input
        setSelectedFile(null); // Xóa file đã chọn

        // 3. Chuẩn bị FormData để gửi lên API
        const formData = new FormData();
        formData.append('roomId', roomId);
        formData.append('senderId', currentUser.accountId);
        formData.append('senderName', optimisticMessage.senderName); // Thêm senderName cho backend dễ dùng
        formData.append('message', optimisticMessage.message);
        formData.append('tempId', tempId);
        
        // [BỔ SUNG] Thêm file vào FormData
        if (selectedFile) {
            formData.append('file', selectedFile, selectedFile.name);
        }

        try {
            // 4. Gọi API để gửi
            const res = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                throw new Error('Failed to send message');
            }
            // Sau khi gửi thành công, SignalR sẽ gửi tin nhắn thật

        } catch (error) {
            console.error("Error sending message:", error);
            // Nếu lỗi, xóa tin nhắn tạm
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    };

   if (!token || !currentUser || Number(currentUser.role) !== 0) {
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
                                {/* [BỔ SUNG] Hiển thị ảnh nếu là attachment */}
                                {msg.attachmentUrl && msg.attachmentType?.startsWith('image/') && (
                                    <img 
                                        src={msg.attachmentUrl} 
                                        alt="Attachment" 
                                        className="message-image" 
                                        onLoad={(e) => {
                                            // Chỉ revoke nếu là object URL (tin nhắn tạm)
                                            if (msg.isOptimistic && msg.attachmentUrl.startsWith('blob:')) {
                                                URL.revokeObjectURL(e.currentTarget.src);
                                            }
                                        }}
                                    />
                                )}

                                {/* [BỔ SUNG] Hiển thị biểu tượng file nếu không phải ảnh */}
                                {msg.attachmentUrl && !msg.attachmentType?.startsWith('image/') && !msg.message && (
                                    <div className="file-attachment">
                                        <Paperclip size={16} />
                                        <span>File đính kèm</span>
                                    </div>
                                )}
                                
                                {msg.message && (
                                    <p className="message-text">{msg.message}</p>
                                )}
                                
                                <span className="message-time">
                                    {/* Format lại timestamp */}
                                    {msg.isOptimistic ? 
                                        new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
                                        (msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')
                                    }
                                </span>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* [BỔ SUNG] Khu vực preview file */}
                    {selectedFile && (
                        <div className="file-preview-area">
                            <div className="file-preview-item">
                                <span className="file-preview-name">
                                    {selectedFile.type.startsWith('image/') ? 'Image: ' : 'File: '}
                                    {selectedFile.name}
                                </span>
                                <button onClick={() => setSelectedFile(null)} className="remove-file-button">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* [CẬP NHẬT] Input Area */}
                    <form className="chat-input-area" onSubmit={handleSendMessage}>
                        {/* [BỔ SUNG] Input File ẩn và Nút đính kèm */}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange}
                            accept="image/*,application/pdf" // Chỉ chấp nhận ảnh và PDF
                            style={{ display: 'none' }} 
                        />
                        <button 
                            type="button" // Quan trọng: Đặt type="button" để không submit form
                            onClick={handleAttachClick} 
                            className="chat-icon-button attach-button" 
                            title="Đính kèm file"
                        >
                            <Paperclip size={18} />
                        </button>
                        
                        <input
                            type="text"
                            placeholder="Nhập tin nhắn..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button 
                            type="submit" 
                            className="chat-icon-button send-button" 
                            title="Gửi"
                            // Vô hiệu hóa nút nếu không có tin nhắn hoặc file
                            disabled={!message.trim() && !selectedFile} 
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            {/* Nút bong bóng (Giữ nguyên) */}
            {!isOpen && (
                <button onClick={() => setIsOpen(true)} className="chat-bubble" title="Hỗ trợ">
                    <MessageSquare size={30} />
                </button>
            )}
        </div>
    );
}