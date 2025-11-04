using backend.Entities;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities
{
    [Table("Users")]
    public class User
    {
        [Key]
        public int UserID { get; set; }

        [ForeignKey("Account")]
        public int AccountID { get; set; }

        [StringLength(150)]
        public string FullName { get; set; }

        [StringLength(10)]
        public string Gender { get; set; } // Male, Female, Other

        public DateTime? DateOfBirth { get; set; }  // Thêm ngày sinh, nullable

        [StringLength(255)]
        public string AvatarURL { get; set; }

        public Account Account { get; set; }
    }
}
