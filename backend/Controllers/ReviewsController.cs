using backend.Data;
using backend.DTOs;
using backend.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    // --- ĐỊNH NGHĨA DTO MỚI ĐỂ KHỚP VỚI FRONTEND ---
    // DTO này sẽ chứa các trường mà React component mong đợi
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

        // --- 1. SỬA LẤY TẤT CẢ ĐÁNH GIÁ ---
        // GET: /api/reviews
        [HttpGet]
        // Trả về DTO mới (ReviewAdminDto)
        public async Task<ActionResult<IEnumerable<ReviewAdminDto>>> GetReviews()
        {
            var reviews = await _context.Reviews
                .Include(r => r.Product) // Nạp Tên Sản phẩm
                .Include(r => r.Account) // Nạp Tài khoản
                    .ThenInclude(a => a.User) // Nạp Tên User
                .OrderByDescending(r => r.CreatedAt)
                // Sửa Select để khớp với ReviewAdminDto
                .Select(r => new ReviewAdminDto
                {
                    Id = r.ReviewId, // Frontend dùng "id"
                    Product = r.Product.Name, // Frontend dùng "product"
                    Customer = r.Account.User.FullName, // Frontend dùng "customer"
                    
                    // SỬA LỖI 1: Nếu Rating là null, dùng 0 làm mặc định
                    Rating = r.Rating ?? 0, // Frontend dùng "rating"
                    
                    Comment = r.Comment, // Frontend dùng "comment"
                    
                    // SỬA LỖI 2: Nếu CreatedAt là null, dùng giá trị ngày giờ nhỏ nhất làm mặc định
                    Date = r.CreatedAt ?? DateTime.MinValue, // Frontend dùng "date"
                    
                    Status = r.Status // Frontend dùng "status"
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

            // Đổi trạng thái
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
        
        // --- 4. TẠO ĐÁNH GIÁ (GIỮ NGUYÊN) ---
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
    
    // --- CÁC LỚP REQUEST DTO (GIỮ NGUYÊN) ---
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