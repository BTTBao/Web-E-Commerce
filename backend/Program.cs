using backend.Data;
// using backend.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using backend.Hubs;
using backend.Extensions;
var builder = WebApplication.CreateBuilder(args);
var MyAllowSpecificOrigins = "SKYNET_ECOMMERCE";

// CORS cho phép trình duyệt ở domain khác gọi API
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy => policy
            .WithOrigins("http://localhost:5174")
            // .AllowAnyOrigin() // cho phép MỌI domain truy cập
            //Cho phép MỌI loại header
            .AllowAnyHeader()
            //Cho phép MỌI phương thức HTTP
            .AllowAnyMethod()
            .AllowCredentials());
});

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
app.UseAuthorization();

app.MapControllers();

app.MapHub<ChatHub>("/chathub");
app.Run();