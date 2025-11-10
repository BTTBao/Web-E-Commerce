using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class ProductVariant
{
    public int VariantId { get; set; }

    public int ProductId { get; set; }

    public string? Size { get; set; }

    public string? Color { get; set; }

    public string? Sku { get; set; }

    public decimal? Price { get; set; }

    public int? StockQuantity { get; set; }

    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    public virtual Product Product { get; set; } = null!;
}
