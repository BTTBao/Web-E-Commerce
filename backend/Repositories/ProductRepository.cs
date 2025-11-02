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

        public async Task<IEnumerable<Product>> GetAllAsync()
        {
            return await _context.Products.ToListAsync();
        }

        public async Task<Product?> GetByIdAsync(int id)
        {
            //Find: dựa theo mỗi khoá chính
            //FirstOrDefault: dựa theo bất kì cột nào
            return await _context.Products.FindAsync(id);
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
            return _context.Products.AnyAsync(p => p.ProductID == id);
        }
    }
}
