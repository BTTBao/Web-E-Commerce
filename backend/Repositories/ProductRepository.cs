using backend.Data;
using backend.Entities;
using backend.Interfaces.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDbContext _context;

        public ProductRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Product>> GetAllAsyncActive()
        {
            return await _context.Products
                .Where(p => p.Status == "Active")
                .Include(p => p.ProductImages)
                .Include(p => p.ProductVariants)
                .Include(p => p.Reviews.Where(r => r.Status == "Approved"))
                .ToListAsync();
        }
        public async Task<IEnumerable<Product>> GetAllAsync()
        {
            return await _context.Products
                .Include(p => p.ProductImages)
                .Include(p => p.ProductVariants)
                .Include(p => p.Reviews.Where(r => r.Status == "Approved"))
                .ToListAsync();
        }

        public async Task<Product?> GetByIdAsync(int id)
        {
            //Find: dựa theo mỗi khoá chính
            //FirstOrDefault: dựa theo bất kì cột nào
            return await _context.Products
                .Where(p => p.Status == "Active")
                .Include(p => p.ProductImages)
                .Include(p => p.ProductVariants)
                .Include(p => p.Reviews.Where(r => r.Status == "Approved"))
                .FirstOrDefaultAsync(p => p.ProductId == id);
        }

        public async Task AddAsync(Product product)
        {
            await _context.Products.AddAsync(product);
        }
        public async Task UpdateAsync(Product product)
        {

            _context.Entry(product).State = EntityState.Modified;
        }
        public async Task DeleteAsync(Product product)
        {
            _context.Products.Remove(product);
        }

        public Task<bool> ExistsAsync(int id)
        {
            //any: trả về true / false -> nhanh hơn xíu
            //firstOrDefault: trả về nguyên bản ghi -> chậm hơn
            // => cùng tìm thấy phần tử đầu tiên và dừng
            return _context.Products.AnyAsync(p => p.ProductId == id);
        }

        public async Task<IEnumerable<Product>> GetByCategoryAsync(string categoryName)
        {
            return await _context.Products
                .Where(p => p.Status == "Active")
                .Include(p => p.ProductImages)
                .Include(p => p.ProductVariants)
                .Include(p => p.Reviews.Where(r => r.Status == "Approved"))
                    .ThenInclude(r => r.Account)
                        .ThenInclude(a => a.User)
                .Where(p => p.Category.CategoryName.ToLower() == categoryName.ToLower())
                .ToArrayAsync();
        }
    
    }
}
