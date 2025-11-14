import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageSquare, Paperclip } from 'lucide-react';

export default function ChatWindow({ currentRoom, currentMessages, handleSendMessage, handleCloseChat, messagesEndRef }) {
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null); 
    const fileInputRef = useRef(null); 
    
    // Clear input/file khi đổi phòng
    useEffect(() => {
        setMessage('');
        // Thu hồi URL blob cũ nếu có
        if (selectedFile && selectedFile.previewUrl) {
             URL.revokeObjectURL(selectedFile.previewUrl);
        }
        setSelectedFile(null);
        
        return () => {
             // Dọn dẹp khi component unmount hoặc khi currentRoom thay đổi (sẽ chạy trước effect)
             if (fileInputRef.current?.files?.[0] && fileInputRef.current.files[0].previewUrl) {
                 URL.revokeObjectURL(fileInputRef.current.files[0].previewUrl);
             }
        };
    }, [currentRoom]);

    // Xử lý File Upload
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Thêm thuộc tính previewUrl để thu hồi sau
            file.previewUrl = URL.createObjectURL(file); 
            setSelectedFile(file);
        }
        event.target.value = null; 
    };
    
    // Xử lý loại bỏ file
    const handleFileRemove = () => {
        if (selectedFile && selectedFile.previewUrl) {
            URL.revokeObjectURL(selectedFile.previewUrl); // Thu hồi URL blob của preview
        }
        setSelectedFile(null);
    };
    
    const handleAttachClick = () => {
        fileInputRef.current.click();
    };

    // Xử lý gửi tin nhắn
    const handleSend = () => {
        if (!message.trim() && !selectedFile) return;
        
        // Gửi tin nhắn và file
        handleSendMessage(message, selectedFile);
        
        // Thu hồi URL blob của preview sau khi gửi xong
        if (selectedFile && selectedFile.previewUrl) {
            URL.revokeObjectURL(selectedFile.previewUrl); 
        }
        
        setMessage('');
        setSelectedFile(null);
    };

    if (!currentRoom) {
        return (
            <div className="card chat-window-card">
                <div className="card-content no-room-selected">
                    <div className="no-room-icon-wrapper">
                        <MessageSquare width={40} height={40} />
                    </div>
                    <h3 className="no-room-title">Chưa chọn phòng chat</h3>
                    <p className="no-room-text">Chọn một phòng chat từ danh sách bên trái hoặc mở một chat mới</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card chat-window-card">
            {/* Header */}
            <div className="card-header chat-window-header">
                <div className="chat-header-info">
                    <div className="avatar avatar-large">
                        {currentRoom.customerName?.charAt(0)}
                    </div>
                    <div>
                        <h3 className="card-title customer-chat-name">{currentRoom.customerName}</h3>
                        <div className="status-indicator">
                            <div className={`status-dot ${currentRoom.isClosed ? 'offline' : 'active'}`} />
                            <p className="status-text">
                                {currentRoom.isClosed ? 'Đã đóng' : 'Đang hoạt động'}
                            </p>
                        </div>
                    </div>
                </div>
                <button 
                    className="button-secondary button-sm close-chat-button" 
                    onClick={handleCloseChat} 
                    disabled={currentRoom.isClosed}
                >
                    <X width={16} height={16} />
                    Đóng chat
                </button>
            </div>

            {/* Content (Messages) */}
            <div className="card-content chat-window-content">
                <div className="scroll-area messages-area">
                    <div className="message-list">
                        {currentMessages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`message-bubble-wrapper ${msg.isAdmin ? 'admin' : 'customer'}`}
                            >
                                <div className={`message-bubble ${msg.isAdmin ? 'admin' : 'customer'} ${msg.isOptimistic ? 'optimistic' : ''}`}>
                                    
                                    {msg.attachmentUrl && msg.attachmentType?.startsWith('image/') && (
                                        <img 
                                            src={msg.attachmentUrl} 
                                            alt="Attachment" 
                                            className="message-image" 
                                            // 💡 Sửa: Không cần revokeObjectURL ở đây
                                            // Blob URL của tin nhắn optimistic nên được dọn dẹp bởi parent (ChatSupport.jsx) 
                                            // khi nó được thay thế bằng tin nhắn thật. 
                                            // Giữ lại có thể dẫn đến lỗi nếu URL là URL thật từ server.
                                        />
                                    )}
                                    
                                    {msg.message && (
                                        <p className="message-text">{msg.message}</p>
                                    )}
                                    
                                    <p className="message-timestamp">
                                        {msg.isOptimistic ? msg.timestamp : (msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Preview File */}
                {selectedFile && (
                    <div className="file-preview-area">
                        <div className="file-preview-item">
                            {selectedFile.type.startsWith('image/') ? (
                                <img 
                                    src={selectedFile.previewUrl || URL.createObjectURL(selectedFile)} 
                                    alt="Preview" 
                                    className="file-preview-image"
                                    // 💡 Sửa: Đã chuyển logic thu hồi ra handleFileRemove và handleSend
                                />
                            ) : (
                                <div className="file-preview-icon">
                                    <Paperclip width={24} height={24} />
                                </div>
                            )}
                            <span className="file-preview-name" title={selectedFile.name}>
                                {selectedFile.name}
                            </span>
                            <button onClick={handleFileRemove} className="remove-file-button">
                                <X width={16} height={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="message-input-area">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange}
                        accept="image/*,application/pdf" 
                        style={{ display: 'none' }} 
                    />
                    
                    <button onClick={handleAttachClick} className="button-icon attach-file-button" disabled={currentRoom.isClosed}>
                        <Paperclip width={18} height={18} />
                    </button>

                    <input
                        type="text"
                        placeholder={currentRoom.isClosed ? "Cuộc trò chuyện đã đóng" : "Nhập tin nhắn của bạn..."}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault(); 
                                if (!currentRoom.isClosed) handleSend();
                            }
                        }}
                        className="message-input"
                        disabled={currentRoom.isClosed}
                    />
                    <button 
                        onClick={handleSend} 
                        className="button-primary send-button"
                        disabled={currentRoom.isClosed || (!message.trim() && !selectedFile)} 
                    >
                        <Send width={16} height={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}