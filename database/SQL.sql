-- Xóa và tạo lại database
DROP DATABASE IF EXISTS Skynet_commerce;
GO
CREATE DATABASE Skynet_commerce;
GO
USE Skynet_commerce;
GO


-- 🧍 Tài khoản người dùng
CREATE TABLE Accounts (
    AccountID INT IDENTITY(1,1) PRIMARY KEY,
    PasswordHash NVARCHAR(255) NOT NULL,
    Email NVARCHAR(150) UNIQUE,
    Phone NVARCHAR(10) UNIQUE,
    CreatedAt DATETIME DEFAULT GETDATE(),
    role int default 0,
    IsActive BIT NOT NULL DEFAULT 1
);

-- 🏠 Thông tin người dùng

CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    AccountID INT UNIQUE,
    FullName NVARCHAR(150),
    Gender NVARCHAR(10) CHECK (Gender IN ('Male','Female','Other')),
    AvatarURL NVARCHAR(500),
    AvatarPublicId NVARCHAR(255),
    DateOfBirth DATE,
    FOREIGN KEY (AccountID) REFERENCES Accounts(AccountID) ON DELETE CASCADE
);

CREATE TABLE UserAddresses (
    AddressID INT IDENTITY(1,1) PRIMARY KEY,
    AccountID INT NOT NULL,

    AddressName NVARCHAR(100) DEFAULT N'Địa chỉ', -- Tên gợi nhớ: "Nhà riêng", "Công ty"
    ReceiverFullName NVARCHAR(150) NOT NULL,   -- Tên người nhận tại địa chỉ này
    ReceiverPhone NVARCHAR(10) NOT NULL,       -- SĐT người nhận tại địa chỉ này

    AddressLine NVARCHAR(255) NOT NULL, -- Số nhà, tên đường
    Ward NVARCHAR(100) NOT NULL,         -- Phường/Xã
    District NVARCHAR(100) NOT NULL,     -- Quận/Huyện
    Province NVARCHAR(100) NOT NULL,     -- Tỉnh/Thành phố
    
    IsDefault BIT DEFAULT 0,
    FOREIGN KEY (AccountID) REFERENCES Accounts(AccountID) ON DELETE CASCADE
);
GO

-- 🏷️ Danh mục sản phẩm
CREATE TABLE Categories (
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(150) NOT NULL,
    ParentCategoryID INT NULL,
    -- Đã sửa: Sử dụng NO ACTION để tránh lỗi chu kỳ
    FOREIGN KEY (ParentCategoryID) REFERENCES Categories(CategoryID) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- 👕 Sản phẩm
CREATE TABLE Products (
    ProductID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryID INT,
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
    Price DECIMAL(12,2) CHECK (Price >= 0),
    StockQuantity INT DEFAULT 0 CHECK (StockQuantity >= 0),
    SoldCount INT DEFAULT 0,
    Status NVARCHAR(20) CHECK (Status IN ('Active','Hidden','OutOfStock')) DEFAULT 'Active',
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID) ON DELETE SET NULL
);

CREATE TABLE ProductImages (
    ImageID INT IDENTITY(1,1) PRIMARY KEY,
    ProductID INT NOT NULL,
    ImageURL NVARCHAR(500) NOT NULL,
    ImagePublicId NVARCHAR(255),
    IsPrimary BIT DEFAULT 0,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE
);

-- 🌈 Biến thể (size, màu)
CREATE TABLE ProductVariants (
    VariantID INT IDENTITY(1,1) PRIMARY KEY,
    ProductID INT NOT NULL,
    
    -- === ĐÃ THAY ĐỔI ===
    -- Đã xóa "VariantName" và thay bằng 2 cột này
    Size NVARCHAR(50) NULL,
    Color NVARCHAR(50) NULL,
    -- ====================

    SKU NVARCHAR(100) UNIQUE,
    Price DECIMAL(12,2) CHECK (Price >= 0),
    StockQuantity INT DEFAULT 0 CHECK (StockQuantity >= 0),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE
);

-- 🛒 Giỏ hàng
CREATE TABLE Carts (
    CartID INT IDENTITY(1,1) PRIMARY KEY,
    AccountID INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (AccountID) REFERENCES Accounts(AccountID) ON DELETE CASCADE
);

CREATE TABLE CartItems (
    CartItemID INT IDENTITY(1,1) PRIMARY KEY,
    CartID INT NOT NULL,
    ProductID INT NOT NULL,
    VariantID INT NULL,
    Quantity INT CHECK (Quantity > 0),
    AddedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CartID) REFERENCES Carts(CartID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE,
    -- Đã sửa: Dùng NO ACTION để phá vỡ chuỗi cascade xung đột
    FOREIGN KEY (VariantID) REFERENCES ProductVariants(VariantID) ON DELETE NO ACTION -- ON UPDATE NO ACTION
);

