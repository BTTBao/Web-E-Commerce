namespace backend.DTOs
{
    public class UpdateInfoDto
    {
        public string FullName { get; set; }
        public string Gender { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public string Phone { get; set; }
    }
}
