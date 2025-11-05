using backend.Data;
using backend.Entities;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;

namespace backend.Controllers
{
    public class RegisterRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }

        public string FullName { get; set; }
        public string Gender { get; set; }
        public DateOnly? DateOfBirth { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public AccountController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        private string GenerateJwtToken(string username, int? role)
        {
            var jwtSettings = _config.GetSection("Jwt");
            var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(jwtSettings["Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, username),
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, role.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(double.Parse(jwtSettings["ExpireHours"] ?? "2")),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
                return BadRequest(new { message = "Username và mật khẩu là bắt buộc" });

            if (_context.Accounts.Any(a => a.Phone == request.Phone))
                return BadRequest(new { message = "Username đã tồn tại" });
            if (_context.Accounts.Any(a => a.Email == request.Email))
                return BadRequest(new { message = "Email đã tồn tại" });

            var passwordHash = request.Password;

            var account = new Account
            {
                PasswordHash = passwordHash,
                Email = request.Email,
                Phone = request.Phone,
                Role = 0,
                CreatedAt = DateTime.Now
            };

            _context.Accounts.Add(account);
            _context.SaveChanges();

            var user = new User
            {
                AccountId = account.AccountId,
                FullName = request.FullName,
                Gender = request.Gender,
                DateOfBirth = request.DateOfBirth,
                AvatarUrl = ""
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok(new { message = "Đăng ký thành công" });
        }
        [HttpGet("login")]
        public IActionResult Login([FromQuery] string username, [FromQuery] string password)
        {
            var account = _context.Accounts
                .Include(a => a.User)
                .FirstOrDefault(x => x.Phone == username && x.PasswordHash == password);

            if (account == null)
                return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu" });

            var token = GenerateJwtToken(account.Phone, account.Role);

            return Ok(new
            {
                message = "Đăng nhập thành công",
                token,
                account = new
                {
                    account.AccountId,
                    account.Email,
                    account.Phone,
                    role = account.Role.ToString(),
                    createdAt = account.CreatedAt,
                    user = account.User == null ? null : new
                    {
                        account.User.FullName,
                        account.User.Gender,
                        account.User.DateOfBirth,
                        account.User.AvatarUrl,
                        account.User.AccountId
                    }
                }
            });
        }
    }
}
