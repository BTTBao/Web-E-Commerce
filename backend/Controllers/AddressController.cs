using backend.Data;
using backend.Entities;
using Microsoft.AspNetCore.Mvc;

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
            if (newAddressDto == null || newAddressDto.AccountId == 0 ||
                string.IsNullOrWhiteSpace(newAddressDto.ReceiverFullName) ||
                string.IsNullOrWhiteSpace(newAddressDto.ReceiverPhone) ||
                string.IsNullOrWhiteSpace(newAddressDto.AddressLine) ||
                string.IsNullOrWhiteSpace(newAddressDto.Ward) ||
                string.IsNullOrWhiteSpace(newAddressDto.District) ||
                string.IsNullOrWhiteSpace(newAddressDto.Province))
            {
                return BadRequest(new { message = "Dữ liệu không hợp lệ!" });
            }

            var newAddress = new UserAddress
            {
                AccountId = newAddressDto.AccountId,
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
                var existingAddresses = _context.UserAddresses
                    .Where(x => x.AccountId == newAddress.AccountId && x.IsDefault == true)
                    .ToList();

                foreach (var addr in existingAddresses)
                {
                    addr.IsDefault = false;
                }
                _context.SaveChanges();
            }

            _context.UserAddresses.Add(newAddress);
            _context.SaveChanges();

            return Ok(new { message = "Thêm địa chỉ thành công!", newAddress });
        }


    }
}
