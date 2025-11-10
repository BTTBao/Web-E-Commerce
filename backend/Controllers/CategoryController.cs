using backend.Data;
using backend.Entities;
using backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        // api/category
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAllCategories()
        {
            var categories = await _context.Categories
                .Include(c => c.InverseParentCategory)
                .ToListAsync();

            // Lọc danh mục gốc
            var roots = categories.Where(c => c.ParentCategoryId == null).ToList();

            // Dựng cây bằng navigation có sẵn
            var result = roots.Select(MapCategory).ToList();
            return Ok(result);
        }


        private CategoryDto MapCategory(Category category)
        {
            return new CategoryDto
            {
                id = category.CategoryId,
                name = category.CategoryName,
                parentId = category.ParentCategoryId,
                children = category.InverseParentCategory.Select(MapCategory).ToList()
            };
        }

        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.name))
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "Category name is required."
                });
            }

            // Kiểm tra trùng tên
            var exists = await _context.Categories
                .AnyAsync(c => c.CategoryName == dto.name);
            if (exists)
            {
                return Conflict(new
                {
                    status = "error",
                    message = $"Category '{dto.name}' already exists."
                });
            }

            // Xác định danh mục cha (nếu có)
            Category? parent = null;
            if (!string.IsNullOrEmpty(dto.parentName))
            {
                parent = await _context.Categories
                    .FirstOrDefaultAsync(c => c.CategoryName == dto.parentName);

                if (parent == null)
                {
                    return NotFound(new
                    {
                        status = "error",
                        message = $"Parent category '{dto.parentName}' not found."
                    });
                }
            }

            // Tạo danh mục mới
            var category = new Category
            {
                CategoryName = dto.name,
                ParentCategoryId = parent?.CategoryId
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            // Chuẩn bị dữ liệu trả về
            var result = new CategoryDto
            {
                id = category.CategoryId,
                name = category.CategoryName,
                parentId = category.ParentCategoryId,
                parentName = parent?.CategoryName,
                children = new List<CategoryDto>()
            };

            // Trả về response dạng chuẩn
            return Ok(new
            {
                status = "success",
                message = "Category created successfully.",
                data = result
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            // 1️⃣ Tìm danh mục theo ID
            var category = await _context.Categories
                .Include(c => c.InverseParentCategory) // load danh mục con
                .Include(c => c.Products)              // load danh sách sản phẩm (nếu có quan hệ)
                .FirstOrDefaultAsync(c => c.CategoryId == id);

            if (category == null)
            {
                return NotFound(new
                {
                    status = "error",
                    message = "Không tìm thấy danh mục cần xóa."
                });
            }

            // 2️⃣ Kiểm tra có danh mục con không
            if (category.InverseParentCategory != null && category.InverseParentCategory.Any())
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "Không thể xóa vì danh mục này có danh mục con."
                });
            }

            // 3️⃣ Kiểm tra có sản phẩm thuộc danh mục không
            if (category.Products != null && category.Products.Any())
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "Không thể xóa vì danh mục đang chứa sản phẩm."
                });
            }

            // 4️⃣ Thực hiện xóa
            _context.Categories.Remove(category);
            _ = await _context.SaveChangesAsync();

            // 5️⃣ Trả phản hồi
            return Ok(new
            {
                status = "success",
                message = $"Đã xóa danh mục '{category.CategoryName}' thành công.",
                data = new { id = category.CategoryId }
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.name))
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "Tên danh mục không được để trống."
                });
            }

            // 🔎 Tìm danh mục cần cập nhật
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound(new
                {
                    status = "error",
                    message = "Không tìm thấy danh mục cần cập nhật."
                });
            }

            // 🔎 Kiểm tra trùng tên (trừ chính nó)
            var exists = await _context.Categories
                .AnyAsync(c => c.CategoryName == dto.name && c.CategoryId != id);
            if (exists)
            {
                return Conflict(new
                {
                    status = "error",
                    message = $"Tên danh mục '{dto.name}' đã tồn tại."
                });
            }

            // 🔎 Tìm danh mục cha (nếu có)
            Category? parent = null;
            if (!string.IsNullOrEmpty(dto.parentName))
            {
                parent = await _context.Categories
                    .FirstOrDefaultAsync(c => c.CategoryName == dto.parentName);

                if (parent == null)
                {
                    return NotFound(new
                    {
                        status = "error",
                        message = $"Không tìm thấy danh mục cha '{dto.parentName}'."
                    });
                }

                // 🚫 Không cho chọn chính nó làm cha
                if (parent.CategoryId == id)
                {
                    return BadRequest(new
                    {
                        status = "error",
                        message = "Danh mục không thể là cha của chính nó."
                    });
                }
            }

            // ✅ Cập nhật dữ liệu
            category.CategoryName = dto.name;
            category.ParentCategoryId = parent?.CategoryId;

            _context.Categories.Update(category);
            await _context.SaveChangesAsync();

            // 🔁 Chuẩn bị dữ liệu trả về
            var result = new CategoryDto
            {
                id = category.CategoryId,
                name = category.CategoryName,
                parentId = category.ParentCategoryId,
                parentName = parent?.CategoryName
            };

            return Ok(new
            {
                status = "success",
                message = "Cập nhật danh mục thành công.",
                data = result
            });
        }


    }
}
