// Services/ProductService.cs (ĐÃ SỬA LỖI)

using backend.Data;
using backend.DTOs;
using backend.Entities;
using backend.Interfaces.IRepositories;
using backend.Interfaces.IServices;
using Humanizer;
using Microsoft.EntityFrameworkCore;
using NuGet.Protocol.Core.Types;

namespace backend.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _repository;
        private readonly ApplicationDbContext _context;

        public ProductService(IProductRepository repository, ApplicationDbContext context)
        {
            _repository = repository;
            _context = context;
        }

        // ... (Các hàm GetAllProducts, GetProductById, AddProduct không đổi) ...
        public async Task<IEnumerable<ProductDto>> GetAllProducts()
        {
            var products = await _repository.GetAllAsync();
            return products.Select(MapToDto);
        }

        public async Task<ProductDto?> GetProductById(int id)
        {
            var product = await _repository.GetByIdAsync(id);
            if (product == null) return null;
            return MapToDto(product);
        }

        public async Task<ProductDto> AddProduct(ProductDto productDto)
        {
            ValidateForCreateOrUpdate(productDto);
            var entity = MapToEntity(productDto);
            entity.CreatedAt = DateTime.UtcNow; // Giả sử model Entity có CreatedAt
            await _repository.AddAsync(entity);
            // await _context.SaveChangesAsync(); // Thường Repository sẽ lo việc này?
            return MapToDto(entity);
        }


        public async Task<bool> UpdateProduct(int id, ProductDto dto)
        {
            if (id != dto.ProductId)
                throw new ArgumentException("Id sản phẩm không khớp");

            ValidateForCreateOrUpdate(dto);

            var existing = await _repository.GetByIdAsync(id);
            if (existing == null)
                return false;

            // Cập nhật thuộc tính
            existing.Name = dto.Name;
            existing.Description = dto.Description;
            existing.Price = dto.Price;
            existing.StockQuantity = dto.StockQuantity;
            existing.SoldCount = dto.SoldCount;
            existing.Status = dto.Status;
            existing.CategoryId = dto.CategoryId;

            // Thay thế 
            existing.ProductImages = dto.ProductImages
                .Select(pi => new ProductImage
                {
                    ImageId = pi.ImageId,
                    ProductId = pi.ProductId,
                    ImageUrl = pi.ImageUrl,
                    IsPrimary = pi.IsPrimary
                })
                .ToList();

            // === SỬA LỖI (Dòng 85 cũ) ===
            existing.ProductVariants = dto.ProductVariants
                .Select(v => new ProductVariant
                {
                    VariantId = v.VariantId,
                    ProductId = v.ProductId,
                    
                    // VariantName = v.VariantName, // <-- Lỗi ở đây
                    Size = v.Size,                  // <-- Sửa thành 2 dòng này
                    Color = v.Color,                // <-- Sửa thành 2 dòng này

                    Sku = v.Sku,
                    Price = v.Price,
                    StockQuantity = v.StockQuantity
                })
                .ToList();

            existing.Reviews = dto.Reviews
                .Select(r => new Review
                {
                    ReviewId = r.ReviewId,
                    ProductId = r.ProductId,
                    AccountId = r.AccountId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                })
                .ToList();

            await _repository.UpdateAsync(existing);

            try
            {
                // Giả sử UpdateAsync không SaveChanges, chúng ta gọi nó ở đây
                await _context.SaveChangesAsync(); 
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _repository.ExistsAsync(id))
                    return false;
                throw;
            }

            return true;
        }

        public async Task<bool> DeleteProduct(int id)
        {
            var product = await _repository.GetByIdAsync(id);
            if (product == null)
                return false;
            await _repository.DeleteAsync(product);
            await _context.SaveChangesAsync();
            return true;
        }

        private static ProductDto MapToDto(Product p)
        {
            return new ProductDto
            {
                ProductId = p.ProductId,
                CategoryId = p.CategoryId,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                StockQuantity = p.StockQuantity,
                SoldCount = p.SoldCount,
                Status = p.Status,
                CreatedAt = p.CreatedAt,
                ProductImages = p.ProductImages?.Select(pi => new ProductImageDto
                {
                    ImageId = pi.ImageId,
                    ProductId = pi.ProductId,
                    ImageUrl = pi.ImageUrl,
                    IsPrimary = pi.IsPrimary
                }).ToList() ?? new List<ProductImageDto>(),
                
                // === SỬA LỖI (Dòng 154 cũ) ===
                ProductVariants = p.ProductVariants?.Select(v => new ProductVariantDto
                {
                    VariantId = v.VariantId,
                    ProductId = v.ProductId,

                    // VariantName = v.VariantName, // <-- Lỗi ở đây
                    Size = v.Size,                  // <-- Sửa thành 2 dòng này
                    Color = v.Color,                // <-- Sửa thành 2 dòng này

                    Sku = v.Sku,
                    Price = v.Price,
                    StockQuantity = v.StockQuantity
                }).ToList() ?? new List<ProductVariantDto>(),

                Reviews = p.Reviews?.Select(r => new ReviewDto
                {
                    ReviewId = r.ReviewId,
                    ProductId = r.ProductId,
                    AccountId = r.AccountId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                }).ToList() ?? new List<ReviewDto>()
            };
        }
        private static Product MapToEntity(ProductDto dto)
        {
            return new Product
            {
                ProductId = dto.ProductId,
                CategoryId = dto.CategoryId,
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                StockQuantity = dto.StockQuantity,
                SoldCount = dto.SoldCount,
                Status = dto.Status,
                CreatedAt = dto.CreatedAt,
                ProductImages = dto.ProductImages.Select(pi => new ProductImage
                {
                    ImageId = pi.ImageId,
                    ProductId = pi.ProductId,
                    ImageUrl = pi.ImageUrl,
                    IsPrimary = pi.IsPrimary
                }).ToList(),
                
                // === SỬA LỖI (Dòng 194 cũ) ===
                ProductVariants = dto.ProductVariants.Select(v => new ProductVariant
                {
                    VariantId = v.VariantId,
                    ProductId = v.ProductId,

                    // VariantName = v.VariantName, // <-- Lỗi ở đây
                    Size = v.Size,                  // <-- Sửa thành 2 dòng này
                    Color = v.Color,                // <-- Sửa thành 2 dòng này

                    Sku = v.Sku,
                    Price = v.Price,
                    StockQuantity = v.StockQuantity
                }).ToList(),

                Reviews = dto.Reviews.Select(r => new Review
                {
                    ReviewId = r.ReviewId,
                    ProductId = r.ProductId,
                    AccountId = r.AccountId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                }).ToList()
            };
        }

        private static void ValidateForCreateOrUpdate(ProductDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new ArgumentException("Tên sản phẩm không được để trống");
            
            // Sửa logic check null cho Price và StockQuantity
            if (dto.Price.HasValue && dto.Price < 0)
                throw new ArgumentException("Giá sản phẩm không hợp lệ");
            if (dto.StockQuantity.HasValue && dto.StockQuantity < 0)
                throw new ArgumentException("Số lượng tồn kho không hợp lệ");
        }
        public Task<IEnumerable<ProductDto>> GetProductsByCategory(string categoryName)
        {
            return null;
        }
    }
}