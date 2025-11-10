using System;
using System.Linq;
using backend.Data;
using backend.DTOs;
using backend.Entities;
using backend.Interfaces.IRepositories;
using backend.Interfaces.IServices;

namespace backend.Services
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _repository;
        private readonly IProductRepository _product;
        private readonly ApplicationDbContext _context;

        public CartService(ICartRepository repository, IProductRepository product, ApplicationDbContext context)
        {
            _repository = repository;
            _product = product;
            _context = context;
        }

        public async Task<CartDto?> GetCartByUserIdAsync(int accountId)
        {
            var cart = await _repository.GetCartByUserIdAsync(accountId);

            if (cart == null) return null;

            var cartItemsDto = new List<CartItemDto>();

            foreach (var item in cart.CartItems)
            {
                // Lấy product tuần tự để tránh lỗi DbContext
                var product = await _product.GetByIdAsync(item.ProductId);

                var cartItemDto = new CartItemDto
                {
                    CartItemId = item.CartItemId,
                    CartId = item.CartId,
                    ProductId = item.ProductId,
                    VariantId = item.VariantId,
                    Quantity = item.Quantity,
                    AddedAt = item.AddedAt,

                    // Lấy thông tin từ Product
                    ProductName = product?.Name,
                    Price = product?.Price,
                    ImageUrl = product?.ProductImages?.FirstOrDefault()?.ImageUrl,

                    // Nếu có Variant
                    VariantName = product?.ProductVariants?
                        .FirstOrDefault(v => v.VariantId == item.VariantId)?
                        .VariantName
                };

                cartItemsDto.Add(cartItemDto);
            }

            return new CartDto
            {
                CartId = cart.CartId,
                AccountId = cart.AccountId,
                CreatedAt = cart.CreatedAt,
                CartItems = cartItemsDto
            };
        }


        public async Task<CartDto> AddItemAsync(int accountId, int productId, int variantId, int quantity)
        {
            if (quantity <= 0) throw new ArgumentException("Số lượng phải lớn hơn 0");
            if (quantity > 10) throw new ArgumentException("Vượt quá giới hạn số lượng(10)");

            var product = await _context.Products.FindAsync(productId);
            if (product == null) throw new ArgumentException("Sản phẩm không tồn tại");

            if(product.StockQuantity < quantity) throw new ArgumentException("Không đủ số lượng tồn kho");

            await _repository.AddItemAsync(accountId, productId, variantId, quantity);
            await _context.SaveChangesAsync();

            var cart = await _repository.GetCartByUserIdAsync(accountId);
            if (cart == null) throw new InvalidOperationException("Không thể tạo giỏ hàng");

            return new CartDto
            {
                CartId = cart.CartId,
                AccountId = cart.AccountId,
                CreatedAt = cart.CreatedAt,
                CartItems = cart.CartItems?.Select(MapToDto).ToList() ?? new List<CartItemDto>()
            };
        }

        public async Task<bool> UpdateItemQuantityAsync(int accountId, int productId, int variantId, int quantity)
        {
            if (quantity <= 0) return false;

            try
            {
                await _repository.UpdateItemQuantityAsync(accountId, productId, variantId, quantity);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (InvalidOperationException)
            {
                return false;
            }
        }

        public async Task<bool> RemoveItemAsync(int accountId, int productId, int variantId)
        {
            try
            {
                await _repository.RemoveItemAsync(accountId, productId, variantId);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        private static CartItemDto MapToDto(CartItem item)
        {
            if (item == null) return null!;

            return new CartItemDto
            {
                CartItemId = item.CartItemId,
                CartId = item.CartId,
                ProductId = item.ProductId,
                VariantId = item.VariantId,
                Quantity = item.Quantity,
                AddedAt = item.AddedAt
            };
        }
    }
}
