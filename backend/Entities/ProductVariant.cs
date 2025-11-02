using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities
{
    [Table("ProductVariants")]
    // Định nghĩa UNIQUE constraint cho SKU
    [Index(nameof(SKU), IsUnique = true)]
    public class ProductVariant
    {
        [Key]
        public int VariantID { get; set; }

        // Khóa ngoại cho Product 
        public int ProductID { get; set; }

        [StringLength(100)]
        public string? VariantName { get; set; }

        [StringLength(100)]
        public string? SKU { get; set; }

        [Column(TypeName = "decimal(12, 2)")]
        [Range(0, (double)decimal.MaxValue, ErrorMessage = "Giá phải lớn hơn hoặc bằng 0")]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Số lượng tồn kho phải lớn hơn hoặc bằng 0")]
        public int StockQuantity { get; set; } = 0;

        [ForeignKey("ProductID")]
        public Product Product { get; set; }
    }
}
