using backend.DTOs;
using backend.Interfaces.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

        // ✅ Lấy tất cả sản phẩm
        [HttpGet]
        public async Task<IActionResult> GetProducts()
        {
            try
            {
                var products = await _service.GetAllProducts();

                if (products == null || !products.Any())
                {
                    return Ok(new
                    {
                        status = "success",
                        message = "Hiện chưa có sản phẩm nào.",
                        data = new List<ProductDto>()
                    });
                }

                return Ok(new
                {
                    status = "success",
                    message = "Lấy danh sách sản phẩm thành công.",
                    data = products
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    status = "error",
                    message = $"Lỗi server: {ex.Message}"
                });
            }
        }

        [HttpGet("/product/active")]
        public async Task<IActionResult> GetProductsActive()
        {
            try
            {
                var products = await _service.GetAllProductsActive();

                if (products == null || !products.Any())
                {
                    return Ok(new
                    {
                        status = "success",
                        message = "Hiện chưa có sản phẩm nào.",
                        data = new List<ProductDto>()
                    });
                }

                return Ok(new
                {
                    status = "success",
                    message = "Lấy danh sách sản phẩm thành công.",
                    data = products
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    status = "error",
                    message = $"Lỗi server: {ex.Message}"
                });
            }
        }


        [HttpGet("category/{categoryName}")]
        public async Task<IActionResult> GetProductByCategory(string categoryName)
        {
            try
            {
                var products = await _service.GetProductsByCategory(categoryName);

                if (products == null || !products.Any())
                {
                    return Ok(new
                    {
                        status = "success",
                        message = "Hiện chưa có sản phẩm nào.",
                        data = new List<ProductDto>()
                    });
                }

                return Ok(new
                {
                    status = "success",
                    message = "Lấy danh sách sản phẩm thành công.",
                    data = products
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    status = "error",
                    message = $"Lỗi server: {ex.Message}"
                });
            }
        }

        // ✅ Lấy 1 sản phẩm theo ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            try
            {
                var product = await _service.GetProductById(id);

                if (product == null)
                {
                    return NotFound(new
                    {
                        status = "error",
                        message = "Không tồn tại sản phẩm này."
                    });
                }

                return Ok(new
                {
                    status = "success",
                    message = "Lấy sản phẩm thành công.",
                    data = product
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    status = "error",
                    message = $"Lỗi server: {ex.Message}"
                });
            }
        }

        // ✅ Thêm sản phẩm mới
        [HttpPost]
        public async Task<IActionResult> PostProduct([FromBody] ProductDto dto)
        {
            try
            {
                var created = await _service.AddProduct(dto);
                return Ok(new
                {
                    status = "success",
                    message = "Tạo sản phẩm thành công.",
                    data = created
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    status = "error",
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    status = "error",
                    message = $"Lỗi server: {ex.Message}"
                });
            }
        }

        // ✅ Cập nhật sản phẩm
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, [FromBody] ProductDto dto)
        {
            try
            {
                var updated = await _service.UpdateProduct(id, dto);

                if (!updated)
                {
                    return NotFound(new
                    {
                        status = "error",
                        message = "Không tồn tại sản phẩm để cập nhật."
                    });
                }

                return Ok(new
                {
                    status = "success",
                    message = "Cập nhật sản phẩm thành công.",
                    data = dto
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    status = "error",
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    status = "error",
                    message = $"Lỗi server: {ex.Message}"
                });
            }
        }

        // ✅ Xóa sản phẩm
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var deleted = await _service.DeleteProduct(id);

                if (!deleted)
                {
                    return NotFound(new
                    {
                        status = "error",
                        message = "Không tồn tại sản phẩm để xóa."
                    });
                }

                return Ok(new
                {
                    status = "success",
                    message = $"Xóa sản phẩm có ID {id} thành công."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    status = "error",
                    message = $"Lỗi server: {ex.Message}"
                });
            }
        }

        // ✅ Thêm method này vào ProductController.cs

        [HttpGet("search")]
        public async Task<IActionResult> SearchProducts([FromQuery] string keyword)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(keyword))
                {
                    return BadRequest(new
                    {
                        status = "error",
                        message = "Vui lòng nhập từ khóa tìm kiếm."
                    });
                }

                var products = await _service.SearchProducts(keyword);

                if (products == null || !products.Any())
                {
                    return Ok(new
                    {
                        status = "success",
                        message = $"Không tìm thấy sản phẩm nào với từ khóa '{keyword}'.",
                        data = new List<ProductDto>()
                    });
                }

                return Ok(new
                {
                    status = "success",
                    message = $"Tìm thấy {products.Count()} sản phẩm.",
                    data = products
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    status = "error",
                    message = $"Lỗi server: {ex.Message}"
                });
            }
        }

        [HttpGet("best-seller")]
        public async Task<IActionResult> GetBestSellers()
        {
            try
            {
                var products = await _service.GetBestSellerProducts(32);

                if (products == null || !products.Any())
                {
                    return Ok(new
                    {
                        status = "success",
                        message = "Hiện chưa có sản phẩm best seller nào.",
                        data = new List<ProductDto>()
                    });
                }

                return Ok(new
                {
                    status = "success",
                    message = "Lấy danh sách sản phẩm best seller thành công.",
                    data = products
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    status = "error",
                    message = $"Lỗi server: {ex.Message}"
                });
            }
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
        {
            var result = await _service.UpdateProductStatus(id, dto.Status);

            if (!result)
            {
                return NotFound(new
                {
                    status = "error",
                    message = "Không tồn tại sản phẩm để cập nhật trạng thái."
                });
            }

            return Ok(new
            {
                status = "success",
                message = "Cập nhật trạng thái sản phẩm thành công."
            });
        }

        public class UpdateStatusDto
        {
            public string Status { get; set; }
        }
    }
}
