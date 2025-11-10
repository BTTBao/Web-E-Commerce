using backend.Entities;

namespace backend.Interfaces.IRepositories
{
    public interface ICartRepository
    {
        Task<Cart?> GetCartByUserIdAsync(int accountId);
        Task AddItemAsync(int accountId, int productId, int variantId, int quantity);
        Task UpdateItemQuantityAsync(int accountId, int productId, int variantId, int quantity);
        Task RemoveItemAsync(int accountId, int productId, int variantId);
    }
}
