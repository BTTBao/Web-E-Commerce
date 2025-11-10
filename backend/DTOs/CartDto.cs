using backend.Entities;

namespace backend.DTOs
{
    public class CartDto
    {
        public int CartId { get; set; }
        public int AccountId { get; set; }
        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
        public List<CartItemDto> CartItems { get; set; } = new();
    }
}
