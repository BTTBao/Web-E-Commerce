namespace backend.DTOs
{
    public class ChatMessageDto
    {
        public int Id { get; set; }
        public string RoomId { get; set; }
        public int SenderId { get; set; }
        public string SenderName { get; set; }
        public bool IsAdmin { get; set; }
        public string Message { get; set; }
        public string Timestamp { get; set; }
    }
}