// Controllers/ReviewsController.cs
using backend.Data;
using backend.DTOs;
using backend.Entities; // <-- Quan trọng: dùng Entities
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReviewsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // --- 1. LẤY TẤT CẢ ĐÁNH GIÁ ---
        // GET: /api/reviews
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetReviews()
        {
            var reviews = await _context.Reviews
                .Include(r => r.Product) // Nạp Tên Sản phẩm
                .Include(r => r.Account) // Nạp Tài khoản
                    .ThenInclude(a => a.User) // Nạp Tên User
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewDto
                {
                    // ✔ 1. ĐÚNG THEO DTO — KHÔNG DÙNG STRING "R001"
                    ReviewId = r.ReviewId,

                    // ✔ 2. TRẢ VỀ ID chứ không trả về tên
                    ProductId = r.ProductId,

                    AccountId = r.AccountId,

                    // ✔ 3. Rating nullable => giữ nguyên
                    Rating = r.Rating,

                    // ✔ 4. Comment giữ nguyên (có thể null)
                    Comment = r.Comment,

                    // ✔ 5. Trả đúng DateTime? theo DTO
                    CreatedAt = r.CreatedAt,

                    // ✔ 6. Status
                    Status = r.Status
                })
                .ToListAsync();

            return Ok(reviews);
        }

        // --- 2. CHUYỂN ĐỔI TRẠNG THÁI (DUYỆT/ẨN) ---
        // PATCH: /api/reviews/{reviewId}/toggle
        [HttpPatch("{reviewId}/toggle")]
        public async Task<IActionResult> ToggleReviewStatus(int reviewId)
        {
            var review = await _context.Reviews.FindAsync(reviewId);

            if (review == null)
            {
                return NotFound(new { status = "error", message = "Không tìm thấy đánh giá." });
            }

            // ✔ Đổi trạng thái
            review.Status = review.Status == "Pending" ? "Approved" : "Pending";

            await _context.SaveChangesAsync();

            return Ok(new { newStatus = review.Status });
        }

        // --- 3. XÓA ĐÁNH GIÁ ---
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

        [HttpPost]
        public async Task<IActionResult> CreateReviews([FromBody] CreateReviewRequest request)
        {
            if (request == null || request.Reviews == null || !request.Reviews.Any())
                return BadRequest(new { status = "error", message = "Dữ liệu không hợp lệ." });

            // kiểm tra đơn hàng
            var order = await _context.Orders.FindAsync(request.OrderId);
            if (order == null)
                return NotFound(new { status = "error", message = "Không tìm thấy đơn hàng." });

            if (order.IsReviewed)
                return BadRequest(new { status = "error", message = "Đơn hàng này đã được đánh giá rồi." });

            foreach (var dto in request.Reviews)
            {
                // kiểm tra sản phẩm
                var product = await _context.Products.FindAsync(dto.ProductId);
                if (product == null)
                    return NotFound(new { status = "error", message = $"Không tìm thấy sản phẩm {dto.ProductId}." });

                // kiểm tra tài khoản
                var account = await _context.Accounts.FindAsync(dto.AccountId);
                if (account == null)
                    return NotFound(new { status = "error", message = $"Không tìm thấy tài khoản {dto.AccountId}." });

                var review = new Review
                {
                    ProductId = dto.ProductId,
                    AccountId = dto.AccountId,
                    Rating = dto.Rating ?? 5,
                    Comment = dto.Comment ?? "",
                    Status = "Pending",
                    CreatedAt = DateTime.Now
                };

                _context.Reviews.Add(review);
            }

            // đánh dấu đơn hàng đã review
            order.IsReviewed = true;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                status = "success",
                message = "Đánh giá đơn hàng thành công."
            });
        }

    }

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