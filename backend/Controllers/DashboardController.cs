// Controllers/DashboardController.cs

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Interfaces.IServices;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Yêu cầu đăng nhập
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(
            IDashboardService dashboardService,
            ILogger<DashboardController> logger)
        {
            _dashboardService = dashboardService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboardData()
        {
            try
            {
                var data = await _dashboardService.GetDashboardDataAsync();
                return Ok(new
                {
                    success = true,
                    data = data,
                    message = "Lấy dữ liệu dashboard thành công"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard data");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Có lỗi xảy ra khi lấy dữ liệu dashboard"
                });
            }
        }

        [HttpGet("kpi")]
        public async Task<IActionResult> GetKpiData()
        {
            try
            {
                var data = await _dashboardService.GetKpiDataAsync();
                return Ok(new
                {
                    success = true,
                    data = data
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting KPI data");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Có lỗi xảy ra khi lấy dữ liệu KPI"
                });
            }
        }


        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenueData([FromQuery] int days = 7)
        {
            try
            {
                if (days < 1 || days > 30)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Số ngày phải từ 1 đến 30"
                    });
                }

                var data = await _dashboardService.GetRevenueDataAsync(days);
                return Ok(new
                {
                    success = true,
                    data = data
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting revenue data");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Có lỗi xảy ra khi lấy dữ liệu doanh thu"
                });
            }
        }

        [HttpGet("order-status")]
        public async Task<IActionResult> GetOrderStatusData()
        {
            try
            {
                var data = await _dashboardService.GetOrderStatusDataAsync();
                return Ok(new
                {
                    success = true,
                    data = data
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order status data");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Có lỗi xảy ra khi lấy dữ liệu trạng thái đơn hàng"
                });
            }
        }

        [HttpGet("recent-orders")]
        public async Task<IActionResult> GetRecentOrders([FromQuery] int count = 5)
        {
            try
            {
                if (count < 1 || count > 20)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Số lượng phải từ 1 đến 20"
                    });
                }

                var data = await _dashboardService.GetRecentOrdersAsync(count);
                return Ok(new
                {
                    success = true,
                    data = data
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent orders");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Có lỗi xảy ra khi lấy danh sách đơn hàng"
                });
            }
        }

        [HttpGet("recent-reviews")]
        public async Task<IActionResult> GetRecentReviews([FromQuery] int count = 5)
        {
            try
            {
                if (count < 1 || count > 20)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Số lượng phải từ 1 đến 20"
                    });
                }

                var data = await _dashboardService.GetRecentReviewsAsync(count);
                return Ok(new
                {
                    success = true,
                    data = data
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent reviews");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Có lỗi xảy ra khi lấy danh sách đánh giá"
                });
            }
        }
    }
}