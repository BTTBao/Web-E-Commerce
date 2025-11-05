namespace backend.DTOs
{
    public class ProductDto
    {
        public int ProductId { get; set; }
        public int? CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal? Price { get; set; }
        public int? StockQuantity { get; set; }
        public int? SoldCount { get; set; }
        public string? Status { get; set; }
        public DateTime? CreatedAt { get; set; }

        public List<ProductImageDto> ProductImages { get; set; } = new();
        public List<ProductVariantDto> ProductVariants { get; set; } = new();
        public List<ReviewDto> Reviews { get; set; } = new();
    }
    public class ProductImageDto
    {
        public int ImageId { get; set; }
        public int ProductId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public bool? IsPrimary { get; set; }
    }

    public class ProductVariantDto
    {
        public int VariantId { get; set; }
        public int ProductId { get; set; }
        public string? VariantName { get; set; }
        public string? Sku { get; set; }
        public decimal? Price { get; set; }
        public int? StockQuantity { get; set; }
    }

    public class ReviewDto
    {
        public int ReviewId { get; set; }
        public int ProductId { get; set; }
        public int AccountId { get; set; }
        public int? Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
