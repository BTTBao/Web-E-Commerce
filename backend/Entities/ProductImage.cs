using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities
{
    [Table("ProductImages")]
    public class ProductImage
    {
        [Key]
        public int ImageID { get; set; }

        // Khóa ngoại cho Product 
        public int ProductID { get; set; }

        [Required]
        [StringLength(255)]
        public string ImageURL { get; set; }

        public bool IsPrimary { get; set; } = false;

        [ForeignKey("ProductID")]
        public Product Product { get; set; }
    }
}
