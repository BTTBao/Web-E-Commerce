using backend.DTOs;
using backend.Entities;

namespace backend.Interfaces.IServices
{
    public interface IProductService
    {
        Task<IEnumerable<ProductDto>> GetAllProducts();
        Task<IEnumerable<ProductDto>> GetAllProductsActive();
        Task<ProductDto?> GetProductById(int id);
        Task<IEnumerable<ProductDto>> GetProductsByCategory(string categoryName);
        Task<ProductDto> AddProduct(ProductDto product);
        Task<bool> UpdateProduct(int id, ProductDto product);
        Task<bool> DeleteProduct(int id);
        Task<IEnumerable<ProductDto>> SearchProducts(string keyword);
        Task<IEnumerable<ProductDto>> GetBestSellerProducts(int limit);

        Task<bool> UpdateProductStatus(int id, string status);

    }
}
