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

        public async Task<DashboardDataDto> GetDashboardDataAsync()
        {
            var dashboardData = new DashboardDataDto
            {
                Kpi = await GetKpiDataAsync(),
                RevenueData = await GetRevenueDataAsync(),
                OrderStatusData = await GetOrderStatusDataAsync(),
                RecentOrders = await GetRecentOrdersAsync(),
                RecentReviews = await GetRecentReviewsAsync()
            };

            return dashboardData;
        }

        public async Task<DashboardKpiDto> GetKpiDataAsync()
        {
            var now = DateTime.Now;
            var currentMonth = new DateTime(now.Year, now.Month, 1);
            var lastMonth = currentMonth.AddMonths(-1);

            // Doanh thu tháng này
            var monthlyRevenue = await _context.Orders
                .Where(o => o.CreatedAt >= currentMonth && o.Status != "Cancelled")
                .SumAsync(o => o.TotalAmount);

            // Doanh thu tháng trước
            var lastMonthRevenue = await _context.Orders
                .Where(o => o.CreatedAt >= lastMonth && o.CreatedAt < currentMonth && o.Status != "Cancelled")
                .SumAsync(o => o.TotalAmount);

            // Tính % thay đổi
            var revenueChangePercent = lastMonthRevenue > 0 
                ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
                : 0;

            // Đơn hàng mới (Pending)
            var newOrdersCount = await _context.Orders
                .CountAsync(o => o.Status == "Pending");

            // Khách hàng mới trong tháng
            var newCustomersCount = await _context.Accounts
                .CountAsync(a => a.CreatedAt >= currentMonth);

            // Sản phẩm sắp hết hàng (tồn kho < 10)
            var lowStockCount = await _context.Products
                .CountAsync(p => p.StockQuantity < 10 && p.Status == "Active");

            return new DashboardKpiDto
            {
                MonthlyRevenue = (decimal) monthlyRevenue,
                RevenueChangePercent = Math.Round((decimal) revenueChangePercent, 1),
                NewOrdersCount = newOrdersCount,
                NewCustomersCount = newCustomersCount,
                LowStockProductsCount = lowStockCount
            };
        }

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

                // Lấy tên ngày theo tiếng Việt
                string dayName = GetVietnameseDayName(currentDate.DayOfWeek);

                revenueData.Add(new RevenueDataDto
                {
                    Day = dayName,
                    Revenue = (decimal)dailyRevenue
                });
            }

            return revenueData;
        }

        public async Task<List<OrderStatusDto>> GetOrderStatusDataAsync()
        {
            var statusGroups = await _context.Orders
                .GroupBy(o => o.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            var orderStatusData = new List<OrderStatusDto>
            {
                new OrderStatusDto 
                { 
                    Name = "Chờ xử lý", 
                    Value = statusGroups.FirstOrDefault(s => s.Status == "Pending")?.Count ?? 0, 
                    Color = "#f59e0b" 
                },
                new OrderStatusDto 
                { 
                    Name = "Đã xác nhận", 
                    Value = statusGroups.FirstOrDefault(s => s.Status == "Confirmed")?.Count ?? 0, 
                    Color = "#3b82f6" 
                },
                new OrderStatusDto 
                { 
                    Name = "Đang giao", 
                    Value = statusGroups.FirstOrDefault(s => s.Status == "Shipped")?.Count ?? 0, 
                    Color = "#8b5cf6" 
                },
                new OrderStatusDto 
                { 
                    Name = "Đã giao", 
                    Value = statusGroups.FirstOrDefault(s => s.Status == "Delivered")?.Count ?? 0, 
                    Color = "#10b981" 
                },
                new OrderStatusDto 
                { 
                    Name = "Đã hủy", 
                    Value = statusGroups.FirstOrDefault(s => s.Status == "Cancelled")?.Count ?? 0, 
                    Color = "#ef4444" 
                }
            };

            return orderStatusData;
        }

        public async Task<List<RecentOrderDto>> GetRecentOrdersAsync(int count = 5)
        {
            var recentOrders = await _context.Orders
                .Where(o => o.Status == "Pending")
                .OrderByDescending(o => o.CreatedAt)
                .Take(count)
                .Include(o => o.Account)
                    .ThenInclude(a => a.User)
                .Select(o => new RecentOrderDto
                {
                    Id = $"DH{o.OrderId.ToString().PadLeft(3, '0')}",
                    Customer = o.Account.User.FullName ?? "Khách hàng",
                    Amount = (decimal) o.TotalAmount,
                    Status = "Chờ xử lý"
                })
                .ToListAsync();

            return recentOrders;
        }

        public async Task<List<RecentReviewDto>> GetRecentReviewsAsync(int count = 5)
        {
            var recentReviews = await _context.Reviews
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
                    Status = "Pending"
                })
                .ToListAsync();

            return recentReviews;
        }

        // Helper method để chuyển đổi tên ngày sang tiếng Việt
        private string GetVietnameseDayName(DayOfWeek dayOfWeek)
        {
            return dayOfWeek switch
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
}