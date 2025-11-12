using backend.Data;
// using backend.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

using backend.Hubs;
using backend.Extensions;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

// --- 1. THÊM CÁC USING CẦN THIẾT ---
using backend.DTOs;
using backend.Interfaces.IServices;
using backend.Services;
// ------------------------------------

var builder = WebApplication.CreateBuilder(args);
var MyAllowSpecificOrigins = "SKYNET_ECOMMERCE";

// CORS cho phép trình duyệt ở domain khác gọi API
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy => policy
            .WithOrigins("http://localhost:5173")
            // .AllowAnyOrigin() // cho phép MỌI domain truy cập
            //Cho phép MỌI loại header
            .AllowAnyHeader()
            //Cho phép MỌI phương thức HTTP
            .AllowAnyMethod()
            .AllowCredentials());
});

// 🧩 Đọc key từ appsettings.json
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]);

// 🧠 Đăng ký Authentication với JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(opt =>
{
    opt.SwaggerDoc("v1", new OpenApiInfo { Title = MyAllowSpecificOrigins, Version = "v1" });
});

// //Đăng ký các dịch vụ (Services) vào DI Container
builder.Services.AddApplicationServices();

//Đăng ký ApplicationDbContext vào DI container.
builder.Services.AddDbContext<ApplicationDbContext>(options => {
    options.UseSqlServer(builder.Configuration.GetConnectionString("SKYNET"));
});


// --- 2. THÊM ĐĂNG KÝ CLOUDINARY ---
// Đọc config "CloudinarySettings" từ appsettings.json
builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));
// Đăng ký dịch vụ xử lý ảnh (để UploadController có thể dùng)
builder.Services.AddScoped<IPhotoService, PhotoService>();
// ---------------------------------


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
//Bật middleware tự động chuyển hướng các request HTTP sang HTTPS cho bảo mật.
app.UseHttpsRedirection();

//Áp dụng chính sách CORS đã được định nghĩa ở trên cho tất cả các request.
app.UseCors(MyAllowSpecificOrigins);

//Auth
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapHub<ChatHub>("/chathub");
app.Run();