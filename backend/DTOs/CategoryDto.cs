namespace backend.DTOs
{
    public class CategoryDto
    {
        public int id { get; set; }

        public string name { get; set; } = string.Empty;

        public int? parentId { get; set; }

        public string? parentName { get; set; }

        // Danh sách category con
        public List<CategoryDto> children { get; set; } = new();
    }
}
