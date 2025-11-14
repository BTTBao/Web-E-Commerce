import React, { useState, useRef, useEffect } from 'react'; // 👈 Thêm useEffect
import { Search, X, Plus } from 'lucide-react';

// Giả định bạn có endpoint này để lấy danh sách khách hàng đang hoạt động/gần nhất
const INITIAL_CUSTOMERS_API = 'https://localhost:7132/api/customers/active-chats'; // Dùng API khác cho mục đích này

export default function StartChatModal({ API_URL, handleStartChat, onClose }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [defaultCustomers, setDefaultCustomers] = useState([]); // 👈 State mới cho danh sách mặc định
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [isLoadingDefault, setIsLoadingDefault] = useState(true); // 👈 State loading mới
    const searchTimeoutRef = useRef(null);

    // 🟢 [EFFECT] Tải danh sách khách hàng mặc định khi Modal mở
    useEffect(() => {
        const fetchDefaultCustomers = async () => {
            try {
                // Giả định API_URL/rooms trả về danh sách các phòng chat đang hoạt động
                const response = await fetch(`${API_URL}/rooms`);
                if (!response.ok) throw new Error('Failed to fetch default rooms');

                const data = await response.json();
                
                // Lấy thông tin cơ bản của khách hàng từ danh sách phòng chat
                const simplifiedCustomers = data.map(room => ({
                    accountId: room.customerId, // Cần đảm bảo API/rooms trả về customerId
                    fullName: room.customerName,
                    phone: room.customerPhone || room.customerName,
                    lastMessageTime: room.lastMessageTime
                })).slice(0, 10); // Lấy 10 khách hàng gần nhất/hoạt động

                setDefaultCustomers(simplifiedCustomers);
            } catch (error) {
                console.error("Failed to load default customers:", error);
            } finally {
                setIsLoadingDefault(false);
            }
        };

        fetchDefaultCustomers();

        // Dọn dẹp timeout khi component unmount
        return () => {
             if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [API_URL]);


    // --- HÀM XỬ LÝ TÌM KIẾM (Giữ nguyên) ---
    const searchCustomers = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        setIsLoadingSearch(true);

        try {
            // API_URL/search-customers
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
    
    // 💡 Lựa chọn danh sách để hiển thị
    const displayList = searchQuery ? searchResults : defaultCustomers;
    const isLoading = searchQuery ? isLoadingSearch : isLoadingDefault;


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
                    
                    {/* Kết quả tìm kiếm / Danh sách mặc định */}
                    <div className="search-results-list">
                        {isLoading && (
                            <div className="search-results-placeholder">Đang tải khách hàng...</div>
                        )}
                        {!isLoading && displayList.length === 0 && (
                             <div className="search-results-placeholder">
                                {searchQuery ? 'Không tìm thấy khách hàng.' : 'Không có phòng chat đang hoạt động nào.'}
                            </div>
                        )}

                        {!isLoading && displayList.map(customer => (
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