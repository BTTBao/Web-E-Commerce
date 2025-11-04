using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class SendMessageDto
    {
        [Required]
        public string RoomId { get; set; } // "CR001"
        [Required]
        public string Message { get; set; }
    }
}