/*
=================================================
 SCRIPT CHÈN DỮ LIỆU MẪU CHO SKYNET_COMMERCE
=================================================
*/

USE Skynet_commerce;
GO

/*
=================================================
 1. CHÈN DỮ LIỆU
=================================================
*/

-- 🧍 1. TÀI KHOẢN (ACCOUNTS)
-- (PasswordHash là giả, bạn phải tạo hash thật khi làm API Đăng ký)
-- role = 1 (Admin), role = 0 (Customer)
INSERT INTO Accounts (Email, PasswordHash, Phone, role, IsActive) VALUES
('admin@skynet.com', 'placeholder_hash', '0900000001', 1, 1), -- ID 1 (Admin)
('user1@gmail.com', 'placeholder_hash', '0901111111', 0, 1), -- ID 2 (Customer)
('user2@gmail.com', 'placeholder_hash', '0902222222', 0, 1), -- ID 3
('user3_locked@gmail.com', 'placeholder_hash', '0903333333', 0, 0), -- ID 4 (Bị khóa)
('user4@gmail.com', 'placeholder_hash', '0904444444', 0, 1), -- ID 5
('user5@gmail.com', 'placeholder_hash', '0905555555', 0, 1), -- ID 6
('user6@gmail.com', 'placeholder_hash', '0906666666', 0, 1), -- ID 7
('user7@gmail.com', 'placeholder_hash', '0907777777', 0, 1), -- ID 8
('user8@gmail.com', 'placeholder_hash', '0908888888', 0, 1), -- ID 9
('user9@gmail.com', 'placeholder_hash', '0909999999', 0, 1); -- ID 10
GO

-- 🏠 2. THÔNG TIN NGƯỜI DÙNG (USERS)
-- (Liên kết 1-1 với 10 Accounts ở trên)
INSERT INTO Users (AccountID, FullName, Gender, DateOfBirth, AvatarURL) VALUES
(1, N'Admin Skynet', 'Other', '1990-01-01', 'https://i.pravatar.cc/150?img=1'),
(2, N'Nguyễn Văn A', 'Male', '1992-03-15', 'https://i.pravatar.cc/150?img=5'),
(3, N'Trần Thị B', 'Female', '1995-07-20', 'https://i.pravatar.cc/150?img=8'),
(4, N'Lê Văn C (Bị khóa)', 'Male', '1988-11-30', 'https://i.pravatar.cc/150?img=7'),
(5, N'Phạm Thị D', 'Female', '2000-02-10', 'https://i.pravatar.cc/150?img=10'),
(6, N'Hoàng Văn E', 'Male', '1998-09-05', 'https://i.pravatar.cc/150?img=11'),
(7, N'Đặng Thu F', 'Female', '1997-12-25', 'https://i.pravatar.cc/150?img=12'),
(8, N'Vũ Đình G', 'Male', '1993-06-18', 'https://i.pravatar.cc/150?img=14'),
(9, N'Bùi Thị H', 'Female', '1999-04-22', 'https://i.pravatar.cc/150?img=15'),
(10, N'Hồ Văn K', 'Male', '1991-08-12', 'https://i.pravatar.cc/150?img=16');
GO

-- 🏠 3. ĐỊA CHỈ (USER ADDRESSES) - ĐÃ SỬA LẠI
INSERT INTO UserAddresses (
    AccountID, 
    AddressName,        -- Tên gợi nhớ (MỚI)
    ReceiverFullName,   -- Tên người nhận (MỚI)
    ReceiverPhone,      -- SĐT nhận hàng (MỚI)
    AddressLine, 
    Ward,               -- Phường/Xã (MỚI)
    District,           -- Quận/Huyện (thay cho City)
    Province, 
    IsDefault
) VALUES
-- (Giả định AccountID 2 là 'Nguyễn Văn User' và SĐT '0901111111')
(2, N'Nhà riêng', N'Nguyễn Văn User', N'0901111111', N'123 Đường Chính', N'Phường Bến Nghé', N'Quận 1', N'TP. Hồ Chí Minh', 1),
(2, N'Công ty', N'Nguyễn Văn User', N'0901111111', N'456 Đường Phụ', N'Phường Tân Phong', N'Quận 7', N'TP. Hồ Chí Minh', 0),