-- 📦 Đơn hàng
CREATE TABLE Orders (
    OrderID INT IDENTITY(1,1) PRIMARY KEY,
    AccountID INT NOT NULL,
    AddressID INT,
    TotalAmount DECIMAL(12,2) CHECK (TotalAmount >= 0),
    Status NVARCHAR(20) CHECK (Status IN ('Pending','Confirmed','Shipped','Delivered','Cancelled')) DEFAULT 'Pending',
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (AccountID) REFERENCES Accounts(AccountID) ON DELETE CASCADE,
    -- Đã sửa: Dùng NO ACTION để phá vỡ chuỗi cascade xung đột
    FOREIGN KEY (AddressID) REFERENCES UserAddresses(AddressID) ON DELETE NO ACTION -- ON UPDATE NO ACTION
);

CREATE TABLE OrderDetails (
    OrderDetailID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT NOT NULL,
    ProductID INT NOT NULL,
    VariantID INT NULL,
    Quantity INT CHECK (Quantity > 0),
    UnitPrice DECIMAL(12,2) CHECK (UnitPrice >= 0),
    SubTotal AS (Quantity * UnitPrice) PERSISTED,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE,
    -- Đã sửa: Dùng NO ACTION để phá vỡ chuỗi cascade xung đột
    FOREIGN KEY (VariantID) REFERENCES ProductVariants(VariantID) ON DELETE NO ACTION -- ON UPDATE NO ACTION
);

-- 💳 Thanh toán
CREATE TABLE Payments (
    PaymentID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT NOT NULL,
    Method NVARCHAR(20) CHECK (Method IN ('COD','CreditCard','BankTransfer')) DEFAULT 'COD',
    Amount DECIMAL(12,2) CHECK (Amount >= 0),
    PaymentStatus NVARCHAR(20) CHECK (PaymentStatus IN ('Pending','Paid','Failed')) DEFAULT 'Pending',
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE
);

-- ⭐ Đánh giá
CREATE TABLE Reviews (
    ReviewID INT IDENTITY(1,1) PRIMARY KEY,
    ProductID INT NOT NULL,
    AccountID INT NOT NULL,
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    Comment NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
	  Status NVARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Approved')),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE,
    FOREIGN KEY (AccountID) REFERENCES Accounts(AccountID) ON DELETE CASCADE
);

-- 💖 Wishlist
CREATE TABLE Wishlists (
    WishlistID INT IDENTITY(1,1) PRIMARY KEY,
    AccountID INT NOT NULL,
    ProductID INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (AccountID) REFERENCES Accounts(AccountID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE,
    CONSTRAINT UQ_Wishlist UNIQUE (AccountID, ProductID)
);

-- 🎁 Voucher
CREATE TABLE Vouchers (
    VoucherID INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(50) UNIQUE NOT NULL,
    Description NVARCHAR(MAX),
    DiscountPercent DECIMAL(5,2) CHECK (DiscountPercent >= 0),
    MinOrderAmount DECIMAL(12,2) DEFAULT 0,
    StartDate DATETIME,
    EndDate DATETIME
);

-- 1️⃣ Phòng chat (giữa admin và 1 user)
CREATE TABLE ChatRooms (
    RoomID INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID INT NOT NULL,       -- khách
    AdminID INT NULL,              -- admin xử lý (nếu có)
    CreatedAt DATETIME DEFAULT GETDATE(),
    IsClosed BIT DEFAULT 0,
    FOREIGN KEY (CustomerID) REFERENCES Accounts(AccountID) ON DELETE CASCADE,
    -- Đã sửa: Dùng NO ACTION để phá vỡ chuỗi cascade xung đột
    FOREIGN KEY (AdminID) REFERENCES Accounts(AccountID) ON DELETE NO ACTION -- ON UPDATE NO ACTION
);

CREATE TABLE ChatMessages (
    MessageID INT IDENTITY(1,1) PRIMARY KEY,
    RoomID INT NOT NULL,
    SenderID INT NOT NULL,          -- ai gửi (admin hay khách)
    MessageText NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),

    -- Giữ cascade này: Xóa phòng thì xóa tin nhắn
    FOREIGN KEY (RoomID) REFERENCES ChatRooms(RoomID) ON DELETE CASCADE,
    
    -- Sửa lỗi: Bỏ cascade ở đây để tránh tạo chu kỳ. 
    -- NO ACTION là mặc định, bạn có thể ghi rõ hoặc bỏ trống.
    FOREIGN KEY (SenderID) REFERENCES Accounts(AccountID) ON DELETE NO ACTION
);

-- 3️⃣ (Tuỳ chọn) Đính kèm ảnh hoặc file
CREATE TABLE ChatAttachments (
    AttachmentID INT IDENTITY(1,1) PRIMARY KEY,
    MessageID INT NOT NULL,
    FileURL NVARCHAR(500),
    FilePublicId NVARCHAR(255),
    FileType NVARCHAR(50),
    FOREIGN KEY (MessageID) REFERENCES ChatMessages(MessageID) ON DELETE CASCADE
);

USE master;
ALTER DATABASE Skynet_commerce SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
DROP DATABASE Skynet_commerce;