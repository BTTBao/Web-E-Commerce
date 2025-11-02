using backend.Data;
using backend.Entities;
using backend.Interfaces.IServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _service;

        public ProductController(IProductService service)
        {
            _service = service;
        }

        // GET: api/Product
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            var products = await _service.GetAllProducts();
            return Ok(products);
        }

        // GET: api/Product/1
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _service.GetProductById(id);

            if (product == null)
            {
                return NotFound("Không tồn tại sản phẩm !!");
            }

            return Ok(product);
        }

        // PUT: api/Product/1
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, Product product)
        {
            var updated = await _service.UpdateProduct(id, product);
            if (!updated)
                return BadRequest("Lỗi khi cập nhật sản phẩm !!");
            return Ok(new { product, message = "Cập nhật sản phẩm thành công" });
        }

        // POST: api/Product
        [HttpPost]
        public async Task<ActionResult<Product>> PostProduct(Product product)
        {
            var created = await _service.AddProduct(product);
            return Ok(new {product, message = "Tạo sản phẩm thành công"});
        }

        // DELETE: api/Product/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var deleted = await _service.DeleteProduct(id);
            if (!deleted)
                return NotFound("Không tồn tại sản phẩm !!");
            return Ok(new { message = $"Xoá sản phẩm {id} thành công" });
        }
    }
}
