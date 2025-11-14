// Services/Interfaces/IDashboardService.cs

using backend.DTOs;

namespace backend.Interfaces.IServices
{
    public interface IDashboardService
    {
        Task<DashboardDataDto> GetDashboardDataAsync();

        Task<DashboardKpiDto> GetKpiDataAsync();

        Task<List<RevenueDataDto>> GetRevenueDataAsync(int days = 7);

        Task<List<OrderStatusDto>> GetOrderStatusDataAsync();

        Task<List<RecentOrderDto>> GetRecentOrdersAsync(int count = 5);

        Task<List<RecentReviewDto>> GetRecentReviewsAsync(int count = 5);

        Task<IEnumerable<TopSellingProductDto>> GetTopSellingProductsAsync(int count = 10);
    }
}