/*
================================================================
TỆP DỮ LIỆU MẪU CHO DATABASE Skynet_commerce
CHỦ ĐỀ: THỜI TRANG STREETWEAR (DIRTY COINS)
================================================================
Giả định:
- AccountID 1 là Admin.
- AccountID 2-10 là Khách hàng.
- Các ID tự tăng (IDENTITY) sẽ bắt đầu từ 1.
================================================================
*/
USE Skynet_commerce;
GO

-- 1. 🧍 Tài khoản người dùng (10 bản ghi)
-- Giữ nguyên 10 người dùng cơ bản
INSERT INTO Accounts (Username, PasswordHash, Email, Phone)
VALUES
('admin', 'hash_admin_pw', 'admin@skynet.com', '0900000001'),
('annguyen', 'hash_user_pw', 'an.nguyen@email.com', '0900000002'),
('binhle', 'hash_user_pw', 'binh.le@email.com', '0900000003'),
('chautran', 'hash_user_pw', 'chau.tran@email.com', '0900000004'),
('duypham', 'hash_user_pw', 'duy.pham@email.com', '0900000005'),
('giangho', 'hash_user_pw', 'giang.ho@email.com', '0900000006'),
('huongdo', 'hash_user_pw', 'huong.do@email.com', '0900000007'),
('khanhvu', 'hash_user_pw', 'khanh.vu@email.com', '0900000008'),
('linhngo', 'hash_user_pw', 'linh.ngo@email.com', '0900000009'),
('minhvo', 'hash_user_pw', 'minh.vo@email.com', '0900000010');
GO

-- 2. 🏠 Thông tin người dùng (10 bản ghi)
INSERT INTO Users (AccountID, FullName, Gender, AvatarURL)
VALUES
(1, N'Quản Trị Viên', 'Other', 'https://picsum.photos/seed/admin_dc/200'),
(2, N'Nguyễn Văn An', 'Male', 'https://picsum.photos/seed/annguyen_dc/200'),
(3, N'Lê Thị Bình', 'Female', 'https://picsum.photos/seed/binhle_dc/200'),
(4, N'Trần Ngọc Châu', 'Female', 'https://picsum.photos/seed/chautran_dc/200'),
(5, N'Phạm Minh Duy', 'Male', 'https://picsum.photos/seed/duypham_dc/200'),
(6, N'Hồ Thu Giang', 'Female', 'https://picsum.photos/seed/giangho_dc/200'),
(7, N'Đỗ Thái Hương', 'Female', 'https://picsum.photos/seed/huongdo_dc/200'),
(8, N'Vũ Gia Khánh', 'Male', 'https://picsum.photos/seed/khanhvu_dc/200'),
(9, N'Ngô Thùy Linh', 'Female', 'https://picsum.photos/seed/linhngo_dc/200'),
(10, N'Võ An Minh', 'Male', 'https://picsum.photos/seed/minhvo_dc/200');
GO

-- 3. 🏠 Địa chỉ người dùng (12 bản ghi)
INSERT INTO UserAddresses (AccountID, AddressLine, City, Province, IsDefault)
VALUES
(2, N'123 Đường ABC', N'Quận 1', N'TP. Hồ Chí Minh', 1),
(3, N'456 Đường XYZ', N'Quận Hoàn Kiếm', N'Hà Nội', 1),
(3, N'789 Đường DEF', N'Quận Ba Đình', N'Hà Nội', 0),
(4, N'101 Đường GHI', N'Quận Hải Châu', N'Đà Nẵng', 1),
(5, N'202 Đường JKL', N'Quận 3', N'TP. Hồ Chí Minh', 1),
(6, N'303 Đường MNO', N'Quận 5', N'TP. Hồ Chí Minh', 1),
(7, N'404 Đường PQR', N'Quận Cầu Giấy', N'Hà Nội', 1),
(8, N'505 Đường STU', N'Quận 10', N'TP. Hồ Chí Minh', 1),
(9, N'606 Đường VWX', N'Quận Tân Bình', N'TP. Hồ Chí Minh', 1),
(9, N'707 Đường UVW', N'Quận Gò Vấp', N'TP. Hồ Chí Minh', 0),
(10, N'808 Đường YZ', N'Quận Thanh Khê', N'Đà Nẵng', 1),
(2, N'909 Đường KTX', N'Quận Thủ Đức', N'TP. Hồ Chí Minh', 0);
GO

