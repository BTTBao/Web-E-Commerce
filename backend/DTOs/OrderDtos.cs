using System;
using System.Collections.Generic;

// Đổi namespace này cho khớp với dự án của bạn
namespace backend.Dtos
{
    // DTO cho trang danh sách (Orders.jsx)
    // Tên thuộc tính (id, customerName, total...) viết thường
    // để khớp 100% với code React của bạn
    public class OrderListDto
    {
        public string id { get; set; }
        public string customerName { get; set; }
        public DateTime date { get; set; }
        public decimal total { get; set; }
        public string status { get; set; }
        public string paymentStatus { get; set; }
    }

    // --- Các DTO sau dùng cho trang Chi tiết Đơn hàng ---

    // DTO cho địa chỉ
    public class OrderAddressDto
    {
        public string receiverFullName { get; set; }
        public string receiverPhone { get; set; }
        public string addressLine { get; set; }
        public string ward { get; set; }
        public string district { get; set; }
        public string province { get; set; }
    }

    // DTO cho từng sản phẩm trong đơn hàng
    public class OrderDetailItemDto
    {
        public int productId { get; set; }
        public string productName { get; set; }
        public string size { get; set; }
        public string color { get; set; }
        public string imageUrl { get; set; }
        public int quantity { get; set; }
        public decimal unitPrice { get; set; }
        public decimal subTotal { get; set; }
    }

    // DTO cho trang Chi tiết (OrderDetail.jsx)
    public class OrderDetailDto
    {
        public string id { get; set; }
        public string customerName { get; set; }
        public DateTime date { get; set; }
        public decimal total { get; set; }
        public string status { get; set; }
        public string paymentStatus { get; set; }
        public string paymentMethod { get; set; }

        // Thông tin tài khoản đặt hàng
        public string customerEmail { get; set; }
        public string customerPhone { get; set; }
        
        // Địa chỉ giao hàng
        public OrderAddressDto shippingAddress { get; set; }

        // Danh sách sản phẩm
        public List<OrderDetailItemDto> items { get; set; }
    }
    public class UpdateOrderStatusDto
    {
        // Tên "status" phải viết thường
        // để khớp với JSON gửi lên từ React
        public string status { get; set; }
    }
}