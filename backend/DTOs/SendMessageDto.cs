namespace backend.DTOs;
public class SendMessageDto
{
    public string RoomId { get; set; }
    public string Message { get; set; }
    public int SenderId { get; set; }
}
