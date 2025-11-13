import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, X, MessageSquare, Paperclip, Search, Plus } from 'lucide-react';
import { HubConnectionBuilder } from '@microsoft/signalr';

import './Orders.css';
import './ChatSupport.css';

const API_URL = 'https://localhost:7132/api/chat';
const HUB_URL = 'https://localhost:7132/chathub';


export default function ChatSupport() {
    const [rooms, setRooms] = useState([]);
    const [messages, setMessages] = useState({});
    const [hubConnection, setHubConnection] = useState(null);

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [message, setMessage] = useState('');
    
    const [selectedFile, setSelectedFile] = useState(null); 
    const fileInputRef = useRef(null); 
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const searchTimeoutRef = useRef(null);

    const messagesEndRef = useRef(null);

    const activeRooms = useMemo(() => rooms.filter((room) => !room.isClosed), [rooms]);

    const currentMessages = useMemo(() => {
        return selectedRoom ? messages[selectedRoom] || [] : [];
    }, [selectedRoom, messages]);

    const currentRoom = useMemo(() => {
        // --- CẬP NHẬT LOGIC ---
        // Đảm bảo lấy customerName từ User (nếu API trả về) hoặc từ Account (dự phòng)
        const room = rooms.find((room) => room.id === selectedRoom);
        if (room) {
             // Giả sử API /rooms trả về customerName (từ Join)
            return room; 
        }
        return undefined;
    }, [rooms, selectedRoom]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentMessages]);


    // [EFFECT] Kết nối SignalR
    useEffect(() => {
        const connection = new HubConnectionBuilder()
            .withUrl(HUB_URL, {
                skipNegotiation: true,
                transport: 1 // HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

        connection.on('ReceiveMessage', (newMessageDto) => {
            console.log('New message received:', newMessageDto);
            setMessages(prevMessages => {
                const roomMessages = prevMessages[newMessageDto.roomId] || [];
                if (roomMessages.find(m => m.id === newMessageDto.id)) {
                    return prevMessages;
                }
                
                if (newMessageDto.tempId) {
                        const optimisticMessages = roomMessages.filter(m => m.id !== newMessageDto.tempId);
                        return {
                            ...prevMessages,
                            [newMessageDto.roomId]: [...optimisticMessages, newMessageDto]
                        };
                }

                return {
                    ...prevMessages,
                    [newMessageDto.roomId]: [...roomMessages, newMessageDto]
                };
            });

            // Cập nhật tin nhắn cuối cùng và thời gian
            setRooms(prevRooms => prevRooms.map(room =>
                room.id === newMessageDto.roomId
                    ? { ...room, 
                        lastMessage: newMessageDto.attachmentUrl ? '[Hình ảnh]' : newMessageDto.message, 
                        lastMessageTime: newMessageDto.timestamp, // Giả sử DTO trả về timestamp
                        unread: room.id !== selectedRoom // Đánh dấu unread nếu không phải phòng đang chọn
                    }
                    : room
            ).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)) // Sắp xếp lại
            );
        });

        connection.start()
            .then(() => {
                console.log('SignalR Connected!');
                setHubConnection(connection);
            })
            .catch(e => console.error('SignalR Connection Error: ', e));

        return () => {
            connection.stop();
        };
    }, []); // Thêm selectedRoom để xử lý 'unread'

    // [EFFECT] Lấy danh sách phòng chat
    useEffect(() => {
        fetch(`${API_URL}/rooms`)
            .then(res => res.json())
            .then(data => {
                // Sắp xếp các phòng theo tin nhắn cuối cùng
                const sortedData = data.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
                setRooms(sortedData);
                if (data.length > 0 && !selectedRoom) {
                    setSelectedRoom(data[0].id);
                }
            })
            .catch(e => console.error("Failed to fetch rooms:", e));
    }, []);

    // [EFFECT] Lấy tin nhắn khi đổi phòng
    useEffect(() => {
        if (!selectedRoom || !hubConnection) return;

        // Đánh dấu phòng là đã đọc khi chọn
        setRooms(prevRooms => prevRooms.map(r => 
            r.id === selectedRoom ? { ...r, unread: false } : r
        ));

        hubConnection.invoke('JoinRoom', selectedRoom)
            .catch(err => console.error(`Failed to join room ${selectedRoom}: `, err));

        // Không fetch lại nếu đã có tin nhắn
        if (messages[selectedRoom]) {
            return;
        }

        fetch(`${API_URL}/rooms/${selectedRoom}/messages`)
            .then(res => res.json())
            .then(data => {
                setMessages(prev => ({
                    ...prev,
                    [selectedRoom]: data
                }));
            })
            .catch(e => console.error("Failed to fetch messages:", e));

    }, [selectedRoom, hubConnection, messages]);


    // Các hàm xử lý file (không đổi)
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
        event.target.value = null; 
    };
    const handleFileRemove = () => {
        setSelectedFile(null);
    };
    const handleAttachClick = () => {
        fileInputRef.current.click();
    };

    // Hàm gửi tin nhắn (không đổi)
    const handleSendMessage = async () => {
        if (!message.trim() && !selectedFile) return;

        const now = new Date();
        const tempId = `temp_${now.getTime()}`; 
        
        const formData = new FormData();
        formData.append('roomId', selectedRoom);
        formData.append('senderId', 1); // Giả định Admin ID là 1
        formData.append('senderName', "Admin");
        formData.append('isAdmin', true);
        formData.append('message', message.trim());
        formData.append('timestamp', now.toISOString());
        formData.append('tempId', tempId); 

        if (selectedFile) {
            formData.append('file', selectedFile, selectedFile.name);
        }

        const optimisticMessage = {
            id: tempId,
            roomId: selectedRoom,
            senderId: 1, // Admin ID
            senderName: "Admin",
            isAdmin: true,
            message: message.trim(),
            timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            attachmentUrl: selectedFile ? URL.createObjectURL(selectedFile) : null,
            attachmentType: selectedFile ? selectedFile.type : null,
            isOptimistic: true 
        };

        setMessages(prev => ({
            ...prev,
            [selectedRoom]: [...(prev[selectedRoom] || []), optimisticMessage]
        }));
        
        setMessage('');
        setSelectedFile(null);

        try {
            const response = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                body: formData 
            });

            if (!response.ok) {
                const err = await response.text();
                console.error("Server error:", err);
                throw new Error('Failed to send message');
            }
            
            // Server sẽ phản hồi tin nhắn qua SignalR (ReceiveMessage)
            // và thay thế tin nhắn tạm (dựa theo tempId)

        } catch (error) {
            console.error("Error sending message:", error);
            // Xóa tin nhắn tạm nếu gửi thất bại
            setMessages(prev => ({
                ...prev,
                [selectedRoom]: prev[selectedRoom].filter(m => m.id !== tempId)
            }));
        }
    };

    // Hàm đóng chat (không đổi)
    const handleCloseChat = () => {
        if (!selectedRoom) return;
        // TODO: Gọi API để set IsClosed = 1 trong DB
        console.log('Closing chat room:', selectedRoom);

        setRooms(prevRooms => prevRooms.map(r =>
            r.id === selectedRoom ? { ...r, isClosed: true } : r
        ));
        setSelectedRoom(null); // Bỏ chọn phòng
    };

    // --- 3. [HÀM] Xử lý tìm kiếm (Đã cập nhật) ---
    const searchCustomers = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        setIsLoadingSearch(true);

        try {
            // --- THAY ĐỔI: Gọi API thật (Endpoint A) ---
            const response = await fetch(`${API_URL}/search-customers?query=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error('Failed to search customers');
            }
            
            const data = await response.json();
            
            // Giả sử API trả về đúng định dạng [{ accountId, fullName, phone }, ...]
            setSearchResults(data); 
            // ------------------------------------

        } catch (error) {
            console.error("Failed to search customers:", error);
            setSearchResults([]);
        } finally {
            setIsLoadingSearch(false);
        }
    };

    // Hàm debounce (không đổi)
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            searchCustomers(query);
        }, 300); 
    };

    // --- 4. [HÀM] Xử lý bắt đầu chat (Không đổi, đã chính xác) ---
    // Hàm này gọi API (Endpoint B)
    const handleStartChat = async (customerId) => {
        console.log('Starting chat with customer:', customerId);
        try {
            // 1. Gọi API (Endpoint B)
            const response = await fetch(`${API_URL}/rooms/get-or-create/${customerId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId: 1 }) // Gửi ID admin (ví dụ 1)
            });

            if (!response.ok) {
                throw new Error('Failed to create or get chat room');
            }

            const newRoom = await response.json();

            // 2. Cập nhật state 'rooms'
            setRooms(prevRooms => {
                const roomExists = prevRooms.find(r => r.id === newRoom.id);
                if (roomExists) {
                    // Nếu phòng đã tồn tại, cập nhật và đưa lên đầu
                    return [
                        { ...newRoom, isClosed: false }, // Đảm bảo phòng được mở
                        ...prevRooms.filter(r => r.id !== newRoom.id)
                    ];
                }
                // Nếu là phòng mới hoàn toàn, thêm vào đầu
                return [newRoom, ...prevRooms];
            });

            // 3. Chọn phòng mới
            setSelectedRoom(newRoom.id);
            
            // 4. Đóng modal và dọn dẹp
            setIsModalOpen(false);
            setSearchQuery('');
            setSearchResults([]);

        } catch (error) {
            console.error('Error starting chat:', error);
            // TODO: Hiển thị thông báo lỗi cho admin
        }
    };


    return (
        <div className="chat-container">
            {/* ... (Phần page-header không đổi) ... */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Hỗ trợ Trực tuyến</h1>
                    <p className="page-subtitle">Quản lý và trả lời tin nhắn từ khách hàng</p>
                </div>
                <span className="badge badge-green-solid">
                    {/* Đếm số phòng có unread=true */}
                    {activeRooms.filter(r => r.unread).length} tin nhắn mới
                </span>
            </div>

            {/* Modal Tìm kiếm (Không đổi) */}
            {isModalOpen && (
                <div className="chat-modal-overlay">
                    <div className="chat-modal-content">
                        {/* Header Modal */}
                        <div className="chat-modal-header">
                            <h3 className="chat-modal-title">Tìm và bắt đầu chat</h3>
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="button-icon close-modal-button"
                            >
                                <X width={20} height={20} />
                            </button>
                        </div>
                        
                        {/* Body Modal */}
                        <div className="chat-modal-body">
                            <div className="search-bar-wrapper">
                                <Search width={18} height={18} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên hoặc SĐT khách hàng..."
                                    className="search-input"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    autoFocus
                                />
                            </div>
                            
                            {/* Kết quả tìm kiếm */}
                            <div className="search-results-list">
                                {isLoadingSearch && (
                                    <div className="search-results-placeholder">Đang tìm...</div>
                                )}
                                {!isLoadingSearch && searchResults.length === 0 && searchQuery && (
                                    <div className="search-results-placeholder">Không tìm thấy khách hàng.</div>
                                )}
                                {!isLoadingSearch && searchResults.length === 0 && !searchQuery && (
                                    <div className="search-results-placeholder">Nhập tên hoặc SĐT để tìm kiếm.</div>
                                )}

                                {/* --- CẬP NHẬT: Dùng accountId và fullName từ API --- */}
                                {searchResults.map(customer => (
                                    <button 
                                        key={customer.accountId} // Dùng key từ API
                                        className="search-result-item"
                                        onClick={() => handleStartChat(customer.accountId)} // Dùng accountId
                                    >
                                        <div className="avatar">
                                            {customer.fullName?.charAt(0)}
                                        </div>
                                        <div className="customer-info">
                                            <span className="customer-name">{customer.fullName}</span>
                                            <span className="customer-phone">{customer.phone}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* --- Kết thúc Modal --- */}


            <div className="chat-layout">
                {/* Cột Danh sách phòng chat (Không đổi) */}
                <div className="card room-list-card">
                    <div className="card-header room-list-header">
                        <h3 className="card-title room-list-title">
                            <span>Phòng chat</span>
                            <span className="badge room-count-badge">
                                {activeRooms.length}
                            </span>
                        </h3>
                        
                        <button 
                            className="button-icon new-chat-button" 
                            title="Mở chat mới"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus width={18} height={18} />
                        </button>
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
                                                {/* Hiển thị dot nếu có unread */}
                                                {room.unread && <div className="unread-dot" />}
                                            </div>
                                            <div className="room-details">
                                                <div className="room-details-header">
                                                    <span className="customer-name">{room.customerName}</span>
                                                    {/* Format lại thời gian (nếu cần) */}
                                                    <span className="last-time">
                                                        {room.lastMessageTime ? new Date(room.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </span>
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

                {/* Cột Cửa sổ chat (Không đổi) */}
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
                                            <div className={`status-dot ${currentRoom.isClosed ? 'offline' : 'active'}`} />
                                            <p className="status-text">
                                                {currentRoom.isClosed ? 'Đã đóng' : 'Đang hoạt động'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <button className="button-secondary button-sm close-chat-button" onClick={handleCloseChat} disabled={currentRoom.isClosed}>
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
                                                <div className={`message-bubble ${msg.isAdmin ? 'admin' : 'customer'} ${msg.isOptimistic ? 'optimistic' : ''}`}>
                                                    
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
                                                    
                                                    {msg.message && (
                                                        <p className="message-text">{msg.message}</p>
                                                    )}
                                                    
                                                    {/* Format lại timestamp */}
                                                    <p className="message-timestamp">
                                                        {msg.isOptimistic ? msg.timestamp : (msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>

                                {/* Khu vực preview file */}
                                {selectedFile && (
                                    <div className="file-preview-area">
                                        <div className="file-preview-item">
                                            {selectedFile.type.startsWith('image/') ? (
                                                <img 
                                                    src={URL.createObjectURL(selectedFile)} 
                                                    alt="Preview" 
                                                    className="file-preview-image"
                                                    onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
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

                                {/* Khu vực nhập tin nhắn */}
                                <div className="message-input-area">
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange}
                                        accept="image/*,application/pdf" 
                                        style={{ display: 'none' }} 
                                    />
                                    
                                    <button onClick={handleAttachClick} className="button-icon attach-file-button">
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
                                                if (!currentRoom.isClosed) handleSendMessage();
                                            }
                                        }}
                                        className="message-input"
                                        disabled={currentRoom.isClosed} // Vô hiệu hóa input nếu chat đã đóng
                                    />
                                    <button 
                                        onClick={handleSendMessage} 
                                        className="button-primary send-button"
                                        disabled={currentRoom.isClosed} // Vô hiệu hóa nút gửi
                                    >
                                        <Send width={16} height={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        // Màn hình chờ (Không đổi)
                        <div className="card-content no-room-selected">
                            <div className="no-room-icon-wrapper">
                                <MessageSquare width={40} height={40} />
                            </div>
                            <h3 className="no-room-title">Chưa chọn phòng chat</h3>
                            <p className="no-room-text">Chọn một phòng chat từ danh sách bên trái hoặc mở một chat mới</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}