import React from 'react';
import { Plus } from 'lucide-react';

export default function RoomList({ activeRooms, selectedRoom, setSelectedRoom, setIsModalOpen }) {
    return (
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
                                        {room.unread && <div className="unread-dot" />}
                                    </div>
                                    <div className="room-details">
                                        <div className="room-details-header">
                                            <span className="customer-name">{room.customerName}</span>
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
    );
}