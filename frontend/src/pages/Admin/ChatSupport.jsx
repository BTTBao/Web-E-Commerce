import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import './Orders.css';
import './ChatSupport.css';

// Import các component con
import RoomList from '../../components/RoomList.jsx';
import ChatWindow from '../../components/ChatWindow';
import StartChatModal from '../../components/StartChatModal';

const API_URL = 'https://localhost:7132/api/chat';
const HUB_URL = 'https://localhost:7132/chathub';

export default function ChatSupport() {
    // --- STATE ---
    const [rooms, setRooms] = useState([]);
    const [messages, setMessages] = useState({});
    const [hubConnection, setHubConnection] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);

    // State cho Modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- REFS & MEMOS ---
    const messagesEndRef = useRef(null);

    const activeRooms = useMemo(() => rooms.filter((room) => !room.isClosed), [rooms]);

    const currentMessages = useMemo(() => {
        return selectedRoom ? messages[selectedRoom] || [] : [];
    }, [selectedRoom, messages]);

    const currentRoom = useMemo(() => {
        return rooms.find((room) => room.id === selectedRoom);
    }, [rooms, selectedRoom]);

    // --- EFFECTS (Giữ nguyên) ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentMessages]);

    // [EFFECT] Kết nối SignalR
    useEffect(() => {
        const connection = new HubConnectionBuilder()
            .withUrl(HUB_URL, { skipNegotiation: true, transport: 1 })
            .withAutomaticReconnect()
            .build();

        connection.on('ReceiveMessage', (newMessageDto) => {
            setMessages(prevMessages => {
                const roomMessages = prevMessages[newMessageDto.roomId] || [];
                if (roomMessages.find(m => m.id === newMessageDto.id)) return prevMessages;
                
                // Xử lý optimistic update
                if (newMessageDto.tempId) {
                    const optimisticMessages = roomMessages.filter(m => m.id !== newMessageDto.tempId);
                    return { ...prevMessages, [newMessageDto.roomId]: [...optimisticMessages, newMessageDto] };
                }

                return { ...prevMessages, [newMessageDto.roomId]: [...roomMessages, newMessageDto] };
            });

            // Cập nhật rooms
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

    // [EFFECT] Lấy danh sách phòng chat
    useEffect(() => {
        fetch(`${API_URL}/rooms`)
            .then(res => res.json())
            .then(data => {
                const sortedData = data.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
                setRooms(sortedData);
                if (data.length > 0 && !selectedRoom) {
                    setSelectedRoom(data[0].id);
                }
            })
            .catch(e => console.error("Failed to fetch rooms:", e));
    }, []);

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
    }, [selectedRoom, hubConnection, messages]);


    // --- HÀM XỬ LÝ (Truyền xuống component con) ---

    // Xử lý gửi tin nhắn (Tách ra để dùng trong ChatWindow)
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
            setMessages(prev => ({
                ...prev,
                [selectedRoom]: prev[selectedRoom].filter(m => m.id !== tempId)
            }));
        }
    }, [selectedRoom]);

    // Xử lý đóng chat
    const handleCloseChat = useCallback(() => {
        if (!selectedRoom) return;
        // TODO: Gọi API để set IsClosed = 1 trong DB
        console.log('Closing chat room:', selectedRoom);

        setRooms(prevRooms => prevRooms.map(r =>
            r.id === selectedRoom ? { ...r, isClosed: true } : r
        ));
        setSelectedRoom(null);
    }, [selectedRoom]);

    // Xử lý bắt đầu chat mới (Tách ra để dùng trong StartChatModal)
    const handleStartChat = useCallback(async (customerId) => {
        try {
            const response = await fetch(`${API_URL}/rooms/get-or-create/${customerId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId: 1 })
            });

            if (!response.ok) throw new Error('Failed to create or get chat room');

            const newRoom = await response.json();

            setRooms(prevRooms => {
                const roomExists = prevRooms.find(r => r.id === newRoom.id);
                if (roomExists) {
                    return [{ ...newRoom, isClosed: false }, ...prevRooms.filter(r => r.id !== newRoom.id)];
                }
                return [newRoom, ...prevRooms];
            });

            setSelectedRoom(newRoom.id);
            setIsModalOpen(false); // Đóng modal
        } catch (error) {
            console.error('Error starting chat:', error);
        }
    }, []);

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