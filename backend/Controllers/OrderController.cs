using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public OrderController(ApplicationDbContext context) {
            _context = context;
        }

        [HttpGet("getall")]
        public IActionResult GetAllOrders(int accountId)
        {
            var orders = _context.Orders
                .Where(o => o.AccountId == accountId)
                .Include(o => o.Address) // đây là navigation property UserAddress
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new
                {
                    o.OrderId,
                    o.TotalAmount,
                    o.Status,
                    CreatedAt = o.CreatedAt.HasValue ? o.CreatedAt.Value.ToString("yyyy-MM-dd HH:mm:ss") : null,
                    ShippingAddress = o.Address != null ? new
                    {
                        o.Address.AddressLine,
                        o.Address.Ward,
                        o.Address.District,
                        o.Address.Province,
                        o.Address.IsDefault
                    } : null,
                    OrderDetails = o.OrderDetails.Select(d => new
                    {
                        d.OrderDetailId,
                        d.ProductId,
                        ProductName = d.Product.Name,
                        d.Quantity,
                        d.UnitPrice,
                        d.SubTotal
                    })
                })
                .ToList();

            if (orders == null || orders.Count == 0)
                return NotFound("Không có đơn hàng nào cho tài khoản này.");

            return Ok(orders);
        }

    }
}
