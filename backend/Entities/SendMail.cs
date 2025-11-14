using System.Net;
using System.Net.Mail;

namespace backend.Entities
{
    public class SendMail
    {
        static private readonly string fromEmail = "quocthuan1133@gmail.com";
        static private readonly string appPassword = "fgsk ouok wxla rapi";

        static public void SendMailFor(string toEmail, string link)
        {
            var message = new MailMessage();
            message.From = new MailAddress(fromEmail, "My App");
            message.To.Add(toEmail);
            message.Subject = "Xác thực email";

            string html = @"
            <div style='font-family: Arial, sans-serif; background: #f5f6fa; padding: 20px;'>
                <div style='max-width: 600px; margin: auto; background: #fff; border-radius: 12px; padding: 30px;
                            box-shadow: 0 4px 10px rgba(0,0,0,0.1);'>

                <h2 style='text-align:center; color:#2c3e50; margin-bottom: 20px;'>📩 Xác Nhận Hành Động</h2>

                <p style='font-size:16px; color:#555;'>
                    Vui lòng nhấn vào liên kết dưới đây để hoàn tất quá trình:
                </p>

                <div style='margin: 25px 0; text-align:center;'>
                    <a href='{URL}' 
                        style='font-size:16px; color:#1a73e8; text-decoration: underline; word-break: break-all;'>
                    {URL}
                    </a>
                </div>

                <p style='font-size:13px; color:#888; margin-top: 20px; text-align:center;'>
                    Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email.
                </p>

                <hr style='margin:25px 0; border:0; border-top:1px solid #eee;'>

                <p style='text-align:center; font-size:12px; color:#aaa;'>
                    © 2025 YourApp. All rights reserved.
                </p>

                </div>
            </div>";

            message.Body = html;
            message.IsBodyHtml = true;

            var smtp = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                Credentials = new NetworkCredential(fromEmail, appPassword),
                EnableSsl = true
            };

            smtp.Send(message);
        }

        static public void SendMailFromCustomer(string customerName, string customerEmail, string customerMessage)
        {
            var message = new MailMessage();
            message.From = new MailAddress(fromEmail, "Customer Contact");
            message.To.Add(fromEmail);
            message.Subject = "📩 Tin nhắn từ khách hàng";
            string html = $@"
                <div style='font-family: Arial; max-width: 600px; margin:auto; padding: 20px; background:#f4f4f4;'>
                    <h2 style='color:#2563eb;'>📩 Tin nhắn mới từ khách hàng</h2>
                    <p><strong>👤 Họ tên:</strong> {customerName}</p>
                    <p><strong>📧 Email:</strong> {customerEmail}</p>
                    <p><strong>💬 Tin nhắn:</strong></p>
                    <div style='padding:15px; background:#fff; border-radius:8px; border:1px solid #ddd;'>
                        {customerMessage}
                    </div>
                </div>
            ";

            message.Body = html;
            message.IsBodyHtml = true;

            var smtp = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                Credentials = new NetworkCredential(fromEmail, appPassword),
                EnableSsl = true
            };

            smtp.Send(message);
        }
    }
}
