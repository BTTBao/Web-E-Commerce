using backend.DTOs;

namespace backend.Interfaces.IServices
{
    public interface ICartService
    {
        Task<CartDto?> GetCartByUserIdAsync(int accountId);
        Task<CartDto> AddItemAsync(int accountId, int productId, int variantId, int quantity);
        Task<bool> UpdateItemQuantityAsync(int accountId, int productId, int variantId, int quantity);
        Task<bool> RemoveItemAsync(int accountId, int productId, int variantId);
    }
}
