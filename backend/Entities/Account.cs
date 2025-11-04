using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities
{
    public enum RoleType
    {
        Admin = 1,
        Staff = 2,
        Customer = 3
    }

    [Table("Accounts")]
    public class Account
    {
        [Key]
        public int AccountID { get; set; }
        [Required]
        [StringLength(255)]
        public string PasswordHash { get; set; }

        [StringLength(150)]
        public string Email { get; set; }

        [StringLength(20)]
        public string Phone { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [Required]
        public RoleType Role { get; set; } = RoleType.Customer;

        public User User { get; set; }
    }
}
