// Controllers/ReviewsController.cs
using backend.Data;
using backend.DTOs;
using backend.Entities; // <-- Quan trọng: dùng Entities
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
                    // Lỗi CS1501 thực ra là ở dòng "Date" bên dưới, nhưng trình biên dịch
                    // báo nhầm lên dòng "Id". Dòng "Id" này là đúng.
                    Id = "R" + r.ReviewId.ToString("D3"), 

                    Product = r.Product.Name, // Giả sử Product.Name không null

                    // SỬA 1: Xử lý nếu User hoặc FullName bị null
                    Customer = r.Account.User.FullName ?? "Người dùng ẩn danh", 
                    
                    // SỬA 2: Lỗi CS0266 - Cung cấp giá trị mặc định cho int?
                    Rating = r.Rating ?? 0, 

                    Comment = r.Comment, // string có thể là null, nên ok
                    
                    // SỬA 3: Lỗi CS1501 - Phải kiểm tra HasValue trước khi format
                    Date = r.CreatedAt.HasValue ? r.CreatedAt.Value.ToString("yyyy-MM-dd") : "", 

                    Status = r.Status // Status là NOT NULL, nên ok
                })
                .ToListAsync();

            return Ok(reviews);
        }

        // --- 2. CHUYỂN ĐỔI TRẠNG THÁI (DUYỆT/ẨN) ---
        // PATCH: /api/reviews/{reviewId}/toggle
        [HttpPatch("{reviewId}/toggle")]
        public async Task<IActionResult> ToggleReviewStatus(string reviewId)
        {
            // Parse "R001" thành số 1
            if (string.IsNullOrEmpty(reviewId) || !reviewId.StartsWith("R") || !int.TryParse(reviewId.AsSpan(1), out int id))
            {
                return BadRequest(new { status = "error", message = "ID đánh giá không hợp lệ." });
            }

            var review = await _context.Reviews.FindAsync(id);

            if (review == null)
            {
                return NotFound(new { status = "error", message = "Không tìm thấy đánh giá." });
            }

            // Logic chuyển đổi
            if (review.Status == "Pending")
            {
                review.Status = "Approved";
            }
            else if (review.Status == "Approved")
            {
                review.Status = "Pending";
            }

            await _context.SaveChangesAsync();

            // Trả về trạng thái mới để React cập nhật
            return Ok(new { newStatus = review.Status });
        }

        // --- 3. XÓA ĐÁNH GIÁ ---
        // DELETE: /api/reviews/{reviewId}
        [HttpDelete("{reviewId}")]
        public async Task<IActionResult> DeleteReview(string reviewId)
        {
            // Parse "R001" thành số 1
            if (string.IsNullOrEmpty(reviewId) || !reviewId.StartsWith("R") || !int.TryParse(reviewId.AsSpan(1), out int id))
            {
                return BadRequest(new { status = "error", message = "ID đánh giá không hợp lệ." });
            }

            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
            {
                return NotFound(new { status = "error", message = "Không tìm thấy đánh giá." });
            }

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return Ok(new { status = "success", message = "Xóa đánh giá thành công." });
        }
    }
}