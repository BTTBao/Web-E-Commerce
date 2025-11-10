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
                date = o.CreatedAt.GetValueOrDefault(), // <-- SỬA 2
                total = o.TotalAmount.GetValueOrDefault(), // <-- SỬA 2
                status = o.Status,
                
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
        // Parse ID từ "DH00001" (string) về 1 (int)
        if (string.IsNullOrEmpty(id) || !id.StartsWith("DH") || !int.TryParse(id.Substring(2), out int orderId))
        {
            return BadRequest(new { message = "Mã đơn hàng không hợp lệ." });
        }

        // Kiểm tra xem status gửi lên có hợp lệ không
        var validStatuses = new[] { "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled" };
        if (string.IsNullOrEmpty(dto.status) || !validStatuses.Contains(dto.status))
        {
            return BadRequest(new { message = "Trạng thái đơn hàng không hợp lệ." });
        }

        // Tìm đơn hàng trong CSDL
        var order = await _context.Orders.FindAsync(orderId);

        if (order == null)
        {
            return NotFound(new { message = "Không tìm thấy đơn hàng." });
        }

        // Cập nhật trạng thái và lưu thay đổi
        order.Status = dto.status;
        await _context.SaveChangesAsync();

        // Trả về thông báo thành công
        return Ok(new { message = $"Đã cập nhật trạng thái đơn hàng #{id} thành {dto.status}." });
    }
}