-- 4. 🏷️ Danh mục sản phẩm (10 bản ghi) - THEME DIRTY COINS
INSERT INTO Categories (CategoryName, ParentCategoryID)
VALUES
(N'Áo (Tops)', NULL),             -- ID 1
(N'Quần (Bottoms)', NULL),           -- ID 2
(N'Áo khoác (Outerwear)', NULL),    -- ID 3
(N'Phụ kiện (Accessories)', NULL);  -- ID 4
GO
INSERT INTO Categories (CategoryName, ParentCategoryID)
VALUES
(N'T-Shirts', 1),                -- ID 5
(N'Hoodies & Sweatshirts', 1),   -- ID 6
(N'Pants & Shorts', 2),          -- ID 7
(N'Jackets', 3),                 -- ID 8
(N'Bags & Backpacks', 4),        -- ID 9
(N'Caps & Beanies', 4);          -- ID 10
GO

-- 5. 👕 Sản phẩm (13 bản ghi) - THEME DIRTY COINS
-- Giả sử ProductID sẽ từ 1-13
INSERT INTO Products (CategoryID, Name, Description, Price, StockQuantity, SoldCount, Status)
VALUES
(5, N'DirtyCoins Logo T-Shirt - Black', N'Áo thun 100% cotton, in logo "Y" đặc trưng.', 450000, 150, 50, 'Active'), -- ID 1
(5, N'DirtyCoins Graphic Tee "Chaos" - White', N'Áo thun form oversized, artwork "Chaos" in nổi.', 520000, 100, 30, 'Active'), -- ID 2
(6, N'DirtyCoins Oversized Hoodie "Signature"', N'Áo hoodie nỉ bông, form rộng, logo "Y" thêu nổi.', 790000, 80, 25, 'Active'), -- ID 3
(6, N'DirtyCoins Star Sweatshirt - Baby Blue', N'Áo sweatshirt nỉ, họa tiết ngôi sao.', 690000, 60, 15, 'Active'), -- ID 4
(8, N'DirtyCoins Coach Jacket - Black', N'Áo khoác dù 2 lớp, chống nước nhẹ, logo "Y" in sau lưng.', 1150000, 40, 10, 'Active'), -- ID 5
(8, N'DirtyCoins Puffer Jacket - Grey', N'Áo khoác phao dày dặn, giữ ấm tốt.', 1490000, 20, 5, 'Active'), -- ID 6
(7, N'DirtyCoins Cargo Pants - Beige', N'Quần cargo kaki, nhiều túi, form baggy.', 850000, 70, 22, 'Active'), -- ID 7
(7, N'DirtyCoins Denim Shorts - Washed', N'Quần short jeans, mài rách nhẹ.', 550000, 90, 40, 'Active'), -- ID 8
(9, N'DirtyCoins Logo Backpack', N'Balo chất liệu polyester, nhiều ngăn, có ngăn laptop.', 750000, 50, 18, 'Active'), -- ID 9
(9, N'DirtyCoins Mini Bowler Bag', N'Túi trống mini, chất liệu da PU.', 490000, 60, 35, 'Active'), -- ID 10
(10, N'DirtyCoins "Y" Logo Cap - Black', N'Nón lưỡi trai, logo "Y" thêu 3D.', 390000, 120, 60, 'Active'), -- ID 11
(10, N'DirtyCoins Beanie - Red', N'Nón len beanie, logo tag may.', 290000, 80, 20, 'Active'), -- ID 12
(5, N'DirtyCoins Spray Logo Tee - Tan', N'Áo thun hiệu ứng phun sơn.', 480000, 0, 10, 'OutOfStock'); -- ID 13
GO

