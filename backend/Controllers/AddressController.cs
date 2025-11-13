using backend.Data;
using backend.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    public class UserAddressDto
    {
        public int AccountId { get; set; }
        public string ReceiverFullName { get; set; }
        public string ReceiverPhone { get; set; }
        public string AddressLine { get; set; }
        public string Ward { get; set; }
        public string District { get; set; }
        public string Province { get; set; }
        public bool? IsDefault { get; set; }
    }


    [Route("api/[controller]")]
    [ApiController]
    public class AddressController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public AddressController(ApplicationDbContext context)
        {
            _context = context;
        }
        [HttpGet("get")]
        public IActionResult GetAddress(int? accountId)
        {
            var data = _context.UserAddresses.Where(x => x.AccountId == accountId).ToList();
            return Ok(data);
        }
        [HttpDelete("delete")]
        public IActionResult DeleteAddress(int id)
        {
            var address = _context.UserAddresses.FirstOrDefault(x => x.AddressId == id);
            if (address == null)
            {
                return NotFound(new { message = "Không tìm thấy địa chỉ!" });
            }

            _context.UserAddresses.Remove(address);
            _context.SaveChanges();
            return Ok(new { message = "Xóa địa chỉ thành công!" });
        }

        [HttpPut("setdefault")]
        public IActionResult SetDefaultAddress(int id)
        {
            var address = _context.UserAddresses.FirstOrDefault(x => x.AddressId == id);
            if (address == null)
            {
                return NotFound(new { message = "Không tìm thấy địa chỉ!" });
            }
            var allAddresses = _context.UserAddresses
                .Where(x => x.AccountId == address.AccountId)
                .ToList();

            foreach (var a in allAddresses)
            {
                a.IsDefault = false;
            }

            address.IsDefault = true;
            _context.SaveChanges();

            return Ok(new { message = "Đặt mặc định thành công!" });
        }

        [HttpPost("add")]
        [Authorize]
        public async Task<IActionResult> AddAddress([FromBody] UserAddressDto newAddressDto)
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

            var addressResponse = new
            {
                newAddress.AddressId,
                newAddress.AccountId,
                newAddress.ReceiverFullName,
                newAddress.ReceiverPhone,
                newAddress.AddressLine,
                newAddress.Ward,
                newAddress.District,
                newAddress.Province,
                newAddress.IsDefault
            };

            return Ok(new { message = "Thêm địa chỉ thành công!", newAddress = addressResponse });
        }



    }
}
