using backend.Data;
using backend.Entities;
using backend.Interfaces.IRepositories;
using backend.Interfaces.IServices;
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

        public async Task<IEnumerable<Product>> GetAllProducts()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<Product?> GetProductById(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<Product> AddProduct(Product product)
        {
            await _repository.AddAsync(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task<bool> UpdateProduct(int id, Product p)
        {
            if(id != p.ProductID) 
                return false;
            await _repository.UpdateAsync(p);
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

        public async Task<bool> DeleteProduct(int id)
        {
            var product = await _repository.GetByIdAsync(id);
            if (product == null)
                return false;
            await _repository.DeleteAsync(product);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