-- 6. 🖼️ Ảnh sản phẩm (32 bản ghi)
INSERT INTO ProductImages (ProductID, ImageURL, IsPrimary)
VALUES
(1, 'https://picsum.photos/seed/dc_tee_black1/600/600', 1),
(1, 'https://picsum.photos/seed/dc_tee_black2/600/600', 0),
(2, 'https://picsum.photos/seed/dc_tee_white1/600/600', 1),
(2, 'https://picsum.photos/seed/dc_tee_white2/600/600', 0),
(2, 'https://picsum.photos/seed/dc_tee_white3/600/600', 0),
(3, 'https://picsum.photos/seed/dc_hoodie_sig1/600/600', 1),
(3, 'https://picsum.photos/seed/dc_hoodie_sig2/600/600', 0),
(3, 'https://picsum.photos/seed/dc_hoodie_sig3/600/600', 0),
(4, 'https://picsum.photos/seed/dc_sweat_blue1/600/600', 1),
(4, 'https://picsum.photos/seed/dc_sweat_blue2/600/600', 0),
(5, 'https://picsum.photos/seed/dc_coach_jacket1/600/600', 1),
(5, 'https://picsum.photos/seed/dc_coach_jacket2/600/600', 0),
(6, 'https://picsum.photos/seed/dc_puffer1/600/600', 1),
(6, 'https://picsum.photos/seed/dc_puffer2/600/600', 0),
(7, 'https://picsum.photos/seed/dc_cargo_beige1/600/600', 1),
(7, 'https://picsum.photos/seed/dc_cargo_beige2/600/600', 0),
(7, 'https://picsum.photos/seed/dc_cargo_beige3/600/600', 0),
(8, 'https://picsum.photos/seed/dc_denim_short1/600/600', 1),
(8, 'https://picsum.photos/seed/dc_denim_short2/600/600', 0),
(9, 'https://picsum.photos/seed/dc_backpack1/600/600', 1),
(9, 'https://picsum.photos/seed/dc_backpack2/600/600', 0),
(9, 'https://picsum.photos/seed/dc_backpack3/600/600', 0),
(10, 'https://picsum.photos/seed/dc_minibag1/600/600', 1),
(10, 'https://picsum.photos/seed/dc_minibag2/600/600', 0),
(11, 'https://picsum.photos/seed/dc_cap_black1/600/600', 1),
(11, 'https://picsum.photos/seed/dc_cap_black2/600/600', 0),
(12, 'https://picsum.photos/seed/dc_beanie_red1/600/600', 1),
(12, 'https://picsum.photos/seed/dc_beanie_red2/600/600', 0),
(13, 'https://picsum.photos/seed/dc_tee_spray1/600/600', 1),
(13, 'https://picsum.photos/seed/dc_tee_spray2/600/600', 0),
(13, 'https://picsum.photos/seed/dc_tee_spray3/600/600', 0),
(1, 'https://picsum.photos/seed/dc_tee_black3/600/600', 0);
GO

-- 7. 🌈 Biến thể sản phẩm (26 bản ghi) - THEME DIRTY COINS
INSERT INTO ProductVariants (ProductID, VariantName, SKU, Price, StockQuantity)
VALUES
-- Áo thun (ID 1, 2)
(1, N'Size M', 'DC-LOGO-BLK-M', 450000, 50), -- ID 1
(1, N'Size L', 'DC-LOGO-BLK-L', 450000, 50), -- ID 2
(1, N'Size XL', 'DC-LOGO-BLK-XL', 450000, 50), -- ID 3
(2, N'Size M', 'DC-CHAOS-WHT-M', 520000, 50), -- ID 4
(2, N'Size L', 'DC-CHAOS-WHT-L', 520000, 50), -- ID 5
-- Hoodies (ID 3, 4)
(3, N'Size M', 'DC-HOOD-SIG-M', 790000, 40), -- ID 6
(3, N'Size L', 'DC-HOOD-SIG-L', 790000, 40), -- ID 7
(4, N'Size M', 'DC-SWEAT-STAR-M', 690000, 30), -- ID 8
(4, N'Size L', 'DC-SWEAT-STAR-L', 690000, 30), -- ID 9
-- Jackets (ID 5, 6)
(5, N'Size M', 'DC-COACH-BLK-M', 1150000, 20), -- ID 10
(5, N'Size L', 'DC-COACH-BLK-L', 1150000, 20), -- ID 11
(6, N'Size L', 'DC-PUFFER-GRY-L', 1490000, 10), -- ID 12
(6, N'Size XL', 'DC-PUFFER-GRY-XL', 1490000, 10), -- ID 13
-- Quần (ID 7, 8)
(7, N'Size 29', 'DC-CARGO-BEI-29', 850000, 20), -- ID 14
(7, N'Size 30', 'DC-CARGO-BEI-30', 850000, 20), -- ID 15
(7, N'Size 31', 'DC-CARGO-BEI-31', 850000, 30), -- ID 16
(8, N'Size 29', 'DC-DENIM-WSH-29', 550000, 30), -- ID 17
(8, N'Size 30', 'DC-DENIM-WSH-30', 550000, 30), -- ID 18
(8, N'Size 31', 'DC-DENIM-WSH-31', 550000, 30), -- ID 19
-- Áo thun (ID 1) thêm màu
(1, N'Size M - White', 'DC-LOGO-WHT-M', 450000, 50), -- ID 20
(1, N'Size L - White', 'DC-LOGO-WHT-L', 450000, 50), -- ID 21
(1, N'Size XL - White', 'DC-LOGO-WHT-XL', 450000, 50), -- ID 22
-- Áo thun (ID 13) hết hàng
(13, N'Size M', 'DC-SPRAY-TAN-M', 480000, 0), -- ID 23
(13, N'Size L', 'DC-SPRAY-TAN-L', 480000, 0), -- ID 24
-- Hoodie (ID 3) thêm màu
(3, N'Size M - Grey', 'DC-HOOD-SIG-GRY-M', 790000, 30), -- ID 25
(3, N'Size L - Grey', 'DC-HOOD-SIG-GRY-L', 790000, 30); -- ID 26
GO