-- (Giả định AccountID 3, 5 là các user khác, tôi tự thêm tên và SĐT)
(3, N'Nhà', N'Trần Thị B', N'0903333333', N'789 Hẻm A', N'Phường 6', N'Quận 3', N'TP. Hồ Chí Minh', 1),
(5, N'Chung cư B', N'Lê Văn C', N'0905555555', N'101 Chung cư B', N'Phường 22', N'Quận Bình Thạnh', N'TP. Hồ Chí Minh', 1);
GO

-- 🏷️ 4. DANH MỤC (CATEGORIES)
-- (3 danh mục cha, 7 danh mục con)
INSERT INTO Categories (CategoryName, ParentCategoryID) VALUES
(N'Thời trang Nam', NULL),   -- ID 1
(N'Thời trang Nữ', NULL),   -- ID 2
(N'Phụ kiện', NULL);         -- ID 3
GO
INSERT INTO Categories (CategoryName, ParentCategoryID) VALUES
(N'Áo Nam', 1),              -- ID 4
(N'Quần Nam', 1),              -- ID 5
(N'Áo Nữ', 2),                -- ID 6
(N'Váy Nữ', 2),                -- ID 7
(N'Đồng hồ', 3),              -- ID 8
(N'Túi xách', 3),              -- ID 9
(N'Giày Nam', 1);              -- ID 10
GO

-- 👕 5. SẢN PHẨM (PRODUCTS)
INSERT INTO Products (CategoryID, Name, Description, Price, StockQuantity) VALUES
(4, N'Áo Sơ Mi Nam Trắng Lụa', N'Vải lụa cao cấp, không nhăn, mát mẻ.', 450000, 100), -- ID 1
(5, N'Quần Jeans Nam Skinny', N'Chất liệu co giãn, thoải mái.', 680000, 50), -- ID 2
(6, N'Áo Thun Nữ Cổ Tròn', N'100% Cotton, thấm hút mồ hôi.', 250000, 200), -- ID 3
(7, N'Váy Hoa Nữ Vintage', N'Họa tiết hoa nhí, phong cách Hàn Quốc.', 550000, 70), -- ID 4
(8, N'Đồng hồ Nam Chronograph', N'Dây thép không gỉ, chống nước 5ATM.', 2300000, 20), -- ID 5
(9, N'Túi Đeo Chéo Nữ Da Thật', N'Da bò thật 100%, bảo hành 5 năm.', 1200000, 30), -- ID 6
(10, N'Giày Sneaker Nam Trắng', N'Đế cao su, phù hợp mọi hoạt động.', 850000, 80), -- ID 7
(4, N'Áo Polo Nam Co Giãn', N'Vải cá sấu 4 chiều.', 380000, 150), -- ID 8
(5, N'Quần Kaki Nam Ống Đứng', N'Màu be, vải dày dặn.', 520000, 60), -- ID 9
(6, N'Áo Croptop Nữ Tay Dài', N'Chất liệu len tăm mềm mại.', 310000, 100); -- ID 10
GO

-- 🖼️ 6. ẢNH SẢN PHẨM (PRODUCT IMAGES)
INSERT INTO ProductImages (ProductID, ImageURL, IsPrimary) VALUES
(1, N'https://example.com/images/aosomi1_main.jpg', 1),
(1, N'https://example.com/images/aosomi1_sub1.jpg', 0),
(1, N'https://example.com/images/aosomi1_sub2.jpg', 0),
(2, N'https://example.com/images/quanjean1_main.jpg', 1),
(3, N'https://example.com/images/aothunnu1_main.jpg', 1),
(4, N'https://example.com/images/vayhoa1_main.jpg', 1),
(5, N'https://example.com/images/dongho1_main.jpg', 1);
GO

