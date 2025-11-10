using backend.Interfaces.IServices;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly ICartService _service;

        public CartController(ICartService service)
        {
            _service = service;
        }

        // GET: api/Cart/ByUser/5
        [HttpGet("GetCartByAccountId/{accountId}")]
        public async Task<IActionResult> GetCartByUser(int accountId)
        {
            try
            {
                var cart = await _service.GetCartByUserIdAsync(accountId);
                if (cart == null)
                    return NotFound(new { status = "error", message = "Giỏ hàng không tồn tại" });

                return Ok(new { status = "success", cart });
            }
            catch (Exception)
            {
                return StatusCode(500, new { status = "error", message = "Lỗi server, vui lòng thử lại sau" });
            }
        }

        [HttpPost("AddItem")]
        public async Task<IActionResult> AddItem([FromBody] AddCartItemRequest req)
        {
            if (req == null)
                return BadRequest(new { status = "error", message = "Dữ liệu không hợp lệ" });

            if (req.Quantity <= 0)
                return BadRequest(new { status = "error", message = "Số lượng phải lớn hơn 0" });

            try
            {
                var cart = await _service.AddItemAsync(req.AccountId, req.ProductId, req.VariantId, req.Quantity);
                return Ok(new { status = "success", message = "Thêm vào giỏ hàng thành công", data = cart });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { status = "error", message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { status = "error", message = "Lỗi server, vui lòng thử lại sau" });
            }
        }

        [HttpPut("UpdateItem")]
        public async Task<IActionResult> UpdateItemQuantity([FromBody] UpdateCartItemRequest req)
        {
            if (req == null)
                return BadRequest(new { status = "error", message = "Dữ liệu không hợp lệ" });

            if (req.Quantity <= 0)
                return BadRequest(new { status = "error", message = "Số lượng phải lớn hơn 0" });

            try
            {
                var updated = await _service.UpdateItemQuantityAsync(req.AccountId, req.ProductId, req.VariantId, req.Quantity);
                if (!updated)
                    return NotFound(new { status = "error", message = "Không tìm thấy giỏ hàng hoặc sản phẩm" });

                return Ok(new { status = "success", message = "Cập nhật số lượng thành công" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { status = "error", message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { status = "error", message = "Lỗi server, vui lòng thử lại sau" });
            }
        }

        [HttpDelete("RemoveItem")]
        public async Task<IActionResult> RemoveItem([FromQuery] int accountId, [FromQuery] int productId, [FromQuery] int variantId)
        {
            if (accountId <= 0 || productId <= 0)
                return BadRequest(new { status = "error", message = "Tham số không hợp lệ" });

            try
            {
                var removed = await _service.RemoveItemAsync(accountId, productId, variantId);
                if (!removed)
                    return NotFound(new { status = "error", message = "Không tìm thấy giỏ hàng hoặc sản phẩm" });

                return Ok(new { status = "success", message = "Xoá sản phẩm khỏi giỏ hàng thành công" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { status = "error", message = "Lỗi server, vui lòng thử lại sau" });
            }
        }

        public class AddCartItemRequest
        {
            public int AccountId { get; set; }
            public int ProductId { get; set; }
            public int VariantId { get; set; }
            public int Quantity { get; set; }
        }

        public class UpdateCartItemRequest
        {
            public int AccountId { get; set; }
            public int ProductId { get; set; }
            public int VariantId { get; set; }
            public int Quantity { get; set; }
        }
    }
}
