using System;
using System.Collections.Generic;

namespace backend.Entities;

public partial class Order
{
    public int OrderId { get; set; }

    public int AccountId { get; set; }

    public int? AddressId { get; set; }

    public decimal? TotalAmount { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual UserAddress? Address { get; set; }

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
