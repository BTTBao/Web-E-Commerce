using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Category
    {
        [Key]
        public int CategoryID { get; set; }

        [Required]
        [MaxLength(150)]
        public string CategoryName { get; set; }

        public int? ParentCategoryID { get; set; }

    }
}
