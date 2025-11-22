using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;     // Sử dụng DbContext
using backend.Entities; // Sử dụng Entities (Order, Product, v.v...)
using backend.Dtos;     // Sử dụng DTOs (OrderListDto, OrderDetailDto...)
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class OrdersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public OrdersController(ApplicationDbContext context)
    {
        _context = context;
    }
    [HttpPatch("{id}")]
    public async Task<IActionResult> CancelOrder(int id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                    .ThenInclude(p => p.ProductVariants)
            .Include(o => o.Payments)
            .FirstOrDefaultAsync(o => o.OrderId == id);

        if (order == null)
        {
            return NotFound(new { message = "Không tìm thấy đơn hàng." });
        }

        if (order.Status == "Cancelled")
        {
            return BadRequest(new { message = "Đơn hàng đã bị hủy trước đó." });
        }
        foreach (var detail in order.OrderDetails)
        {
            if (detail.VariantId.HasValue && detail.VariantId.Value > 0)
            {
                var variant = detail.Product.ProductVariants.FirstOrDefault(v => v.VariantId == detail.VariantId);
                if (variant != null)
                {
                    variant.StockQuantity += detail.Quantity.GetValueOrDefault();
                }
            }
            else
            {
                detail.Product.StockQuantity += detail.Quantity.GetValueOrDefault();
            }
        }
        order.Status = "Cancelled";

        // 3. Cập nhật trạng thái thanh toán nếu muốn (ví dụ, nếu đang Pending thì hủy luôn)
        foreach (var payment in order.Payments)
        {
            if (payment.PaymentStatus == "Pending")
            {
                payment.PaymentStatus = "Failed";
            }
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Đơn hàng #{id} đã bị hủy thành công."
        });
    }
    // 2. API CHO TRANG DANH SÁCH (Orders.jsx)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderListDto>>> GetOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.Address) // <-- SỬA 1: Dùng 'Address' (thay vì UserAddress)
            .Include(o => o.Payments)     
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderListDto
            {
                id = "DH" + o.OrderId.ToString("D5"), // <-- Sửa: OrderID -> OrderId
                
                customerName = o.Address.ReceiverFullName ?? "N/A", // <-- SỬA 1
                
                // SỬA 2: Dùng GetValueOrDefault() cho các trường nullable
                date = o.CreatedAt.GetValueOrDefault(), 
                total = o.TotalAmount.GetValueOrDefault(),
                status = o.Status,

                paymentStatus = o.Payments
                                 .OrderByDescending(p => p.CreatedAt)
                                 .FirstOrDefault()
                                 .PaymentStatus ?? "Pending"
            })
            .ToListAsync();

        return Ok(orders);
    }

    // 3. API CHO TRANG CHI TIẾT ĐƠN HÀNG
    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDetailDto>> GetOrder(string id)
    {
        if (string.IsNullOrEmpty(id) || !id.StartsWith("DH") || !int.TryParse(id.Substring(2), out int orderId))
        {
            return BadRequest(new { message = "Mã đơn hàng không hợp lệ." });
        }

        var order = await _context.Orders
            .Include(o => o.Address) // <-- SỬA 1
            .Include(o => o.Payments) 
            .Include(o => o.Account) 
            .Include(o => o.OrderDetails) 
                .ThenInclude(od => od.Product) 
                .ThenInclude(p => p.ProductImages) 
            .Include(o => o.OrderDetails)
                // === SỬA 3 (LỖI CS1061): Dùng 'Variant' (thay vì ProductVariant) ===
                .ThenInclude(od => od.Variant) 
            .Where(o => o.OrderId == orderId) // <-- Sửa: OrderID -> OrderId
            .Select(o => new OrderDetailDto 
            {
                id = "DH" + o.OrderId.ToString("D5"), // <-- Sửa: OrderID -> OrderId
                customerName = o.Address.ReceiverFullName ?? "N/A", // <-- SỬA 1
                accountId =  o.Account.AccountId,
                date = o.CreatedAt.GetValueOrDefault(), // <-- SỬA 2
                total = o.TotalAmount.GetValueOrDefault(), // <-- SỬA 2
                status = o.Status,
                isReviewed = o.IsReviewed,

                paymentStatus = o.Payments.OrderByDescending(p => p.CreatedAt).FirstOrDefault().PaymentStatus ?? "Pending",
                paymentMethod = o.Payments.OrderByDescending(p => p.CreatedAt).FirstOrDefault().Method ?? "N/A",

                customerEmail = o.Account.Email,
                customerPhone = o.Account.Phone,

                shippingAddress = o.Address != null ? new OrderAddressDto // <-- SỬA 1
                {
                    receiverFullName = o.Address.ReceiverFullName,
                    receiverPhone = o.Address.ReceiverPhone,
                    addressLine = o.Address.AddressLine,
                    ward = o.Address.Ward,
                    district = o.Address.District,
                    province = o.Address.Province
                } : null,

                // Danh sách chi tiết sản phẩm
                items = o.OrderDetails.Select(od => new OrderDetailItemDto
                {
                    productId = od.ProductId, // <-- Sửa: ProductID -> ProductId
                    productName = od.Product.Name,
                    
                    // === SỬA 3 (LỖI CS1061): Dùng 'Variant' ===
                    size = od.Variant != null ? od.Variant.Size : null,
                    color = od.Variant != null ? od.Variant.Color : null,
                    
                    imageUrl = od.Product.ProductImages.OrderByDescending(img => img.IsPrimary).FirstOrDefault().ImageUrl 
                               ?? od.Product.ProductImages.FirstOrDefault().ImageUrl 
                               ?? "/images/default-product.png", 
                    
                    // === SỬA 2 (LỖI CS0266): Dùng GetValueOrDefault() ===
                    quantity = od.Quantity.GetValueOrDefault(),
                    unitPrice = od.UnitPrice.GetValueOrDefault(),
                    subTotal = od.SubTotal.GetValueOrDefault()
                }).ToList()
            })
            .FirstOrDefaultAsync(); 

        if (order == null)
        {
            return NotFound(new { message = "Không tìm thấy đơn hàng." });
        }

        return Ok(order);
    }

    // 4. API CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
    // PATCH: api/orders/DH00001/status
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(string id, [FromBody] UpdateOrderStatusDto dto)
    {
        // Parse ID từ "DH00001" thành 1
        if (string.IsNullOrEmpty(id) || !id.StartsWith("DH") || !int.TryParse(id.Substring(2), out int orderId))
        {
            return BadRequest(new { message = "Mã đơn hàng không hợp lệ." });
        }

        // Kiểm tra trạng thái hợp lệ
        var validStatuses = new[] { "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled" };
        if (string.IsNullOrEmpty(dto.status) || !validStatuses.Contains(dto.status))
        {
            return BadRequest(new { message = "Trạng thái đơn hàng không hợp lệ." });
        }

        // Lấy đơn hàng
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null)
        {
            return NotFound(new { message = "Không tìm thấy đơn hàng." });
        }

        // Cập nhật trạng thái đơn hàng
        order.Status = dto.status;

        // Nếu đơn hàng đã giao → cập nhật payment
        if (dto.status == "Delivered")
        {
            // Lấy payment theo orderId
            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.OrderId == orderId);

            if (payment != null && payment.Method == "COD")
            {
                payment.PaymentStatus = "Paid";
            }
        }

        // Lưu thay đổi
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Đã cập nhật trạng thái đơn hàng #{id} thành {dto.status}." });
    }


    [HttpPost]
    public async Task<ActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        if (dto == null || dto.items == null || !dto.items.Any())
        {
            return BadRequest(new { message = "Dữ liệu đơn hàng không hợp lệ." });
        }
        
        // Kiểm tra số lượng âm hoặc bằng 0
        if (dto.items.Any(i => i.quantity <= 0))
        {
            return BadRequest(new { message = "Số lượng sản phẩm phải lớn hơn 0." });
        }

        // Giới hạn số lượng tối đa mỗi mặt hàng
        if (dto.items.Any(i => i.quantity > 10))
        {
            return BadRequest(new { message = "Mỗi sản phẩm chỉ được đặt tối đa 10 cái." });
        }

        // Lấy thông tin địa chỉ giao hàng
        var address = await _context.UserAddresses.FindAsync(dto.addressId);
        if (address == null)
        {
            return BadRequest(new { message = "Không tìm thấy địa chỉ giao hàng." });
        }

        // Khởi tạo đơn hàng
        var order = new Order
        {
            AccountId = dto.accountId,
            AddressId = dto.addressId,
            CreatedAt = DateTime.UtcNow,
            Status = "Pending"
        };

        // Thêm đơn hàng vào context để sinh OrderId
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Tạo danh sách chi tiết đơn hàng
        decimal totalAmount = 0;
        foreach (var item in dto.items)
        {
            var product = await _context.Products
            .Include(p => p.ProductVariants)
            .FirstOrDefaultAsync(p => p.ProductId == item.productId);

            if (product == null)
            {
                return BadRequest(new { message = $"Không tìm thấy sản phẩm ID: {item.productId}" });
            }

            // Kiểm tra tồn kho theo biến thể hoặc theo sản phẩm
            int stockQuantity;
            if (item.variantId.HasValue && item.variantId.Value > 0)
            {
                var variant = product.ProductVariants.FirstOrDefault(v => v.VariantId == item.variantId);
                if (variant == null)
                {
                    return BadRequest(new { message = $"Không tìm thấy biến thể cho sản phẩm ID: {item.productId}" });
                }

                stockQuantity = (int)variant.StockQuantity;
            }
            else
            {
                stockQuantity = (int)product.StockQuantity;
            }

            // Kiểm tra tồn kho
            if (item.quantity > stockQuantity)
            {
                return BadRequest(new
                {
                    message = $"Sản phẩm '{product.Name}' chỉ còn {stockQuantity} sản phẩm trong kho."
                });
            }

            // Cập nhật trừ tồn kho ngay sau khi đặt
            if (item.variantId.HasValue && item.variantId.Value > 0)
            {
                var variant = product.ProductVariants.First(v => v.VariantId == item.variantId);
                variant.StockQuantity -= item.quantity;
            }
            else
            {
                product.StockQuantity -= item.quantity;
            }

            var detail = new OrderDetail
            {
                OrderId = order.OrderId,
                ProductId = item.productId,
                VariantId = item.variantId,
                Quantity = item.quantity,
                UnitPrice = item.unitPrice,
                SubTotal = item.unitPrice * item.quantity
            };

            totalAmount += detail.SubTotal.GetValueOrDefault();
            _context.OrderDetails.Add(detail);
        }

        // Cập nhật tổng tiền đơn hàng
        order.TotalAmount = totalAmount;

        // Tạo thông tin thanh toán ban đầu
        var payment = new Payment
        {
            OrderId = order.OrderId,
            Method = dto.paymentMethod ?? "COD",
            PaymentStatus = "Pending",
            Amount = totalAmount,
            CreatedAt = DateTime.UtcNow
        };

        _context.Payments.Add(payment);

        // Lưu lại cả cập nhật tồn kho
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Tạo đơn hàng thành công.",
            orderId = "DH" + order.OrderId.ToString("D5"),
            totalAmount,
            paymentMethod = payment.Method
        });
    }
}