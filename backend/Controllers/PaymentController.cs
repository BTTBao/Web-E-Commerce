using backend.Data;
using backend.Entities;
using backend.Interfaces.IServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IVnPayService _vnPayService;
        private readonly ApplicationDbContext _context;

        public PaymentController(IVnPayService vnPayService, ApplicationDbContext context)
        {
            _vnPayService = vnPayService;
            _context = context;
        }

        // POST: api/payment/create-payment
        [HttpPost("create-payment")]
        public IActionResult CreatePaymentUrlVnpay([FromBody] PaymentInformationModel model)
        {
            if (model == null)
                return BadRequest("Invalid data");

            var url = _vnPayService.CreatePaymentUrl(model, HttpContext);

            return Ok(new
            {
                paymentUrl = url
            });
        }

        // GET: api/payment/payment-callback
        [HttpGet("payment-callback")]
        public IActionResult PaymentCallbackVnpay()
        {
            var response = _vnPayService.PaymentExecute(Request.Query);

            // Nếu thanh toán thành công thì lưu DB
            if (response.Success == true)
            {
                var payment = new Payment
                {
                    OrderId = response.OrderId,
                    Method = response.PaymentMethod,
                    Amount = response.Amount,
                    PaymentStatus = response.PaymentStatus,
                    CreatedAt = DateTime.Now
                };

                // Cập nhật trạng thái Order
                var order = _context.Orders.FirstOrDefault(o => o.OrderId == payment.OrderId);
                if (order != null)
                {
                    order.Status = "Cancelled";
                }

                _context.Payments.Add(payment);
                _context.SaveChanges();
            }

            return Ok(response);
        }
    }

}
