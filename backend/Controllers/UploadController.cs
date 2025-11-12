// Controllers/UploadController.cs
using backend.Interfaces.IServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly IPhotoService _photoService;

        public UploadController(IPhotoService photoService)
        {
            _photoService = photoService;
        }

        // API: POST /api/upload
        [HttpPost]
        // --- SỬA Ở ĐÂY ---
        // Thêm [FromForm] để C# nhận diện file
        [ApiExplorerSettings(IgnoreApi = true)] // lỗi cook
        public async Task<IActionResult> UploadImage([FromForm] IFormFile file)
        // --- HẾT SỬA ---
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { status = "error", message = "Không có file nào được chọn." });

            var uploadResult = await _photoService.AddPhotoAsync(file);

            if (uploadResult.Error != null)
            {
                return BadRequest(new { status = "error", message = uploadResult.Error.Message });
            }

            // Trả về URL và PublicId
            return Ok(new
            {
                status = "success",
                imageUrl = uploadResult.SecureUrl.ToString(),
                imagePublicId = uploadResult.PublicId 
            });
        }
    }
}