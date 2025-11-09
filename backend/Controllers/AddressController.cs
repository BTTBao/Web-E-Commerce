using backend.Data;
using backend.Entities;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    public class UserAddressDto
    {
        public int AccountId { get; set; }
        public string AddressLine { get; set; } = null!;
        public string? City { get; set; }
        public string? Province { get; set; }
        public bool? IsDefault { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class AddressController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public AddressController(ApplicationDbContext context) { 
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
        public IActionResult AddAddress([FromBody] UserAddressDto newAddressDto)
        {
            if (newAddressDto == null || newAddressDto.AccountId == 0)
                return BadRequest(new { message = "Dữ liệu không hợp lệ!" });

            var newAddress = new UserAddress
            {
                AccountId = newAddressDto.AccountId,
                AddressLine = newAddressDto.AddressLine,
                City = newAddressDto.City,
                Province = newAddressDto.Province,
                IsDefault = newAddressDto.IsDefault,
            };

            if (newAddress.IsDefault == true)
            {
                var list = _context.UserAddresses
                    .Where(x => x.AccountId == newAddress.AccountId)
                    .ToList();

                foreach (var a in list)
                    a.IsDefault = false;
            }

            _context.UserAddresses.Add(newAddress);
            _context.SaveChanges();

            return Ok(new { message = "Thêm địa chỉ thành công!", newAddress });
        }

    }
}
