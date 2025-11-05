using System.Collections.Generic; // <- QUAN TRỌNG

namespace backend.DTOs
{
    // DTO chính: Gói bọc toàn bộ dữ liệu cho trang chi tiết
    public class CustomerDetailDto
    {
        // 1. Thông tin cơ bản (cho cột phải)
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string RegisteredDate { get; set; }
        public bool IsActive { get; set; }

        // 2. Danh sách đơn hàng (cho cột trái)
        public IEnumerable<CustomerOrderDto> Orders { get; set; }

        // 3. Danh sách địa chỉ (cho cột trái)
        public IEnumerable<CustomerAddressDto> Addresses { get; set; }
    }
}