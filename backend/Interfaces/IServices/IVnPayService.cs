
namespace backend.Interfaces.IServices
{
    public interface IVnPayService
    {
        string CreatePaymentUrl(PaymentInformationModel model, HttpContext context);
        PaymentResponseModel PaymentExecute(IQueryCollection collections);

    }
    public class PaymentInformationModel
    {
        public int OrderId { get; set; }
        public decimal Amount { get; set; }
    }

    public class PaymentResponseModel
    {
        public bool Success { get; set; }
        public string VnPayResponseCode { get; set; }
        public int OrderId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; }
        public string PaymentStatus { get; set; }
    }

}
