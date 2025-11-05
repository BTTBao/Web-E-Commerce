using System;
using System.Collections.Generic;

namespace backend.Entities;

public partial class UserAddress
{
    public int AddressId { get; set; }

    public int AccountId { get; set; }

    public string? AddressName { get; set; }

    public string ReceiverFullName { get; set; } = null!;

    public string ReceiverPhone { get; set; } = null!;

    public string AddressLine { get; set; } = null!;

    public string Ward { get; set; } = null!;

    public string District { get; set; } = null!;

    public string Province { get; set; } = null!;

    public bool? IsDefault { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
