using backend.Data;
using backend.DTOs;
using backend.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq; // Cần thêm
using System.Threading.Tasks; // Cần thêm
using System; // Cần thêm

namespace backend.Controllers
{
    // --- DTO CHO PHẢN HỒI PHÂN TRANG ---
    // (React đang mong đợi đối tượng { items: [], totalPages: ... })
    public class PagedReviewResponse
    {
        public List<ReviewAdminDto> Items { get; set; }
        public int TotalPages { get; set; }
        public int CurrentPage { get; set; }
    }

    // --- DTO CHO ADMIN REVIEW (Đã có từ trước) ---
    public class ReviewAdminDto
    {
        public int Id { get; set; }
        public string Product { get; set; }
        public string Customer { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReviewsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // --- 1. SỬA LỖI 405: BỔ SUNG PHƯƠNG THỨC [HttpGet("paged")] ---
        [HttpGet("paged")]
        public async Task<ActionResult<PagedReviewResponse>> GetPagedReviews(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 8,
            [FromQuery] string status = "all")
        {
            // 1. Tạo query cơ bản
            var query = _context.Reviews
                .Include(r => r.Product)
                .Include(r => r.Account)
                    .ThenInclude(a => a.User)
                .AsQueryable();

            // 2. Lọc theo trạng thái
            if (status != "all" && !string.IsNullOrEmpty(status))
            {
                query = query.Where(r => r.Status == status);
            }

            // 3. Đếm tổng số item (TRƯỚC KHI PHÂN TRANG)
            var totalItems = await query.CountAsync();

            // 4. Tính toán số trang
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            // 5. Lấy dữ liệu cho trang hiện tại
            var reviews = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize) // Bỏ qua các trang trước
                .Take(pageSize)             // Lấy số lượng item cho trang này
                .Select(r => new ReviewAdminDto // "Làm phẳng" DTO
                {
                    Id = r.ReviewId,
                    Product = r.Product.Name,
                    Customer = r.Account.User.FullName,
                    Rating = r.Rating ?? 0, // Xử lý null
                    Comment = r.Comment,
                    Date = r.CreatedAt ?? DateTime.MinValue, // Xử lý null
                    Status = r.Status
                })
                .ToListAsync();

            // 6. Trả về đối tượng PagedReviewResponse (khớp với React)
            var response = new PagedReviewResponse
            {
                Items = reviews,
                TotalPages = totalPages,
                CurrentPage = page
            };

            return Ok(response);
        }


        // --- 2. CHUYỂN ĐỔI TRẠNG THÁI (Giữ nguyên) ---
        // PATCH: /api/reviews/{reviewId}/toggle
        [HttpPatch("{reviewId}/toggle")]
        public async Task<IActionResult> ToggleReviewStatus(int reviewId)
        {
            var review = await _context.Reviews.FindAsync(reviewId);
            if (review == null)
            {
                return NotFound(new { status = "error", message = "Không tìm thấy đánh giá." });
            }
            review.Status = review.Status == "Pending" ? "Approved" : "Pending";
            await _context.SaveChangesAsync();
            return Ok(new { newStatus = review.Status });
        }

        // --- 3. XÓA ĐÁNH GIÁ (Giữ nguyên) ---
        // DELETE: /api/reviews/{reviewId}
        [HttpDelete("{reviewId}")]
        public async Task<IActionResult> DeleteReview(int reviewId)
        {
            var review = await _context.Reviews.FindAsync(reviewId);
            if (review == null)
            {
                return NotFound(new { status = "error", message = "Không tìm thấy đánh giá." });
            }
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            return Ok(new { status = "success", message = "Xóa đánh giá thành công." });
        }

        // --- 4. TẠO ĐÁNH GIÁ (Giữ nguyên) ---
        [HttpPost]
        public async Task<IActionResult> CreateReviews([FromBody] CreateReviewRequest request)
        {
            if (request == null || request.Reviews == null || !request.Reviews.Any())
                return BadRequest(new { status = "error", message = "Dữ liệu không hợp lệ." });

            var order = await _context.Orders.FindAsync(request.OrderId);
            if (order == null)
                return NotFound(new { status = "error", message = "Không tìm thấy đơn hàng." });

            if (order.IsReviewed)
                return BadRequest(new { status = "error", message = "Đơn hàng này đã được đánh giá rồi." });

            foreach (var dto in request.Reviews)
            {
                var product = await _context.Products.FindAsync(dto.ProductId);
                if (product == null)
                    return NotFound(new { status = "error", message = $"Không tìm thấy sản phẩm {dto.ProductId}." });

                var account = await _context.Accounts.FindAsync(dto.AccountId);
                if (account == null)
                    return NotFound(new { status = "error", message = $"Không tìm thấy tài khoản {dto.AccountId}." });

                var review = new Review
                {
                    ProductId = dto.ProductId,
                    AccountId = dto.AccountId,
                    Rating = dto.Rating ?? 5,
                    Comment = dto.Comment ?? "",
                    Status = "Approved",
                    CreatedAt = DateTime.Now
                };
                _context.Reviews.Add(review);
            }

            order.IsReviewed = true;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                status = "success",
                message = "Đánh giá đơn hàng thành công."
            });
        }
    }

    // --- CÁC LỚP REQUEST DTO (Giữ nguyên) ---
    public class CreateReviewRequest
    {
        public int OrderId { get; set; }
        public List<CreateReviewDto> Reviews { get; set; } = new();
    }

    public class CreateReviewDto
    {
        public int ProductId { get; set; }
        public int AccountId { get; set; }
        public int? Rating { get; set; }
        public string? Comment { get; set; }
    }
}