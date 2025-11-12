// Interfaces/IPhotoService.cs
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;

namespace backend.Interfaces.IServices
{
    public interface IPhotoService
    {
        Task<ImageUploadResult> AddPhotoAsync(IFormFile file);
        Task<DeletionResult> DeletePhotoAsync(string publicId);
    }
}