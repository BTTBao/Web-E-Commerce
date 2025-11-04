namespace backend.DTOs
{
    public class ChatRoomDto
    {
        public string Id { get; set; } // "CR001"
        public string CustomerId { get; set; } // "U001"
        public string CustomerName { get; set; }
        public string LastMessage { get; set; }
        public string LastMessageTime { get; set; }
        public bool Unread { get; set; }
        public bool IsClosed { get; set; }
    }
}