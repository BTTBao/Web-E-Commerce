import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { useLocation } from 'react-router-dom'; // 👈 Cần hook này!
import './Orders.css';
import './ChatSupport.css';

// Import các component con
import RoomList from '../../components/RoomList.jsx';
import ChatWindow from '../../components/ChatWindow';
import StartChatModal from '../../components/StartChatModal';

const API_URL = 'https://localhost:7132/api/chat';
const HUB_URL = 'https://localhost:7132/chathub';

export default function ChatSupport() {
    const location = useLocation(); 
    
    // --- STATE ---
    const [rooms, setRooms] = useState([]);
    const [messages, setMessages] = useState({});
    // eslint-disable-next-line no-unused-vars
    const [hubConnection, setHubConnection] = useState(null); 
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Lấy ID khách hàng mục tiêu từ state của route (chỉ dùng 1 lần)
    const targetCustomerId = location.state?.targetCustomerId;
    const [initialCustomerId, setInitialCustomerId] = useState(targetCustomerId); 

    // --- REFS & MEMOS ---
    const messagesEndRef = useRef(null);

    // Chỉ hiển thị các phòng CHƯA ĐÓNG
    const activeRooms = useMemo(() => rooms.filter((room) => !room.isClosed), [rooms]);

    const currentMessages = useMemo(() => {
        return selectedRoom ? messages[selectedRoom] || [] : [];
    }, [selectedRoom, messages]);

    const currentRoom = useMemo(() => {
        return rooms.find((room) => room.id === selectedRoom);
    }, [rooms, selectedRoom]);

    // --- HÀM XỬ LÝ ---

    // Xử lý bắt đầu chat mới (Tạo/Lấy phòng và cập nhật UI)
    const handleStartChat = useCallback(async (customerId) => {
        try {
            // KHÁCH HÀNG ID ĐƯỢC ĐẢM BẢO LÀ SỐ NGUYÊN TẠI ĐÂY
            const response = await fetch(`${API_URL}/rooms/get-or-create/${customerId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId: 1 }) // Giả định Admin ID là 1
            });

            if (!response.ok) throw new Error('Failed to create or get chat room');

            const newRoom = await response.json();

            setRooms(prevRooms => {
                const roomExists = prevRooms.find(r => r.id === newRoom.id);
                if (roomExists) {
                    // Cập nhật room và đưa lên đầu danh sách active
                    return [{ ...newRoom, isClosed: false }, ...prevRooms.filter(r => r.id !== newRoom.id)];
                }
                // Thêm phòng mới vào danh sách
                return [newRoom, ...prevRooms];
            });

            setSelectedRoom(newRoom.id);
            setIsModalOpen(false); 
        } catch (error) {
            console.error('Error starting chat:', error);
        }
    }, []);

    // Xử lý gửi tin nhắn (Logic Optimistic Update và Blob URL)
    const handleSendMessage = useCallback(async (messageText, file) => {
        if (!messageText.trim() && !file) return;
        if (!selectedRoom) return;

        const now = new Date();
        const tempId = `temp_${now.getTime()}`; 
        
        const formData = new FormData();
        formData.append('roomId', selectedRoom);
        formData.append('senderId', 1); // Giả định Admin ID là 1
        formData.append('senderName', "Admin");
        formData.append('isAdmin', true);
        formData.append('message', messageText.trim());
        formData.append('timestamp', now.toISOString());
        formData.append('tempId', tempId); 
        if (file) {
            formData.append('file', file, file.name);
        }

        const optimisticMessage = {
            id: tempId,
            roomId: selectedRoom,
            senderId: 1, 
            senderName: "Admin",
            isAdmin: true,
            message: messageText.trim(),
            timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            attachmentUrl: file ? URL.createObjectURL(file) : null,
            attachmentType: file ? file.type : null,
            isOptimistic: true 
        };

        setMessages(prev => ({
            ...prev,
            [selectedRoom]: [...(prev[selectedRoom] || []), optimisticMessage]
        }));
        
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
        } catch (error) {
            console.error("Error sending message:", error);
            
            if (optimisticMessage.attachmentUrl && optimisticMessage.attachmentUrl.startsWith('blob:')) {
                 URL.revokeObjectURL(optimisticMessage.attachmentUrl);
            }
            setMessages(prev => ({
                ...prev,
                [selectedRoom]: prev[selectedRoom].filter(m => m.id !== tempId)
            }));
        }
    }, [selectedRoom]);

    // Xử lý đóng chat (Gọi API và cập nhật state)
    const handleCloseChat = useCallback(async () => {
        if (!selectedRoom) return;

        try {
            const res = await fetch(`${API_URL}/rooms/${selectedRoom}/close`, {
                method: 'PUT',
            });

            if (!res.ok) {
                throw new Error(`Server returned status ${res.status}`);
            }

            setRooms(prevRooms => prevRooms.map(r =>
                r.id === selectedRoom ? { ...r, isClosed: true } : r
            ));
            
            setSelectedRoom(null); 
            
            console.log(`Chat room ${selectedRoom} successfully closed.`);
            
        } catch (error) {
            console.error('Error closing chat room:', error);
            toast.error('Có lỗi xảy ra khi đóng phòng chat.');
        }
    }, [selectedRoom]);


    // --- EFFECTS ---

    // 🟢 [EFFECT] Tự động mở phòng chat khi có ID được truyền (từ CustomerDetail)
    useEffect(() => {
        // initialCustomerId chỉ có giá trị khi chuyển từ CustomerDetail
        if (initialCustomerId) {
            console.log(`Tự động mở chat với Customer ID: ${initialCustomerId}`);
            
            handleStartChat(initialCustomerId)
                .then(() => {
                    // Đặt lại state để tránh chạy lại
                    setInitialCustomerId(null); 
                    // Xóa state khỏi location để tránh tự động mở lại khi refresh
                    window.history.replaceState({}, document.title, location.pathname);
                })
                .catch(err => {
                    console.error("Lỗi tự động mở chat:", err);
                    setInitialCustomerId(null); 
                });
        }
    }, [initialCustomerId, handleStartChat, location.pathname]);


    // [EFFECT] Cuộn xuống cuối tin nhắn
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentMessages]);

    // [EFFECT] Kết nối SignalR và xử lý tin nhắn
    useEffect(() => {
        const connection = new HubConnectionBuilder()
            .withUrl(HUB_URL, { skipNegotiation: true, transport: 1 })
            .withAutomaticReconnect()
            .build();

        connection.on('ReceiveMessage', (newMessageDto) => {
            setMessages(prevMessages => {
                const roomMessages = prevMessages[newMessageDto.roomId] || [];
                
                if (roomMessages.find(m => m.id === newMessageDto.id)) return prevMessages;
                
                let updatedMessages = roomMessages;
                
                if (newMessageDto.tempId) {
                    const tempMessage = roomMessages.find(m => m.id === newMessageDto.tempId);
                    if (tempMessage && tempMessage.attachmentUrl && tempMessage.attachmentUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(tempMessage.attachmentUrl);
                    }
                    updatedMessages = roomMessages.filter(m => m.id !== newMessageDto.tempId);
                } else {
                    updatedMessages = roomMessages;
                }
                
                return { ...prevMessages, [newMessageDto.roomId]: [...updatedMessages, newMessageDto] };
            });

            setRooms(prevRooms => prevRooms.map(room =>
                room.id === newMessageDto.roomId
                    ? { ...room, 
                        lastMessage: newMessageDto.attachmentUrl ? '[Hình ảnh]' : newMessageDto.message, 
                        lastMessageTime: newMessageDto.timestamp, 
                        unread: room.id !== selectedRoom 
                    }
                    : room
            ).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)));
        });

        connection.start()
            .then(() => {
                console.log('SignalR Connected!');
                setHubConnection(connection);
            })
            .catch(e => console.error('SignalR Connection Error: ', e));

        return () => { connection.stop(); };
    }, []);

    // [EFFECT] Lấy danh sách phòng chat (Ưu tiên targetCustomerId)
    useEffect(() => {
        fetch(`${API_URL}/rooms`)
            .then(res => res.json())
            .then(data => {
                const sortedData = data.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
                setRooms(sortedData);
                
                // Chỉ tự động chọn phòng đầu tiên nếu KHÔNG có targetCustomerId
                if (!targetCustomerId && data.length > 0 && !selectedRoom) {
                    const firstActiveRoom = sortedData.find(r => !r.isClosed);
                    if (firstActiveRoom) {
                        setSelectedRoom(firstActiveRoom.id);
                    } else if (sortedData.length > 0) {
                        setSelectedRoom(sortedData[0].id);
                    }
                }
            })
            .catch(e => console.error("Failed to fetch rooms:", e));
    }, [targetCustomerId]); 

    // [EFFECT] Lấy tin nhắn và JoinRoom khi đổi phòng
    useEffect(() => {
        if (!selectedRoom || !hubConnection) return;
        
        setRooms(prevRooms => prevRooms.map(r => 
            r.id === selectedRoom ? { ...r, unread: false } : r
        ));

        hubConnection.invoke('JoinRoom', selectedRoom)
            .catch(err => console.error(`Failed to join room ${selectedRoom}: `, err));

        if (messages[selectedRoom]) return;

        fetch(`${API_URL}/rooms/${selectedRoom}/messages`)
            .then(res => res.json())
            .then(data => {
                setMessages(prev => ({ ...prev, [selectedRoom]: data }));
            })
            .catch(e => console.error("Failed to fetch messages:", e));
        
        // CLEANUP: Dọn dẹp tất cả Blob URL còn sót lại khi unmount hoặc đổi phòng
        return () => {
             const roomMessages = messages[selectedRoom] || [];
             roomMessages.forEach(m => {
                 if (m.isOptimistic && m.attachmentUrl && m.attachmentUrl.startsWith('blob:')) {
                     URL.revokeObjectURL(m.attachmentUrl);
                 }
             });
        };
        
    }, [selectedRoom, hubConnection, messages]);


    // --- RENDER ---
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
                {/* 1. Danh sách phòng chat */}
                <RoomList
                    activeRooms={activeRooms}
                    selectedRoom={selectedRoom}
                    setSelectedRoom={setSelectedRoom}
                    setIsModalOpen={setIsModalOpen}
                />

                {/* 2. Cửa sổ chat */}
                <ChatWindow
                    currentRoom={currentRoom}
                    currentMessages={currentMessages}
                    handleSendMessage={handleSendMessage}
                    handleCloseChat={handleCloseChat}
                    messagesEndRef={messagesEndRef}
                />
            </div>

            {/* 3. Modal Bắt đầu chat mới */}
            {isModalOpen && (
                <StartChatModal
                    API_URL={API_URL}
                    handleStartChat={handleStartChat}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}