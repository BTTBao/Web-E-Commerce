using backend.Data;
using backend.Entities;
using backend.Interfaces.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories
{
    public class CartRepository : ICartRepository
    {
        private readonly ApplicationDbContext _context;

        public CartRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task AddItemAsync(int accountId, int productId, int variantId, int quantity)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.AccountId == accountId);

            if (cart == null)
            {
                cart = new Cart { AccountId = accountId, CreatedAt = DateTime.UtcNow, CartItems = new List<CartItem>() };
                await _context.Carts.AddAsync(cart);
            }

            var existing = cart.CartItems.FirstOrDefault(ci =>
                ci.ProductId == productId &&
                (ci.VariantId == variantId || (ci.VariantId == null)));
            if (existing != null)
            {
                existing.Quantity = (existing.Quantity ?? 0) + quantity;
                existing.VariantId = variantId;
                existing.AddedAt = DateTime.UtcNow;
                _context.Entry(existing).State = EntityState.Modified;
            }
            else
            {
                var item = new CartItem
                {
                    ProductId = productId,
                    Quantity = quantity,
                    VariantId = variantId,
                    AddedAt = DateTime.UtcNow,
                    Cart = cart
                };
                cart.CartItems.Add(item);
                await _context.CartItems.AddAsync(item);
            }
        }

        public async Task<Cart?> GetCartByUserIdAsync(int accountId)
        {
            return await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Variant)
                .FirstOrDefaultAsync(c => c.AccountId == accountId);
        }

        public async Task RemoveItemAsync(int accountId, int productId, int variantId)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.AccountId == accountId);
            if (cart == null) return;

            var existing = cart.CartItems.FirstOrDefault(ci =>
                ci.ProductId == productId &&
                (ci.VariantId == variantId || (ci.VariantId == null)));
            if (existing == null) return;

            _context.CartItems.Remove(existing);
        }

        public async Task UpdateItemQuantityAsync(int accountId, int productId, int variantId, int quantity)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.AccountId == accountId);
            if (cart == null) throw new InvalidOperationException("Không tìm thấy giỏ hàng");

            var existing = cart.CartItems.FirstOrDefault(ci => ci.ProductId == productId);
            if (existing == null) throw new InvalidOperationException("Không tìm thấy sản phẩm trong giỏ hàng");

            existing.Quantity = quantity;
            existing.VariantId = variantId;
            _context.Entry(existing).State = EntityState.Modified;
        }
    }
}