-- 🌈 7. BIẾN THỂ (PRODUCT VARIANTS)
INSERT INTO ProductVariants (ProductID, VariantName, SKU, Price, StockQuantity) VALUES
(1, N'Size M', 'AOSOMI-TRANG-M', 450000, 50), -- ID 1
(1, N'Size L', 'AOSOMI-TRANG-L', 450000, 50), -- ID 2
(2, N'Size 30', 'QUANJEAN-SKINNY-30', 680000, 25), -- ID 3
(2, N'Size 32', 'QUANJEAN-SKINNY-32', 680000, 25), -- ID 4
(3, N'Màu Trắng', 'AOTHUN-NU-TRANG', 250000, 100), -- ID 5
(3, N'Màu Đen', 'AOTHUN-NU-DEN', 250000, 100); -- ID 6
GO

-- 🛒 8. GIỎ HÀNG (CARTS) VÀ CHI TIẾT (CART ITEMS)
INSERT INTO Carts (AccountID) VALUES (2), (3), (5); -- Carts for User A, B, D (CartID 1, 2, 3)
GO
INSERT INTO CartItems (CartID, ProductID, VariantID, Quantity) VALUES
(1, 1, 2, 1), -- User A (Cart 1) muốn 1 Áo Sơ Mi (Size L)
(1, 2, 3, 1), -- User A (Cart 1) muốn 1 Quần Jeans (Size 30)
(2, 3, 5, 2), -- User B (Cart 2) muốn 2 Áo Thun (Màu Trắng)
(3, 10, NULL, 1); -- User D (Cart 3) muốn 1 Áo Croptop (ko có variant)
GO

-- 📦 9. ĐƠN HÀNG (ORDERS) VÀ CHI TIẾT (ORDER DETAILS)
-- Order 1 (Delivered) cho User A (AccountID 2), dùng Address 1
INSERT INTO Orders (AccountID, AddressID, TotalAmount, Status) 
VALUES (2, 1, 1130000, 'Delivered'); -- OrderID 1
INSERT INTO OrderDetails (OrderID, ProductID, VariantID, Quantity, UnitPrice) VALUES
(1, 1, 2, 1, 450000), -- Áo Sơ Mi (Size L)
(1, 2, 3, 1, 680000); -- Quần Jeans (Size 30)

-- Order 2 (Shipped) cho User B (AccountID 3), dùng Address 3
INSERT INTO Orders (AccountID, AddressID, TotalAmount, Status) 
VALUES (3, 3, 750000, 'Shipped'); -- OrderID 2
INSERT INTO OrderDetails (OrderID, ProductID, VariantID, Quantity, UnitPrice) VALUES
(2, 3, 5, 3, 250000); -- 3 Áo Thun (Màu Trắng)

-- Order 3 (Pending) cho User A (AccountID 2), dùng Address 1
INSERT INTO Orders (AccountID, AddressID, TotalAmount, Status) 
VALUES (2, 1, 550000, 'Pending'); -- OrderID 3
INSERT INTO OrderDetails (OrderID, ProductID, VariantID, Quantity, UnitPrice) VALUES
(3, 4, NULL, 1, 550000); -- 1 Váy Hoa (ko có variant)

-- Order 4 (Cancelled) cho User D (AccountID 5)
INSERT INTO Orders (AccountID, AddressID, TotalAmount, Status) 
VALUES (5, 4, 310000, 'Cancelled'); -- OrderID 4
INSERT INTO OrderDetails (OrderID, ProductID, VariantID, Quantity, UnitPrice) VALUES
(4, 10, NULL, 1, 310000); -- 1 Áo Croptop
GO

