using backend.Data;
using backend.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace backend.Controllers
{
    public class EmailDto
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Message { get; set; }
    }
    [ApiController]
    [Route("api/[controller]")]
    public class EmailController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public EmailController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }
        [HttpPost]
        public IActionResult SendEmailToShop([FromBody] EmailDto body)
        {
            if (body == null ||
                string.IsNullOrWhiteSpace(body.Name) ||
                string.IsNullOrWhiteSpace(body.Email) ||
                string.IsNullOrWhiteSpace(body.Message))
            {
                return BadRequest("Tên, Email và Message không được để trống!");
            }

            try
            {
                SendMail.SendMailFromCustomer(body.Name, body.Email, body.Message);
                return Ok(new { message = "Gửi mail thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Gửi mail thất bại", error = ex.Message });
            }
        }

        [HttpGet("confirm-email")]
        public IActionResult ConfirmEmail([FromQuery] string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]);

            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = _config["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _config["Jwt:Audience"],
                    ValidateLifetime = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuerSigningKey = true
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                var email = jwtToken.Claims.First(x => x.Type == System.Security.Claims.ClaimTypes.Name).Value;

                var account = _context.Accounts.Include(a => a.User).FirstOrDefault(a => a.Email == email);
                if (account == null) return BadRequest("Email không hợp lệ");

                account.IsActive = true;
                _context.SaveChanges();

                return Ok("Xác thực email thành công!");
            }
            catch
            {
                return BadRequest("Token không hợp lệ hoặc đã hết hạn.");
            }
        }
    }
}
