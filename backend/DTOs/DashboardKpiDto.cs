
namespace backend.DTOs
{
    // DTO cho KPI Cards
    public class DashboardKpiDto
    {
        public decimal MonthlyRevenue { get; set; }
        public decimal RevenueChangePercent { get; set; }
        public int NewOrdersCount { get; set; }
        public int NewCustomersCount { get; set; }
        public int LowStockProductsCount { get; set; }
    }

    // DTO cho dữ liệu doanh thu 7 ngày
    public class RevenueDataDto
    {
        public string Day { get; set; }
        public decimal Revenue { get; set; }
    }

    // DTO cho trạng thái đơn hàng
    public class OrderStatusDto
    {
        public string Name { get; set; }
        public int Value { get; set; }
        public string Color { get; set; }
    }

    // DTO cho đơn hàng gần đây
    public class RecentOrderDto
    {
        public string Id { get; set; }
        public string Customer { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; }
    }

    // DTO cho đánh giá gần đây
    public class RecentReviewDto
    {
        public int Id { get; set; }
        public string Product { get; set; }
        public string Customer { get; set; }
        public int Rating { get; set; }
        public string Status { get; set; }
    }

    // DTO tổng hợp cho Dashboard
    public class DashboardDataDto
    {
        public DashboardKpiDto Kpi { get; set; }
        public List<RevenueDataDto> RevenueData { get; set; }
        public List<OrderStatusDto> OrderStatusData { get; set; }
        public List<RecentOrderDto> RecentOrders { get; set; }
        public List<RecentReviewDto> RecentReviews { get; set; }
    }

    public class TopSellingProductDto
    {
        public int ProductId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal? Price { get; set; }
        public int SoldThisMonth { get; set; }
        public decimal RevenueThisMonth { get; set; }
        public string? PrimaryImage { get; set; }
        public string? Category { get; set; }
        public int StockQuantity { get; set; }
    }
}