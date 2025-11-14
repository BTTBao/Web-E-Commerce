import React, { useState, useRef } from 'react';
import { Search, X, Plus } from 'lucide-react';

export default function StartChatModal({ API_URL, handleStartChat, onClose }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const searchTimeoutRef = useRef(null);

    // --- HÀM XỬ LÝ TÌM KIẾM ---
    const searchCustomers = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        setIsLoadingSearch(true);

        try {
            const response = await fetch(`${API_URL}/search-customers?query=${encodeURIComponent(query)}`);
            
            if (!response.ok) throw new Error('Failed to search customers');
            
            const data = await response.json();
            setSearchResults(data); 

        } catch (error) {
            console.error("Failed to search customers:", error);
            setSearchResults([]);
        } finally {
            setIsLoadingSearch(false);
        }
    };

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

    // Xử lý đóng modal và dọn dẹp
    const handleCloseModal = () => {
        setSearchQuery('');
        setSearchResults([]);
        onClose();
    }

    return (
        <div className="chat-modal-overlay">
            <div className="chat-modal-content">
                {/* Header Modal */}
                <div className="chat-modal-header">
                    <h3 className="chat-modal-title">Tìm và bắt đầu chat</h3>
                    <button 
                        onClick={handleCloseModal} 
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

                        {searchResults.map(customer => (
                            <button 
                                key={customer.accountId}
                                className="search-result-item"
                                onClick={() => {
                                    handleStartChat(customer.accountId);
                                    handleCloseModal(); // Đóng modal sau khi bắt đầu chat
                                }}
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
    );
}