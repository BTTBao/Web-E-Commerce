using System;
using System.Collections.Generic;

namespace backend.Entities;

public partial class UserAddress
{
    public int AddressId { get; set; }

    public int AccountId { get; set; }

    public string AddressLine { get; set; } = null!;

    public string? City { get; set; }

    public string? Province { get; set; }

    public bool? IsDefault { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
