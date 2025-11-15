// Services/ProductService.cs

using backend.Data;
using backend.DTOs;
using backend.Entities;
using backend.Interfaces.IRepositories;
using backend.Interfaces.IServices;
using Microsoft.EntityFrameworkCore;

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

        // ✅ Lấy tất cả sản phẩm
        public async Task<IEnumerable<ProductDto>> GetAllProducts()
        {
            var products = await _repository.GetAllAsync();
            return products.Select(MapToDto);
        }
        // ✅ Lấy tất cả sản phẩm
        public async Task<IEnumerable<ProductDto>> GetAllProductsActive()
        {
            var products = await _repository.GetAllAsyncActive();
            return products.Select(MapToDto);
        }

        // ✅ Lấy sản phẩm theo ID
        public async Task<ProductDto?> GetProductById(int id)
        {
            var product = await _repository.GetByIdAsync(id);
            if (product == null) return null;
            return MapToDto(product);
        }

        // ✅ Lấy sản phẩm theo category
        public async Task<IEnumerable<ProductDto>> GetProductsByCategory(string categoryName)
        {
            var products = await _repository.GetByCategoryAsync(categoryName);
            return products.Select(MapToDto);
        }

        // ✅ Thêm sản phẩm mới
        public async Task<ProductDto> AddProduct(ProductDto productDto)
        {
            ValidateForCreateOrUpdate(productDto);
            var entity = MapToEntity(productDto);
            entity.CreatedAt = DateTime.UtcNow;
            await _repository.AddAsync(entity);
            await _context.SaveChangesAsync();
            return MapToDto(entity);
        }

        // ✅ Cập nhật sản phẩm
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

            // Cập nhật ProductImages
            existing.ProductImages = dto.ProductImages
                .Select(pi => new ProductImage
                {
                    ImageId = pi.ImageId,
                    ProductId = pi.ProductId,
                    ImageUrl = pi.ImageUrl,
                    IsPrimary = pi.IsPrimary
                })
                .ToList();

            // Cập nhật ProductVariants
            existing.ProductVariants = dto.ProductVariants
                .Select(v => new ProductVariant
                {
                    VariantId = v.VariantId,
                    ProductId = v.ProductId,
                    Size = v.Size,
                    Color = v.Color,
                    Sku = v.Sku,
                    Price = v.Price,
                    StockQuantity = v.StockQuantity
                })
                .ToList();

            // === SỬA LỖI 1: XÓA KHỐI NÀY ===
            // ProductService không nên cập nhật Reviews
            
            existing.Reviews = dto.Reviews
                .Select(r => new Review
                {
                    ReviewId = r.ReviewId, // <-- LỖI
                    ProductId = r.ProductId, // <-- LỖI
                    AccountId = r.AccountId, // <-- LỖI
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt, // <-- LỖI
                    Status = r.Status
                })
                .ToList();
            
            // === HẾT SỬA LỖI 1 ===

            await _repository.UpdateAsync(existing);

            try
            {
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

        // ✅ Xóa sản phẩm
        public async Task<bool> DeleteProduct(int id)
        {
            var product = await _repository.GetByIdAsync(id);
            if (product == null)
                return false;
            await _repository.DeleteAsync(product);
            await _context.SaveChangesAsync();
            return true;
        }

        //// ✅ Tìm kiếm sản phẩm theo keyword
        //public async Task<IEnumerable<ProductDto>> SearchProducts(string keyword)
        //{
        //    if (string.IsNullOrWhiteSpace(keyword))
        //    {
        //        return new List<ProductDto>();
        //    }

        //    var normalizedKeyword = keyword.Trim().ToLower();

        //    var products = await _context.Products
        //        .Include(p => p.ProductImages)
        //        .Include(p => p.ProductVariants)
        //        .Include(p => p.Reviews)
        //            .ThenInclude(r => r.Account)
        //                .ThenInclude(a => a.User)
        //        .Where(p =>
        //            EF.Functions.Like(p.Name.ToLower(), $"%{normalizedKeyword}%") ||
        //            p.ProductVariants.Any(v => EF.Functions.Like(v.Sku.ToLower(), $"%{normalizedKeyword}%"))
        //        )
        //        .OrderBy(p => p.Name)
        //        .ToListAsync();

        //    return products.Select(MapToDto);
        //}

        // ✅ Lấy sản phẩm best seller
        public async Task<IEnumerable<ProductDto>> GetBestSellerProducts(int limit)
        {
            var products = await _context.Products
                .Include(p => p.ProductImages)
                .Include(p => p.ProductVariants)
                .Include(p => p.Reviews)
                    .ThenInclude(r => r.Account)
                        .ThenInclude(a => a.User)
                .OrderByDescending(p => p.SoldCount)
                .Take(limit)
                .ToListAsync();

            return products.Select(MapToDto);
        }

        // ✅ Map từ Entity sang DTO
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

                ProductVariants = p.ProductVariants?.Select(v => new ProductVariantDto
                {
                    VariantId = v.VariantId,
                    ProductId = v.ProductId,
                    Size = v.Size,
                    Color = v.Color,
                    Sku = v.Sku,
                    Price = v.Price,
                    StockQuantity = v.StockQuantity
                }).ToList() ?? new List<ProductVariantDto>(),

                // === SỬA LỖI 2: XÓA KHỐI NÀY ===
                // Tương tự, không map Reviews ở đây
                
                Reviews = p.Reviews?.Select(r => new ReviewDto
                {
                    ReviewId = r.ReviewId, // <-- LỖI
                    ProductId = r.ProductId, // <-- LỖI
                    AccountId = r.AccountId, // <-- LỖI
                    Rating = r.Rating, // <-- LỖI (int? vs int)
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt, // <-- LỖI
                    Status = r.Status
                }).ToList() ?? new List<ReviewDto>()
                
                //Reviews = new List<ReviewDto>() // Trả về danh sách rỗng
                // === HẾT SỬA LỖI 2 ===
            };
        }

        // ✅ Map từ DTO sang Entity
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

                ProductVariants = dto.ProductVariants.Select(v => new ProductVariant
                {
                    VariantId = v.VariantId,
                    ProductId = v.ProductId,
                    Size = v.Size,
                    Color = v.Color,
                    Sku = v.Sku,
                    Price = v.Price,
                    StockQuantity = v.StockQuantity
                }).ToList(),

                // === SỬA LỖI 3: XÓA KHỐI NÀY ===
                // Tương tự, không map Reviews ở đây
                
                Reviews = dto.Reviews.Select(r => new Review
                {
                    ReviewId = r.ReviewId, // <-- LỖI
                    ProductId = r.ProductId, // <-- LỖI
                    AccountId = r.AccountId, // <-- LỖI
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt, // <-- LỖI
                    Status = r.Status
                }).ToList()
                
                //Reviews = new List<Review>() // Gán danh sách rỗng
                // === HẾT SỬA LỖI 3 ===
            };
        }

        // ✅ Validate dữ liệu
        private static void ValidateForCreateOrUpdate(ProductDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new ArgumentException("Tên sản phẩm không được để trống");

            if (dto.Price.HasValue && dto.Price < 0)
                throw new ArgumentException("Giá sản phẩm không hợp lệ");

            if (dto.StockQuantity.HasValue && dto.StockQuantity < 0)
                throw new ArgumentException("Số lượng tồn kho không hợp lệ");
        }

        public async Task<IEnumerable<ProductDto>> SearchProducts(string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return new List<ProductDto>();
            }

            // Chuẩn hóa keyword để tìm kiếm không phân biệt hoa thường
            var normalizedKeyword = keyword.Trim().ToLower();

            // Tìm kiếm trong Name (ProductName) và SKU của ProductVariant
            var products = await _context.Products
                .Include(p => p.ProductImages)
                .Include(p => p.ProductVariants)
                .Include(p => p.Reviews)
                    .ThenInclude(r => r.Account) // ⭐ Include Account để lấy tên khách hàng
                .Where(p => 
                    // Tìm trong tên sản phẩm (Name)
                    EF.Functions.Like(p.Name.ToLower(), $"%{normalizedKeyword}%") ||
                    // Tìm trong SKU của các variant
                    p.ProductVariants.Any(v => EF.Functions.Like(v.Sku.ToLower(), $"%{normalizedKeyword}%"))
                )
                .OrderBy(p => p.Name) // Sắp xếp theo tên
                .ToListAsync();

            // Map sang DTO
            return products.Select(p => new ProductDto
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

                // Map ProductImages
                ProductImages = p.ProductImages?.Select(img => new ProductImageDto
                {
                    ImageId = img.ImageId,
                    ProductId = img.ProductId,
                    ImageUrl = img.ImageUrl,
                    IsPrimary = img.IsPrimary
                }).ToList() ?? new List<ProductImageDto>(),

                // Map ProductVariants
                ProductVariants = p.ProductVariants?.Select(v => new ProductVariantDto
                {
                    VariantId = v.VariantId,
                    ProductId = v.ProductId,
                    Size = v.Size,
                    Color = v.Color,
                    Sku = v.Sku,
                    Price = v.Price,
                    StockQuantity = v.StockQuantity
                }).ToList() ?? new List<ProductVariantDto>(),

                // Map Reviews (lấy tên khách hàng từ Account thông qua AccountId)
                //Reviews = p.Reviews?.Select(r => new ReviewDto
                //{
                //    Id = r.ReviewId.ToString(),
                //    Product = p.Name,
                //    Customer = r.Account?.User?.FullName ?? "Anonymous", // Lấy từ relation Account
                //    Rating = (int) r.Rating,
                //    Comment = r.Comment ?? string.Empty,
                //    Date = r.CreatedAt?.ToString("yyyy-MM-dd") ?? DateTime.Now.ToString("yyyy-MM-dd"),
                //    Status = r.Status ?? "Pending"
                //}).ToList() ?? new List<ReviewDto>()
            });



        }
        public async Task<bool> UpdateProductStatus(int id, string status)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return false;

            product.Status = status;
            await _context.SaveChangesAsync();
            return true;
        }

    }
}