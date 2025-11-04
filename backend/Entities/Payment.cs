using System;
using System.Collections.Generic;

namespace backend.Entities;

public partial class Payment
{
    public int PaymentId { get; set; }

    public int OrderId { get; set; }

    public string? Method { get; set; }

    public decimal? Amount { get; set; }

    public string? PaymentStatus { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Order Order { get; set; } = null!;
}
