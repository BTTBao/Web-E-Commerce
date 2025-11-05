using backend.Data;
using backend.DTOs;
using backend.Entities;
using backend.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatController(ApplicationDbContext context, IHubContext<ChatHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        // 🟢 Lấy danh sách các phòng chat (Đã tối ưu hóa)
        [HttpGet("rooms")]
        public async Task<IActionResult> GetRooms()
        {
            // Bước 1: Lấy dữ liệu thô từ DB (nhanh hơn)
            var roomsFromDb = await _context.ChatRooms
                .Include(r => r.Customer.User)
                .Include(r => r.Admin.User)
                .Include(r => r.ChatMessages)
                .Select(r => new
                {
                    r.RoomId,
                    CustomerName = r.Customer.User != null ? r.Customer.User.FullName : r.Customer.Phone,
                    AdminName = r.Admin != null
                        ? (r.Admin.User != null ? r.Admin.User.FullName : r.Admin.Phone)
                        : null,
                    r.IsClosed,
                    LastMessageText = r.ChatMessages
                        .OrderByDescending(m => m.CreatedAt)
                        .Select(m => m.MessageText)
                        .FirstOrDefault(),
                    LastMessageTime = r.ChatMessages
                        .OrderByDescending(m => m.CreatedAt)
                        .Select(m => m.CreatedAt)
                        .FirstOrDefault() // Lấy DateTime?
                })
                .ToListAsync();

            // Bước 2: Sắp xếp và format trong C# (an toàn)
            var roomsDto = roomsFromDb
                .OrderByDescending(r => r.LastMessageTime) // Sắp xếp ở đây
                .Select(r => new
                {
                    id = "CR" + r.RoomId,
                    customerName = r.CustomerName,
                    adminName = r.AdminName,
                    isClosed = r.IsClosed ?? false,
                    lastMessage = r.LastMessageText ?? "...",
                    lastMessageTime = r.LastMessageTime?.ToString("yyyy-MM-dd HH:mm:ss") ?? ""
                })
                .ToList();

            return Ok(roomsDto);
        }

        // 🟢 Lấy tin nhắn trong phòng (Đã sửa SenderId)
        [HttpGet("rooms/{roomId}/messages")]
        public async Task<IActionResult> GetMessages(string roomId)
        {
            if (string.IsNullOrEmpty(roomId) || !roomId.StartsWith("CR") || !int.TryParse(roomId.AsSpan(2), out int idValue))
            {
                return BadRequest("Invalid Room ID format. Expected 'CR' prefix.");
            }

            var messages = await _context.ChatMessages
                .Include(m => m.Sender).ThenInclude(a => a.User)
                .Where(m => m.RoomId == idValue)
                .OrderBy(m => m.CreatedAt)
                .Select(m => new ChatMessageDto
                {
                    Id = m.MessageId,
                    RoomId = "CR" + m.RoomId,
                    SenderId = m.SenderId, // <-- SỬA 1: Giữ nguyên là int
                    SenderName = m.Sender.User != null ? m.Sender.User.FullName : m.Sender.Phone,
                    IsAdmin = m.Sender.Role == 1,
                    Message = m.MessageText ?? "",
                    Timestamp = m.CreatedAt.HasValue ? m.CreatedAt.Value.ToString("yyyy-MM-dd HH:mm:ss") : ""
                })
                .ToListAsync();

            return Ok(messages);
        }

        
        // 🟢 Gửi tin nhắn mới (Đã sửa SenderId)
        [HttpPost("messages")]
        public async Task<IActionResult> SendMessage([FromBody] ChatMessageDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Message))
                return BadRequest("Message cannot be empty.");

            if (string.IsNullOrEmpty(dto.RoomId) || !dto.RoomId.StartsWith("CR") || !int.TryParse(dto.RoomId.AsSpan(2), out int roomId))
                return BadRequest("Invalid roomId format. Expected 'CR' prefix.");

            // SỬA 2: Dùng 'int' trực tiếp, không cần Parse
            int senderId = dto.SenderId;
            if (senderId <= 0)
            {
                return BadRequest("Invalid senderId.");
            }

            var sender = await _context.Accounts
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.AccountId == senderId);

            if (sender == null)
                return NotFound("Sender not found.");

            var message = new ChatMessage
            {
                RoomId = roomId,
                SenderId = senderId,
                MessageText = dto.Message,
                CreatedAt = DateTime.Now
            };

            _context.ChatMessages.Add(message);
            await _context.SaveChangesAsync();

            var messageDto = new ChatMessageDto
            {
                Id = message.MessageId,
                RoomId = "CR" + roomId,
                SenderId = senderId, // <-- SỬA 3: Giữ nguyên là int
                SenderName = sender.User != null ? sender.User.FullName : sender.Phone,
                IsAdmin = sender.Role == 1,
                Message = message.MessageText ?? "",
                Timestamp = message.CreatedAt?.ToString("yyyy-MM-dd HH:mm:ss") ?? ""
            };

            await _hubContext.Clients.Group(dto.RoomId) // Gửi đến Group "CR1"
                .SendAsync("ReceiveMessage", messageDto);

            return Ok(messageDto);
        }

        // 🟢 Tạo phòng mới khi user mở chat
        [HttpPost("rooms")]
        public async Task<IActionResult> CreateRoom([FromBody] CreateRoomDto dto)
        {
            var existingRoom = await _context.ChatRooms
                .FirstOrDefaultAsync(r => r.CustomerId == dto.CustomerId && r.IsClosed == false);

            if (existingRoom != null)
                return Ok(new { roomId = "CR" + existingRoom.RoomId });

            var room = new ChatRoom
            {
                CustomerId = dto.CustomerId,
                CreatedAt = DateTime.Now,
                IsClosed = false
            };

            _context.ChatRooms.Add(room);
            await _context.SaveChangesAsync();

            return Ok(new { roomId = "CR" + room.RoomId });
        }

        // 🟢 (Đã thêm lại) Admin nhận xử lý phòng chat
        [HttpPost("rooms/{roomId}/assign")]
        public async Task<IActionResult> AssignAdmin(int roomId, [FromBody] int adminId)
        {
            var room = await _context.ChatRooms.FindAsync(roomId);
            if (room == null) return NotFound();

            room.AdminId = adminId;
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}