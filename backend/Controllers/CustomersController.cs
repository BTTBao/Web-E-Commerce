using backend.Data;
using backend.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CustomersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 🟢 API: [GET] /api/customers
        // Lấy danh sách khách hàng để hiển thị
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CustomerDto>>> GetCustomers()
        {
            // Bước 1: Lấy dữ liệu thô từ DB (chỉ lấy role = 0)
            var customersFromDb = await _context.Accounts
                .Where(a => a.Role == 0) // Chỉ lấy Khách hàng
                .Include(a => a.User)
                .Include(a => a.Orders) // Include để .Count()
                .Select(a => new // Dùng anonymous type an toàn cho EF Core
                {
                    a.AccountId,
                    a.Email,
                    a.Phone,
                    FullName = (a.User != null) ? a.User.FullName : null,
                    a.CreatedAt,
                    a.IsActive,
                    TotalOrders = a.Orders.Count() // Đếm đơn hàng
                })
                .ToListAsync();

            // Bước 2: Format dữ liệu sang DTO (trong C# memory)
            var customerDtos = customersFromDb.Select(a => new CustomerDto
            {
                Id = "U" + a.AccountId,
                Email = a.Email,
                Username = a.Email, // React đang cần 'username', chúng ta dùng Email
                Phone = a.Phone,
                FullName = a.FullName ?? a.Email, // Nếu không có tên, dùng tạm Email
                RegisteredDate = a.CreatedAt.HasValue ? a.CreatedAt.Value.ToString("yyyy-MM-dd") : "",
                IsActive = a.IsActive , // Giả sử mặc định là Active nếu DB là null
                TotalOrders = a.TotalOrders
            });

            return Ok(customerDtos);
        }

        // 🟢 API: [PATCH] /api/customers/{id}/toggle-status
        // Dùng cho nút "Khóa" / "Mở khóa"
        [HttpPatch("{customerId}/toggle-status")]
        public async Task<IActionResult> ToggleCustomerStatus(string customerId)
        {
            // Parse "U1" thành 1
            if (string.IsNullOrEmpty(customerId) || !customerId.StartsWith("U") || !int.TryParse(customerId.AsSpan(1), out int accountId))
            {
                return BadRequest("Invalid customer ID format. Expected 'U' prefix.");
            }

            var account = await _context.Accounts.FindAsync(accountId);

            if (account == null)
            {
                return NotFound("Account not found.");
            }

            // Chỉ cho phép thao tác trên tài khoản Customer
            if (account.Role != 0)
            {
                return BadRequest("This account is not a customer.");
            }

            // Lật ngược trạng thái: true -> false, false -> true
            account.IsActive = !account.IsActive;

            await _context.SaveChangesAsync();

            // Trả về trạng thái mới để frontend cập nhật
            return Ok(new { newStatus = account.IsActive });
        }

        // 🟢 API: [GET] /api/customers/{id}
// Sửa lại hoàn toàn để trả về DTO chi tiết
[HttpGet("{customerId}")]
public async Task<ActionResult<CustomerDetailDto>> GetCustomerById(string customerId)
{
    // 1. Parse ID (giữ nguyên)
    if (string.IsNullOrEmpty(customerId) || !customerId.StartsWith("U") || !int.TryParse(customerId.AsSpan(1), out int accountId))
    {
        return BadRequest("Invalid customer ID format. Expected 'U' prefix.");
    }
    
    // 2. Sửa lại Query: Phải Include() cả UserAddresses
    var account = await _context.Accounts
        .Where(a => a.Role == 0 && a.AccountId == accountId)
        .Include(a => a.User)           // Nạp thông tin User (FullName)
        .Include(a => a.Orders)         // Nạp danh sách Đơn hàng
        .Include(a => a.UserAddresses)  // Nạp danh sách Địa chỉ
        .AsNoTracking() // Tăng hiệu năng vì chỉ đọc
        .FirstOrDefaultAsync();

    if (account == null)
    {
        return NotFound();
    }

    // 3. Sửa lại Mapping: Chuyển sang CustomerDetailDto
    var customerDetailDto = new CustomerDetailDto
    {
        // Thông tin cơ bản
        FullName = (account.User != null) ? account.User.FullName : account.Email,
        Email = account.Email,
        Phone = account.Phone,
        RegisteredDate = account.CreatedAt.HasValue ? account.CreatedAt.Value.ToString("yyyy-MM-dd") : "",
        IsActive = account.IsActive,

        // 4. Map danh sách Orders (React cần mảng 'orders')
        Orders = account.Orders.Select(order => new CustomerOrderDto
        {
            Id = "DH" + order.OrderId.ToString("D3"), // Tạo ID "DH001"
            Date = order.CreatedAt.HasValue ? order.CreatedAt.Value.ToString("yyyy-MM-dd") : "",
            Total = order.TotalAmount ?? 0,
            Status = order.Status
        }).ToList(),

        // 5. Map danh sách Addresses (React cần mảng 'addresses')
        Addresses = account.UserAddresses.Select(addr => new CustomerAddressDto
        {
            Id = addr.AddressId,
            Name = addr.AddressName, // Dùng 'AddressName' từ DB
            IsDefault = addr.IsDefault ?? false,
            // Ghép chuỗi địa chỉ đầy đủ
            Address = $"{addr.AddressLine}, {addr.Ward}, {addr.District}, {addr.Province}",
            Phone = addr.ReceiverPhone // Dùng SĐT người nhận
        }).ToList()
    };

    return Ok(customerDetailDto);
}
}
}