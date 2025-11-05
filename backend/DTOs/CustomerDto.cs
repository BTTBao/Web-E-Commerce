namespace backend.DTOs
{
    public class CustomerDto
    {
        public string Id { get; set; } = string.Empty;

        public string Username { get; set; } = string.Empty; 
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? FullName { get; set; }
        public string RegisteredDate { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int TotalOrders { get; set; }
    }
}