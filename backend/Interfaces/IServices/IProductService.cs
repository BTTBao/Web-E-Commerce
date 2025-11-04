using backend.DTOs;
using backend.Entities;

namespace backend.Interfaces.IServices
{
    public interface IProductService
    {
        Task<IEnumerable<ProductDto>> GetAllProducts();
        Task<ProductDto?> GetProductById(int id);
        Task<ProductDto> AddProduct(ProductDto product);
        Task<bool> UpdateProduct(int id, ProductDto product);
        Task<bool> DeleteProduct(int id);
    }
}
