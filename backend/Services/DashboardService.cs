// Services/DashboardService.cs

using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Interfaces.IServices;

namespace backend.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly ApplicationDbContext _context;

        public DashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Lấy toàn bộ dữ liệu dashboard
        public async Task<DashboardDataDto> GetDashboardDataAsync()
        {
            return new DashboardDataDto
            {
                Kpi = await GetKpiDataAsync(),
                RevenueData = await GetRevenueDataAsync(),
                OrderStatusData = await GetOrderStatusDataAsync(),
                RecentOrders = await GetRecentOrdersAsync(),
                RecentReviews = await GetRecentReviewsAsync()
            };
        }

        // KPI tổng quan
        public async Task<DashboardKpiDto> GetKpiDataAsync()
        {
            var now = DateTime.Now;
            var currentMonth = new DateTime(now.Year, now.Month, 1);
            var lastMonth = currentMonth.AddMonths(-1);

            var monthlyRevenue = await _context.Orders
                .Where(o => o.CreatedAt >= currentMonth && o.Status != "Cancelled")
                .SumAsync(o => o.TotalAmount);

            var lastMonthRevenue = await _context.Orders
                .Where(o => o.CreatedAt >= lastMonth && o.CreatedAt < currentMonth && o.Status != "Cancelled")
                .SumAsync(o => o.TotalAmount);

            var revenueChangePercent = lastMonthRevenue > 0
                ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
                : 0;

            var newOrdersCount = await _context.Orders
                .CountAsync(o => o.Status == "Pending");

            var newCustomersCount = await _context.Accounts
                .CountAsync(a => a.CreatedAt >= currentMonth);

            var lowStockCount = await _context.Products
                .CountAsync(p => p.StockQuantity < 10 && p.Status == "Active");

            return new DashboardKpiDto
            {
                MonthlyRevenue = (decimal)monthlyRevenue,
                RevenueChangePercent = Math.Round((decimal)revenueChangePercent, 1),
                NewOrdersCount = newOrdersCount,
                NewCustomersCount = newCustomersCount,
                LowStockProductsCount = lowStockCount
            };
        }

        // Doanh thu theo số ngày
        public async Task<List<RevenueDataDto>> GetRevenueDataAsync(int days = 7)
        {
            var startDate = DateTime.Now.AddDays(-days + 1).Date;
            var revenueData = new List<RevenueDataDto>();

            for (int i = 0; i < days; i++)
            {
                var currentDate = startDate.AddDays(i);
                var nextDate = currentDate.AddDays(1);

                var dailyRevenue = await _context.Orders
                    .Where(o => o.CreatedAt >= currentDate && o.CreatedAt < nextDate && o.Status != "Cancelled")
                    .SumAsync(o => o.TotalAmount);

                revenueData.Add(new RevenueDataDto
                {
                    Day = GetVietnameseDayName(currentDate.DayOfWeek),
                    Revenue = (decimal)dailyRevenue
                });
            }

            return revenueData;
        }

        // Thống kê trạng thái đơn hàng
        public async Task<List<OrderStatusDto>> GetOrderStatusDataAsync()
        {
            var statusGroups = await _context.Orders
                .GroupBy(o => o.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            return new List<OrderStatusDto>
            {
                new OrderStatusDto { Name = "Chờ xử lý", Value = statusGroups.FirstOrDefault(s => s.Status == "Pending")?.Count ?? 0, Color = "#f59e0b" },
                new OrderStatusDto { Name = "Đã xác nhận", Value = statusGroups.FirstOrDefault(s => s.Status == "Confirmed")?.Count ?? 0, Color = "#3b82f6" },
                new OrderStatusDto { Name = "Đang giao", Value = statusGroups.FirstOrDefault(s => s.Status == "Shipped")?.Count ?? 0, Color = "#8b5cf6" },
                new OrderStatusDto { Name = "Đã giao", Value = statusGroups.FirstOrDefault(s => s.Status == "Delivered")?.Count ?? 0, Color = "#10b981" },
                new OrderStatusDto { Name = "Đã hủy", Value = statusGroups.FirstOrDefault(s => s.Status == "Cancelled")?.Count ?? 0, Color = "#ef4444" }
            };
        }

        // Đơn hàng gần đây
        // Đơn hàng gần đây - FIXED
        public async Task<List<RecentOrderDto>> GetRecentOrdersAsync(int count = 5)
        {
            return await _context.Orders
                .Where(o => o.Status == "Pending")
                .OrderByDescending(o => o.CreatedAt)
                .Take(count)
                .Select(o => new RecentOrderDto
                {
                    Id = $"DH{o.OrderId.ToString().PadLeft(3, '0')}",
                    Customer = o.Account != null && o.Account.User != null 
                        ? o.Account.User.FullName ?? "Khách hàng" 
                        : "Khách hàng",
                    Amount = o.TotalAmount ?? 0,
                    Status = "Chờ xử lý"
                })
                .ToListAsync();
        }

        // Đánh giá gần đây
        public async Task<List<RecentReviewDto>> GetRecentReviewsAsync(int count = 5)
        {
            return await _context.Reviews
                .OrderByDescending(r => r.CreatedAt)
                .Take(count)
                .Include(r => r.Product)
                .Include(r => r.Account)
                    .ThenInclude(a => a.User)
                .Select(r => new RecentReviewDto
                {
                    Id = r.ReviewId,
                    Product = r.Product.Name,
                    Customer = r.Account.User.FullName ?? "Khách hàng",
                    Rating = r.Rating ?? 5,
                    Status = r.Status
                })
                .ToListAsync();
        }

        // Top sản phẩm bán chạy
        public async Task<IEnumerable<TopSellingProductDto>> GetTopSellingProductsAsync(int count = 10)
        {
            var now = DateTime.Now;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);
            var endOfMonth = startOfMonth.AddMonths(1).AddSeconds(-1);

            var topProducts = await _context.OrderDetails
                .Include(od => od.Order)
                .Include(od => od.Product)
                    .ThenInclude(p => p.ProductImages)
                .Include(od => od.Product)
                    .ThenInclude(p => p.Category)
                .Where(od =>
                    od.Order.CreatedAt >= startOfMonth &&
                    od.Order.CreatedAt <= endOfMonth &&
                    (od.Order.Status == "Confirmed" || od.Order.Status == "Shipped" || od.Order.Status == "Delivered")
                )
                .GroupBy(od => new
                {
                    od.ProductId,
                    od.Product.Name,
                    od.Product.Price,
                    od.Product.StockQuantity,
                    CategoryName = od.Product.Category.CategoryName,
                    PrimaryImage = od.Product.ProductImages.FirstOrDefault(img => img.IsPrimary == true).ImageUrl
                })
                .Select(g => new TopSellingProductDto
                {
                    ProductId = g.Key.ProductId,
                    Name = g.Key.Name,
                    Price = g.Key.Price,
                    StockQuantity = g.Key.StockQuantity ?? 0,
                    Category = g.Key.CategoryName,
                    PrimaryImage = g.Key.PrimaryImage,
                    SoldThisMonth = (int)g.Sum(od => od.Quantity),
                    RevenueThisMonth = g.Sum(od => od.SubTotal ?? 0)
                })
                .OrderByDescending(p => p.SoldThisMonth)
                .Take(count)
                .ToListAsync();

            return topProducts;
        }

        // ================= Helper =================
        private string GetVietnameseDayName(DayOfWeek dayOfWeek) => dayOfWeek switch
        {
            DayOfWeek.Monday => "T2",
            DayOfWeek.Tuesday => "T3",
            DayOfWeek.Wednesday => "T4",
            DayOfWeek.Thursday => "T5",
            DayOfWeek.Friday => "T6",
            DayOfWeek.Saturday => "T7",
            DayOfWeek.Sunday => "CN",
            _ => ""
        };
    }
}
