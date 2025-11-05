namespace backend.DTOs
{
    // DTO này định nghĩa 1 khối trong danh sách "Địa chỉ"
    public class CustomerAddressDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsDefault { get; set; }
        public string Address { get; set; }
        public string Phone { get; set; }
    }
}