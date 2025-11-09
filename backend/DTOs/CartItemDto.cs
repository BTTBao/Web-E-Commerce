namespace backend.DTOs
{
    public class CartItemDto
    {
        public int CartItemId { get; set; }

        public int CartId { get; set; }

        public int ProductId { get; set; }

        public int? VariantId { get; set; }

        public int? Quantity { get; set; }

        public DateTime? AddedAt { get; set; }

        // Thêm các trường hiển thị
        public string? ProductName { get; set; }
        public decimal? Price { get; set; }
        public string? ImageUrl { get; set; }
        public string? VariantName { get; set; }
    }
}
