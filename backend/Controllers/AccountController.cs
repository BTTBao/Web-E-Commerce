using backend.Data;
using backend.DTOs;
using backend.Entities;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
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
            if (string.IsNullOrEmpty(request.Phone) || string.IsNullOrEmpty(request.Password))
                return BadRequest(new { message = "Số điện thoại và mật khẩu là bắt buộc" });

            if (_context.Accounts.Any(a => a.Phone == request.Phone))
                return BadRequest(new { message = "Số điện thoại đã tồn tại" }); 

            if (_context.Accounts.Any(a => a.Email == request.Email))
                return BadRequest(new { message = "Email đã tồn tại" });

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            // ----------------------------------------

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
            var emailToken = GenerateJwtToken(account.Email, 0);

            var confirmationLink = $"{Request.Scheme}://{Request.Host}/api/email/confirm-email?token={emailToken}";
            SendMail.SendMailFor(account.Email, confirmationLink);
            return Ok(new { message = "Đăng ký thành công" });
        }

        [HttpPost("login")] // <-- ĐỔI SANG HTTPPOST
        public IActionResult Login([FromBody] LoginRequest request) // <-- NHẬN TỪ BODY
        {
            var account = _context.Accounts
                .Include(a => a.User)
                .FirstOrDefault(x => x.Email == request.Email);

            // Xác thực mật khẩu
            if (account == null || !BCrypt.Net.BCrypt.Verify(request.Password, account.PasswordHash))
            {
                return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu" });
            }

            var token = GenerateJwtToken(account.Email, account.Role);

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
                    account.IsActive,
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
        [HttpPut("update-info")]
        [Authorize]
        public async Task<IActionResult> UpdateInfo([FromBody] UpdateInfoDto request)
        {
            var userEmail = User.Identity?.Name;
            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized(new { message = "Token không hợp lệ hoặc đã hết hạn." });
            }

            var account = await _context.Accounts
                                          .Include(a => a.User)
                                          .FirstOrDefaultAsync(a => a.Email == userEmail); 

            if (account == null)
            {

                return NotFound(new { message = "Không tìm thấy tài khoản." });
            }
            if (account.Phone != request.Phone && !string.IsNullOrEmpty(request.Phone))
            {
                if (await _context.Accounts.AnyAsync(a => a.Phone == request.Phone))
                {
                    return BadRequest(new { message = "Số điện thoại này đã được sử dụng." });
                }
                account.Phone = request.Phone;
            }


            if (account.User == null)
            {
                return StatusCode(500, new { message = "Lỗi dữ liệu: Không tìm thấy hồ sơ người dùng." });
            }


            account.User.FullName = request.FullName;
            account.User.Gender = request.Gender;
            account.User.DateOfBirth = request.DateOfBirth;


            await _context.SaveChangesAsync();

            var updatedAccountResponse = new
            {
                account.AccountId,
                account.Email,
                account.Phone,
                role = account.Role.ToString(),
                createdAt = account.CreatedAt,
                user = new
                {
                    account.User.FullName,
                    account.User.Gender,
                    account.User.DateOfBirth,
                    account.User.AvatarUrl,
                    account.User.AccountId
                }
            };

            return Ok(new
            {
                message = "Cập nhật thông tin thành công!",
                account = updatedAccountResponse
            });
        }

        [HttpPost("change-password")]
        [Authorize] // Bắt buộc người dùng phải đăng nhập
        public async Task<IActionResult> ChangePassword([FromBody] PasswordDto request)
        {
            var userEmail = User.Identity?.Name;
            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized(new { message = "Token không hợp lệ." });
            }

            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Email == userEmail);
            if (account == null)
            {
                return NotFound(new { message = "Không tìm thấy tài khoản." });
            }

            if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, account.PasswordHash))
            {
                return BadRequest(new { message = "Mật khẩu cũ không chính xác." });
            }
            var newPasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            account.PasswordHash = newPasswordHash;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                return BadRequest(new { message = "Lỗi khi lưu CSDL.", error = ex.Message });
            }

            return Ok(new { message = "Đổi mật khẩu thành công." });
        }
    }
}