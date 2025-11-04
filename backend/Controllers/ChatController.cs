using backend.Data;
using backend.DTOs;
using backend.Entities;
using backend.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatController(ApplicationDbContext context, IHubContext<ChatHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }


        // API: [GET] /api/chat/rooms
        // Lấy danh sách phòng chat (cho admin)
        [HttpGet("rooms")]
        public async Task<ActionResult<IEnumerable<ChatRoomDto>>> GetChatRooms()
        {
            // Bước 1: Lấy dữ liệu thô từ DB vào một danh sách tạm (anonymous object)
            var roomsFromDb = await _context.ChatRooms
                .Include(cr => cr.Customer.User) // Lấy tên User
                .Include(cr => cr.ChatMessages)   // Lấy tin nhắn cuối
                .Where(cr => cr.IsClosed != true) // Lấy cả những phòng 'false' và 'null'
                .Select(cr => new // Đây là một đối tượng tạm
                {
                    cr.RoomId,
                    cr.CustomerId,
                    CustomerName = cr.Customer.User.FullName ?? cr.Customer.Username,
                    cr.IsClosed, // <-- Giữ nguyên là bool?
                    LastMessageText = cr.ChatMessages.OrderByDescending(cm => cm.CreatedAt)
                                    .Select(cm => cm.MessageText).FirstOrDefault(),
                    LastMessageTime = cr.ChatMessages.OrderByDescending(cm => cm.CreatedAt)
                                    .Select(cm => cm.CreatedAt).FirstOrDefault() // <-- Giữ nguyên là DateTime?
                })
                .ToListAsync(); // <-- Thực thi query, lấy dữ liệu về memory

            // Bước 2: Dùng LINQ-to-Objects (trong memory) để format sang DTO
            // Bây giờ có thể dùng ?. và ?? thoải mái
            var roomsDto = roomsFromDb
                .OrderByDescending(r => r.LastMessageTime) // Sắp xếp trong memory
                .Select(r => new ChatRoomDto
                {
                    Id = "CR" + r.RoomId,
                    CustomerId = "U" + r.CustomerId,
                    CustomerName = r.CustomerName,
                    IsClosed = r.IsClosed ?? false, // <-- Sửa lỗi CS0266 (bool?)
                    Unread = false,
                    LastMessage = r.LastMessageText ?? "...",
                    LastMessageTime = r.LastMessageTime?.ToString("yyyy-MM-dd HH:mm") ?? "" // <-- Sửa lỗi CS8072 (DateTime?)
                })
                .ToList();

            return Ok(roomsDto);
        }

        // API: [GET] /api/chat/rooms/CR001/messages
        // Lấy toàn bộ tin nhắn của 1 phòng
        [HttpGet("rooms/{roomId}/messages")]
        public async Task<ActionResult<IEnumerable<ChatMessageDto>>> GetRoomMessages(string roomId)
        {
            if (!int.TryParse(roomId.AsSpan(2), out int id))
            {
                return BadRequest("Invalid Room ID format.");
            }

            var room = await _context.ChatRooms.FindAsync(id);
            if (room == null) return NotFound();

            // Bước 1: Lấy dữ liệu thô từ DB
            var messagesFromDb = await _context.ChatMessages
                .Include(cm => cm.Sender.User)
                .Where(cm => cm.RoomId == id)
                .OrderBy(cm => cm.CreatedAt)
                .Select(cm => new // Đối tượng tạm
                {
                    cm.MessageId,
                    cm.RoomId,
                    cm.MessageText,
                    cm.CreatedAt, // <-- Giữ nguyên là DateTime?
                    IsAdmin = cm.SenderId == room.AdminId,
                    SenderIdDisplay = cm.SenderId == room.AdminId ? "ADMIN" : "U" + cm.SenderId,
                    SenderNameDisplay = cm.SenderId == room.AdminId ? "Admin" : (cm.Sender.User.FullName ?? cm.Sender.Username)
                })
                .ToListAsync(); // <-- Thực thi query

            // Bước 2: Format trong memory
            var messagesDto = messagesFromDb
                .Select(cm => new ChatMessageDto
                {
                    Id = cm.MessageId,
                    RoomId = "CR" + cm.RoomId,
                    Message = cm.MessageText,
                    Timestamp = cm.CreatedAt?.ToString("HH:mm") ?? "", // <-- Sửa lỗi CS8072
                    IsAdmin = cm.IsAdmin,
                    SenderId = cm.SenderIdDisplay,
                    SenderName = cm.SenderNameDisplay
                })
                .ToList();

            return Ok(messagesDto);
        }
    }
}