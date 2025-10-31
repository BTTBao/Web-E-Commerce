using backend.Interfaces.IRepositories;
using backend.Interfaces.IServices;
using backend.Repositories;
using backend.Services;

namespace backend.Extensions
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            //Product
            services.AddScoped<IProductRepository, ProductRepository>();
            services.AddScoped<IProductService, ProductService>();
            //User
            //...
            return services;
        }
    }
}
