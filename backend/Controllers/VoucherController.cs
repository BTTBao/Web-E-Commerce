using backend.Data;
using backend.Entities;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VoucherController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public VoucherController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetAllVoucher()
        {
            var db = _context.Vouchers.ToList();
            if (!db.Any())
            {
                return NotFound("Không có voucher nào trong hệ thống.");
            }
            return Ok(db);
        }

        [HttpPut("{voucher}")]
        public IActionResult UpdateVoucher(Voucher voucher)
        {
            var check = _context.Vouchers.Any(t => t.Code == voucher.Code);
            if (check) return BadRequest("Đã có mã này !!");
            if (voucher == null) return BadRequest("Voucher trống !!");

            var voucherUpdate = _context.Vouchers.FirstOrDefault(v => v.VoucherId == voucher.VoucherId);

            if (voucherUpdate == null)
            {
                return NotFound(new { message = "Voucher không tồn tại" });
            }
            voucherUpdate.Code = voucher.Code;
            voucherUpdate.Description = voucher.Description;
            voucherUpdate.DiscountPercent = voucher.DiscountPercent;
            voucherUpdate.MinOrderAmount = voucher.MinOrderAmount;
            voucherUpdate.StartDate = voucher.StartDate;
            voucherUpdate.EndDate = voucher.EndDate;
            _context.SaveChanges();

            return Ok(voucher);
        }
        [HttpPost]
        public IActionResult CreateVoucher([FromBody]Voucher voucher)
        {
            var check = _context.Vouchers.Any(t => t.Code == voucher.Code);
            if (check) return BadRequest("Đã có mã này !!");
            if (voucher == null) return BadRequest("Voucher trống !!");
            _context.Vouchers.Add(voucher);
            _context.SaveChanges();
            return Ok(voucher);
        }
        [HttpDelete("{voucherId}")]
        public IActionResult DeleteVoucher(int voucherId)
        {
            try
            {
                var voucher = _context.Vouchers.FirstOrDefault(v => v.VoucherId == voucherId);
                if (voucher == null)
                    return NotFound(new { message = "Voucher không tồn tại" });

                _context.Vouchers.Remove(voucher);
                _context.SaveChanges();

                return Ok(new { message = "Xóa thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra: " + ex.Message });
            }
        }


    }
}
