
using backend.Data;
using backend.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace backend.Controllers
{
    public class AddressAddDto
    {
        [Required]
        public string ReceiverFullName { get; set; }
        [Required]
        public string ReceiverPhone { get; set; }
        [Required]
        public string AddressLine { get; set; }
        [Required]
        public string Ward { get; set; }
        [Required]
        public string District { get; set; }
        [Required]
        public string Province { get; set; }
        public bool? IsDefault { get; set; }
    }
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AddressController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AddressController(ApplicationDbContext context)
        {
            _context = context;
        }



        [HttpGet("get")]
        public async Task<IActionResult> GetAddress()
        {
            var userEmail = User.Identity?.Name;
            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized(new { message = "Token không hợp lệ." });
            }

            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Email == userEmail);
            if (account == null)
            {
                return NotFound(new { message = "Không tìm thấy tài khoản." });
            }

            var data = await _context.UserAddresses
                .Where(x => x.AccountId == account.AccountId)
                .OrderByDescending(x => x.IsDefault)
                .ToListAsync();

            return Ok(data);
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteAddress(int id)
        {
            var userEmail = User.Identity?.Name;
            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized(new { message = "Token không hợp lệ." });
            }

            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Email == userEmail);
            if (account == null)
            {
                return NotFound(new { message = "Không tìm thấy tài khoản." });
            }

            var address = await _context.UserAddresses.FirstOrDefaultAsync(x => x.AddressId == id);
            if (address == null)
            {
                return NotFound(new { message = "Không tìm thấy địa chỉ!" });
            }

            if (address.AccountId != account.AccountId)
            {
                return Forbid();
            }

            _context.UserAddresses.Remove(address);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa địa chỉ thành công!" });
        }

        [HttpPut("setdefault/{id}")]
        public async Task<IActionResult> SetDefaultAddress(int id)
        {
            var userEmail = User.Identity?.Name;
            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized(new { message = "Token không hợp lệ." });
            }

            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Email == userEmail);
            if (account == null)
            {
                return NotFound(new { message = "Không tìm thấy tài khoản." });
            }

            var addressExists = await _context.UserAddresses
                .AnyAsync(x => x.AddressId == id && x.AccountId == account.AccountId);

            if (!addressExists)
            {
                return NotFound(new { message = "Không tìm thấy địa chỉ!" });
            }

            await _context.UserAddresses
                .Where(x => x.AccountId == account.AccountId && x.IsDefault == true)
                .ExecuteUpdateAsync(s => s.SetProperty(b => b.IsDefault, false));

            await _context.UserAddresses
                .Where(x => x.AddressId == id)
                .ExecuteUpdateAsync(s => s.SetProperty(b => b.IsDefault, true));

            return Ok(new { message = "Đặt mặc định thành công!" });
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddAddress([FromBody] AddressAddDto newAddressDto)
        {
            var account = await GetAccountFromToken();
            if (account == null)
            {
                return Unauthorized(new { message = "Token không hợp lệ." });
            }

            var newAddress = new UserAddress
            {
                AccountId = account.AccountId,
                ReceiverFullName = newAddressDto.ReceiverFullName,
                ReceiverPhone = newAddressDto.ReceiverPhone,
                AddressLine = newAddressDto.AddressLine,
                Ward = newAddressDto.Ward,
                District = newAddressDto.District,
                Province = newAddressDto.Province,
                IsDefault = newAddressDto.IsDefault ?? false,
            };

            if (newAddress.IsDefault == true)
            {
                var existingAddresses = await _context.UserAddresses
                    .Where(x => x.AccountId == account.AccountId && x.IsDefault == true)
                    .ToListAsync();

                foreach (var addr in existingAddresses)
                {
                    addr.IsDefault = false;
                }
            }

            _context.UserAddresses.Add(newAddress);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Thêm địa chỉ thành công!", newAddress = newAddress });
        }
    }
}
