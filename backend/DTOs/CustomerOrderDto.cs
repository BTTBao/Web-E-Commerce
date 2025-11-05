namespace backend.DTOs
{
    // DTO này định nghĩa 1 dòng trong bảng "Lịch sử đơn hàng"
    public class CustomerOrderDto
    {
        public string Id { get; set; }
        public string Date { get; set; }
        public decimal Total { get; set; }
        public string Status { get; set; }
    }
}