-- 8. 🛒 Giỏ hàng (5 bản ghi)
INSERT INTO Carts (AccountID)
VALUES
(2), (3), (4), (5), (8);
GO -- Giả sử CartID 1-5

-- 9. 🛒 Mặt hàng trong giỏ (8 bản ghi)
INSERT INTO CartItems (CartID, ProductID, VariantID, Quantity)
VALUES
(1, 3, 6, 1),  -- Khách 2: 1 Hoodie Signature M (CartID 1, ProductID 3, VariantID 6)
(1, 1, 1, 2),  -- Khách 2: 2 T-Shirt Logo Black M (CartID 1, ProductID 1, VariantID 1)
(2, 8, 18, 1), -- Khách 3: 1 Denim Short 30 (CartID 2, ProductID 8, VariantID 18)
(3, 10, NULL, 1), -- Khách 4: 1 Mini Bowler Bag (CartID 3, ProductID 10)
(3, 11, NULL, 1), -- Khách 4: 1 Logo Cap (CartID 3, ProductID 11)
(4, 5, 11, 1), -- Khách 5: 1 Coach Jacket L (CartID 4, ProductID 5, VariantID 11)
(5, 7, 15, 1), -- Khách 8: 1 Cargo Pants 30 (CartID 5, ProductID 7, VariantID 15)
(5, 2, 4, 1);  -- Khách 8: 1 Graphic Tee "Chaos" M (CartID 5, ProductID 2, VariantID 4)
GO

-- 10. 📦 Đơn hàng (5 bản ghi)
INSERT INTO Orders (AccountID, AddressID, TotalAmount, Status)
VALUES
(6, 6, 1490000, 'Delivered'), -- Khách 6, AddressID 6
(7, 7, 1240000, 'Shipped'),   -- Khách 7, AddressID 7
(9, 9, 850000, 'Confirmed'), -- Khách 9, AddressID 9
(10, 11, 780000, 'Pending'),   -- Khách 10, AddressID 11
(6, 6, 450000, 'Cancelled'); -- Khách 6, AddressID 6 (đơn khác)
GO -- Giả sử OrderID 1-5

-- 11. 📦 Chi tiết đơn hàng (8 bản ghi)
INSERT INTO OrderDetails (OrderID, ProductID, VariantID, Quantity, UnitPrice)
VALUES
-- Order 1 (Total 1.49M)
(1, 6, 12, 1, 1490000), -- 1 Puffer Jacket L
-- Order 2 (Total 1.24M)
(2, 4, 8, 1, 690000),  -- 1 Sweatshirt Star M
(2, 1, 20, 1, 450000), -- 1 T-Shirt Logo White M
-- Order 3 (Total 850k)
(3, 7, 14, 1, 850000),  -- 1 Cargo Pants 29
-- Order 4 (Total 780k)
(4, 11, NULL, 2, 390000), -- 2 Logo Cap
-- Order 5 (Cancelled)
(5, 1, 1, 1, 450000);  -- 1 T-Shirt Logo Black M
GO

-- 12. 💳 Thanh toán (4 bản ghi)
INSERT INTO Payments (OrderID, Method, Amount, PaymentStatus)
VALUES
(1, 'CreditCard', 1490000, 'Paid'),
(2, 'COD', 1240000, 'Pending'),
(3, 'BankTransfer', 850000, 'Paid'),
(4, 'COD', 780000, 'Pending');
GO

