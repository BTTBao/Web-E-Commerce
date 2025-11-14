using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using System.Net;
using System.Net.Mail;

namespace backend.Entities
{
    public class SendMail
    {

        static public void SendMailFor(string toEmail, string link)
        {
            var fromEmail = "quocthuan1133@gmail.com";
            var appPassword = "fgsk ouok wxla rapi";

            var message = new MailMessage();
            message.From = new MailAddress(fromEmail, "My App");
            message.To.Add(toEmail);
            message.Subject = "Xác thực email";
            message.Body = $"Vui lòng click link sau để xác thực tài khoản: {link}";
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