-- 💳 10. THANH TOÁN (PAYMENTS)
INSERT INTO Payments (OrderID, Method, Amount, PaymentStatus) VALUES
(1, 'CreditCard', 1130000, 'Paid'),
(2, 'COD', 750000, 'Pending'),
(3, 'BankTransfer', 550000, 'Paid'),
(4, 'COD', 310000, 'Failed');
GO

-- ⭐ 11. ĐÁNH GIÁ (REVIEWS)
INSERT INTO Reviews (ProductID, AccountID, Rating, Comment) VALUES
(1, 2, 5, N'Áo rất đẹp, vải mịn, không nhăn. Rất hài lòng!'),
(2, 2, 4, N'Quần co giãn tốt, mặc thoải mái.'),
(3, 3, 5, N'Áo thun chất lượng, giao hàng nhanh.'),
(1, 3, 3, N'Áo cũng được, nhưng size L hơi rộng so với mình.'),
(4, 2, 5, N'Váy xinh, mặc lên tôn dáng.'),
(5, 2, 5, N'Đồng hồ xịn, đáng tiền.');
GO

-- 💖 12. WISHLIST
INSERT INTO Wishlists (AccountID, ProductID) VALUES
(2, 5), -- User A thích Đồng hồ
(2, 6), -- User A thích Túi xách
(3, 1), -- User B thích Áo Sơ Mi
(5, 7); -- User D thích Giày
GO

-- 🎁 13. VOUCHER
INSERT INTO Vouchers (Code, Description, DiscountPercent, MinOrderAmount, StartDate, EndDate) VALUES
('GIAM10', N'Giảm 10% cho đơn hàng từ 500k', 10.00, 500000, GETDATE(), DATEADD(month, 1, GETDATE())),
('FREESHIP', N'Miễn phí vận chuyển', 0.00, 200000, GETDATE(), DATEADD(month, 1, GETDATE())),
('BLACKFRIDAY', N'Giảm 50% (đã hết hạn)', 50.00, 1000000, DATEADD(year, -1, GETDATE()), DATEADD(month, -11, GETDATE())),
('WELCOME', N'Giảm 50k cho thành viên mới', 0.00, 300000, GETDATE(), DATEADD(month, 3, GETDATE()));
GO

-- 💬 14. CHAT (ROOMS, MESSAGES, ATTACHMENTS)
-- Room 1 (User A vs Admin)
INSERT INTO ChatRooms (CustomerID, AdminID, IsClosed) VALUES (2, 1, 0); -- RoomID 1
INSERT INTO ChatMessages (RoomID, SenderID, MessageText) VALUES
(1, 2, N'Shop ơi, đơn hàng #3 của mình sao rồi?'),
(1, 1, N'Chào bạn, đơn #3 đang được đóng gói ạ.'),
(1, 2, N'Ok shop, cảm ơn.');

-- Room 2 (User B vs Admin)
INSERT INTO ChatRooms (CustomerID, AdminID, IsClosed) VALUES (3, 1, 0); -- RoomID 2
INSERT INTO ChatMessages (RoomID, SenderID, MessageText) VALUES
(2, 3, N'Tôi muốn hỏi về chính sách bảo hành đồng hồ'),
(2, 1, N'Dạ, shop bảo hành 12 tháng cho tất cả sản phẩm đồng hồ ạ.'),
(2, 1, N'Bạn cần file PDF chi tiết không?');
INSERT INTO ChatAttachments (MessageID, FileURL, FileType)
VALUES (6, 'https://example.com/baohanh.pdf', 'application/pdf'); -- Đính kèm vào tin nhắn ID 6

-- Room 3 (User D, chưa có admin rep)
INSERT INTO ChatRooms (CustomerID, AdminID, IsClosed) VALUES (5, NULL, 0); -- RoomID 3
INSERT INTO ChatMessages (RoomID, SenderID, MessageText) VALUES
(3, 5, N'Túi xách da thật (ID 6) có hàng không shop?');
GO

PRINT '*** HOÀN TẤT CHÈN 100+ DỮ LIỆU MẪU ***';