-- 13. ⭐ Đánh giá (5 bản ghi) - THEME DIRTY COINS
INSERT INTO Reviews (ProductID, AccountID, Rating, Comment)
VALUES
(6, 6, 5, N'Áo phao ấm, form đẹp, đáng tiền. Giao hàng nhanh.'), -- Đơn 1
(4, 7, 4, N'Sweatshirt màu xinh, nỉ bông hơi mỏng tí nhưng mặc Sài Gòn ok.'), -- Đơn 2
(1, 7, 5, N'Áo thun cơ bản, chất vải dày dặn, logo in đẹp.'), -- Đơn 2
(9, 2, 5, N'Balo đựng được laptop 15.6 inch, nhiều ngăn tiện lợi. Rất ưng.'),
(10, 4, 3, N'Túi hơi nhỏ so với tưởng tượng, chỉ đựng được điện thoại, ví tiền.');
GO

-- 14. 💖 Wishlist (6 bản ghi)
INSERT INTO Wishlists (AccountID, ProductID)
VALUES
(2, 3),  -- Khách 2 thích Hoodie Signature
(2, 5),  -- Khách 2 thích Coach Jacket
(3, 7),  -- Khách 3 thích Cargo Pants
(4, 13), -- Khách 4 thích Spray Logo Tee (đang hết hàng)
(5, 6),  -- Khách 5 thích Puffer Jacket
(8, 1);  -- Khách 8 thích T-Shirt Logo
GO

-- 15. 🎁 Voucher (4 bản ghi)
INSERT INTO Vouchers (Code, Description, DiscountPercent, MinOrderAmount, StartDate, EndDate)
VALUES
('DCSALE10', N'Giảm 10% cho đơn hàng trên 1 triệu', 10.00, 1000000, '2025-10-15', '2025-11-15'),
('FREESHIP', N'Miễn phí vận chuyển toàn quốc', 0, 500000, '2025-01-01', '2025-12-31'),
('HELLO_DC', N'Giảm 50K cho khách hàng mới', 0, 300000, '2025-01-01', '2025-12-31'),
('BLACKFRIDAY', N'Voucher Black Friday (hết hạn)', 30.00, 0, '2024-11-20', '2024-11-27');
GO

-- 16. 💬 Phòng chat (3 bản ghi)
INSERT INTO ChatRooms (CustomerID, AdminID, IsClosed)
VALUES
(2, 1, 0), -- Khách 'annguyen' (ID 2) chat với Admin (ID 1)
(3, 1, 0), -- Khách 'binhle' (ID 3) chat với Admin (ID 1)
(4, NULL, 0); -- Khách 'chautran' (ID 4) chat, chưa có admin nhận
GO -- Giả sử RoomID 1-3

-- 17. 💬 Tin nhắn (10 bản ghi) - THEME DIRTY COINS
INSERT INTO ChatMessages (RoomID, SenderID, MessageText)
VALUES
-- Room 1 (Khách 2 & Admin 1)
(1, 2, N'Chào shop, cho mình hỏi áo Hoodie Signature (ID 3) size L còn màu xám không?'),
(1, 1, N'Chào bạn, Hoodie Signature xám (Mã 26) size L shop còn hàng ạ. Bạn đặt ngay nhé.'),
(1, 2, N'Ok, mình lên đơn liền.'),
-- Room 2 (Khách 3 & Admin 1)
(2, 3, N'Shop ơi, mình muốn hỏi về đơn hàng #2'),
(2, 1, N'Dạ, Skynet chào bạn. Đơn hàng #2 của bạn trạng thái đang được vận chuyển, dự kiến 1-2 ngày nữa bạn nhận được ạ.'),
(2, 3, N'Ok shop, mình cảm ơn.'),
-- Room 3 (Khách 4)
(3, 4, N'Mình muốn đổi size áo T-shirt Chaos (ID 2)'),
(3, 4, N'Mình đặt nhầm size L, muốn đổi sang M'),
(3, 1, N'Chào bạn, shop đã nhận được yêu cầu. Bạn vui lòng gửi hàng về địa chỉ...'),
(3, 4, N'Cảm ơn shop');
GO

-- 18. 📎 Đính kèm (2 bản ghi)
INSERT INTO ChatAttachments (MessageID, FileURL, FileType)
VALUES
(8, 'https://example.com/images/screenshot_size_guide.jpg', 'image/jpeg'),
(8, 'https://example.com/images/product_error.png', 'image/png');
GO

PRINT '================================================'
PRINT 'ĐÃ CHÈN DỮ LIỆU MẪU (THEME DIRTY COINS) THÀNH CÔNG!'
PRINT '================================================'