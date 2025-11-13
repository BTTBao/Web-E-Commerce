using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.DTOs
{
    // --- CÁC LỚP DTO CHO CHAT ---

    /// <summary>
    /// DTO dùng để nhận Form Data khi gửi tin nhắn (text + file)
    /// </summary>
    public class ChatMessageCreateDto
    {
        [FromForm(Name = "roomId")]
        public string RoomId { get; set; }

        [FromForm(Name = "senderId")]
        public int SenderId { get; set; }

        [FromForm(Name = "message")]
        public string? Message { get; set; } // Có thể rỗng nếu chỉ gửi file

        [FromForm(Name = "tempId")]
        public string TempId { get; set; } // Rất quan trọng cho optimistic update

        [FromForm(Name = "file")]
        public IFormFile? File { get; set; } // File đính kèm (có thể null)
    }

    /// <summary>
    /// DTO trả về cho API / SignalR
    /// </summary>
    public class ChatMessageDto
    {
        public int Id { get; set; }
        public string RoomId { get; set; }
        public int SenderId { get; set; }
        public string SenderName { get; set; }
        public bool IsAdmin { get; set; }
        public string Message { get; set; }
        public string Timestamp { get; set; }
        public string? AttachmentUrl { get; set; }
        public string? AttachmentType { get; set; }
        public string? TempId { get; set; }
    }

    /// <summary>
    /// DTO trả về khi tìm kiếm khách hàng
    /// </summary>
    public class CustomerSearchDto
    {
        public int AccountId { get; set; }
        public string FullName { get; set; }
        public string Phone { get; set; }
        public string? AvatarUrl { get; set; }
    }

    /// <summary>
    /// DTO nhận ID của Admin khi gán phòng
    /// </summary>
    public class AdminAssignDto
    {
        public int AdminId { get; set; }
    }

    /// <summary>
    /// DTO khi khách hàng (client) tạo phòng
    /// </summary>
    public class CreateRoomDto
    {
        public int CustomerId { get; set; }
    }
}