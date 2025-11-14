using backend.Data;
using backend.DTOs; // <--- THÊM DÒNG NÀY
using backend.Entities;
using backend.Hubs;
using backend.Interfaces.IServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    // --- CÁC LỚP DTO ĐÃ ĐƯỢC CHUYỂN RA FILE DTOs/ChatDtos.cs ---


    // --- CONTROLLER CHÍNH ---

    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly IPhotoService _photoService;

        public ChatController(ApplicationDbContext context, IHubContext<ChatHub> hubContext, IPhotoService photoService)
        {
            _context = context;
            _hubContext = hubContext;
            _photoService = photoService;
        }

        // 🟢 Lấy danh sách các phòng chat (Đã tối ưu Sắp xếp)
        [HttpGet("rooms")]
        public async Task<IActionResult> GetRooms()
        {
            var roomsFromDb = await _context.ChatRooms
                .Include(r => r.Customer.User)
                .Include(r => r.Admin.User)
                
                // Sắp xếp bằng SQL (OrderByDescending) TRƯỚC khi Select
                .OrderByDescending(r => 
                    r.ChatMessages
                        .OrderByDescending(m => m.CreatedAt)
                        .Select(m => m.CreatedAt)
                        .FirstOrDefault()
                )
                
                .Select(r => new
                {
                    r.RoomId,
                    CustomerName = r.Customer.User != null ? r.Customer.User.FullName : r.Customer.Phone,
                    AdminName = r.Admin != null
                        ? (r.Admin.User != null ? r.Admin.User.FullName : r.Admin.Phone)
                        : null,
                    r.IsClosed,
                    
                    LastMessage = r.ChatMessages
                        .OrderByDescending(m => m.CreatedAt)
                        .Select(m => m.ChatAttachments.Any() ? "[Hình ảnh]" : m.MessageText)
                        .FirstOrDefault(),

                    LastMessageTime = r.ChatMessages
                        .OrderByDescending(m => m.CreatedAt)
                        .Select(m => m.CreatedAt)
                        .FirstOrDefault() 
                })
                .ToListAsync(); // <-- Chỉ lấy dữ liệu sau khi đã sắp xếp

            
            var roomsDto = roomsFromDb 
                .Select(r => new
                {
                    id = "CR" + r.RoomId,
                    customerName = r.CustomerName,
                    adminName = r.AdminName,
                    isClosed = r.IsClosed ?? false,
                    lastMessage = r.LastMessage ?? "...", 
                    lastMessageTime = r.LastMessageTime?.ToString("yyyy-MM-dd HH:mm:ss") ?? "",
                    // TODO: Thêm logic đếm tin nhắn chưa đọc (unread) nếu cần
                })
                .ToList();

            return Ok(roomsDto);
        }

        // 🟢 Lấy tin nhắn trong phòng
        [HttpGet("rooms/{roomId}/messages")]
        public async Task<IActionResult> GetMessages(string roomId)
        {
            if (string.IsNullOrEmpty(roomId) || !roomId.StartsWith("CR") || !int.TryParse(roomId.AsSpan(2), out int idValue))
            {
                return BadRequest("Invalid Room ID format. Expected 'CR' prefix.");
            }

            var messages = await _context.ChatMessages
                .Include(m => m.Sender).ThenInclude(a => a.User)
                .Include(m => m.ChatAttachments) // Join bảng attachments
                .Where(m => m.RoomId == idValue)
                .OrderBy(m => m.CreatedAt)
                .Select(m => new ChatMessageDto
                {
                    Id = m.MessageId,
                    RoomId = "CR" + m.RoomId,
                    SenderId = m.SenderId,
                    SenderName = m.Sender.User != null ? m.Sender.User.FullName : m.Sender.Phone,
                    IsAdmin = m.Sender.Role == 1,
                    Message = m.MessageText ?? "",
                    Timestamp = m.CreatedAt.HasValue ? m.CreatedAt.Value.ToString("yyyy-MM-dd HH:mm:ss") : "",
                    
                    AttachmentUrl = m.ChatAttachments.Select(a => a.FileUrl).FirstOrDefault(),
                    AttachmentType = m.ChatAttachments.Select(a => a.FileType).FirstOrDefault()
                })
                .ToListAsync();

            return Ok(messages);
        }

        // 🟢 [MỚI] Endpoint A: Tìm kiếm khách hàng (cho Admin)
        // GET: /api/chat/search-customers?query=...
        [HttpGet("search-customers")]
        public async Task<IActionResult> SearchCustomers([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return Ok(new List<CustomerSearchDto>());
            }

            var normalizedQuery = query.ToLower().Trim();

            var customers = await _context.Accounts
                .Include(a => a.User) // Join với User để lấy FullName
                .Where(a => 
                    a.Role == 0 && // Chỉ tìm khách hàng (Role == 0)
                    (
                        (a.User != null && a.User.FullName.ToLower().Contains(normalizedQuery)) ||
                        (a.Phone != null && a.Phone.Contains(normalizedQuery))
                    )
                )
                .Select(a => new CustomerSearchDto
                {
                    AccountId = a.AccountId,
                    FullName = a.User.FullName ?? a.Phone ?? "N/A", 
                    Phone = a.Phone,
                    AvatarUrl = a.User.AvatarUrl
                })
                .Take(10) // Giới hạn 10 kết quả
                .ToListAsync();

            return Ok(customers);
        }
        
        // 🟢 [MỚI] Endpoint B: Admin lấy hoặc tạo phòng chat
        // POST: /api/chat/rooms/get-or-create/{customerId}
        [HttpPost("rooms/get-or-create/{customerId}")]
        public async Task<IActionResult> GetOrCreateRoom(int customerId, [FromBody] AdminAssignDto dto)
        {
            // 1. Kiểm tra khách hàng có tồn tại không
            var customer = await _context.Accounts
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.AccountId == customerId && a.Role == 0);

            if (customer == null)
            {
                return NotFound(new { message = "Customer not found." });
            }

            // 2. Tìm một phòng CHƯA ĐÓNG của khách hàng này
            var room = await _context.ChatRooms
                .FirstOrDefaultAsync(r => r.CustomerId == customerId && r.IsClosed == false);

            if (room == null)
            {
                // 3. Nếu không có phòng nào, tạo phòng mới
                room = new ChatRoom
                {
                    CustomerId = customerId,
                    AdminId = dto.AdminId, // Gán Admin phụ trách
                    CreatedAt = DateTime.Now,
                    IsClosed = false
                };
                _context.ChatRooms.Add(room);
                await _context.SaveChangesAsync();
            }
            else if (room.AdminId == null)
            {
                // 4. Nếu phòng đã có nhưng chưa ai phụ trách, gán Admin
                room.AdminId = dto.AdminId;
                await _context.SaveChangesAsync();
            }

            // 5. Lấy thông tin admin được gán
            var assignedAdmin = await _context.Accounts
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.AccountId == room.AdminId);

            var customerName = customer.User?.FullName ?? customer.Phone ?? "Customer";
            var adminName = assignedAdmin?.User?.FullName ?? assignedAdmin?.Phone;

            // 6. Lấy tin nhắn cuối cùng (nếu có)
            var lastMessageInfo = await _context.ChatMessages
                .Where(m => m.RoomId == room.RoomId)
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => new {
                    Message = m.ChatAttachments.Any() ? "[Hình ảnh]" : m.MessageText,
                    Time = m.CreatedAt
                })
                .FirstOrDefaultAsync();

            // 7. Tạo DTO trả về (giống hệt cấu trúc GetRooms)
            var roomDto = new
            {
                id = "CR" + room.RoomId,
                customerName = customerName,
                adminName = adminName,
                isClosed = room.IsClosed ?? false,
                lastMessage = lastMessageInfo?.Message ?? "...",
                lastMessageTime = lastMessageInfo?.Time?.ToString("yyyy-MM-dd HH:mm:ss") ?? "",
                unread = false // Phòng vừa mở/tạo thì không thể 'unread'
            };

            return Ok(roomDto);
        }
        
        // 🟢 Gửi tin nhắn mới (Hỗ trợ Text + File)
        [HttpPost("messages")]
        public async Task<IActionResult> SendMessage([FromForm] ChatMessageCreateDto dto)
        {
            // 1. Kiểm tra
            if (string.IsNullOrWhiteSpace(dto.Message) && (dto.File == null || dto.File.Length == 0))
                return BadRequest("Message or file is required.");

            if (string.IsNullOrEmpty(dto.RoomId) || !dto.RoomId.StartsWith("CR") || !int.TryParse(dto.RoomId.AsSpan(2), out int roomId))
                return BadRequest("Invalid roomId format. Expected 'CR' prefix.");

            if (dto.SenderId <= 0)
                return BadRequest("Invalid senderId.");

            var sender = await _context.Accounts
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.AccountId == dto.SenderId);

            if (sender == null)
                return NotFound("Sender not found.");

            string? attachmentUrl = null;
            string? attachmentType = null;
            string? attachmentPublicId = null;

            // 2. Xử lý file upload nếu có
            if (dto.File != null && dto.File.Length > 0)
            {
                var uploadResult = await _photoService.AddPhotoAsync(dto.File);
                if (uploadResult.Error != null)
                {
                    return BadRequest(new { status = "error", message = uploadResult.Error.Message });
                }
                
                attachmentUrl = uploadResult.SecureUrl.ToString();
                attachmentPublicId = uploadResult.PublicId;
                attachmentType = dto.File.ContentType;
            }

            // 3. Lưu tin nhắn (text) vào DB
            var message = new ChatMessage
            {
                RoomId = roomId,
                SenderId = dto.SenderId,
                MessageText = dto.Message,
                CreatedAt = DateTime.Now
            };

            _context.ChatMessages.Add(message);
            await _context.SaveChangesAsync(); // Cần Save để lấy MessageId

            // 4. Lưu file đính kèm (nếu có)
            if (attachmentUrl != null)
            {
                var attachment = new ChatAttachment
                {
                    MessageId = message.MessageId, // Dùng ID vừa tạo
                    FileUrl = attachmentUrl,
                    FilePublicId = attachmentPublicId,
                    FileType = attachmentType
                };
                _context.ChatAttachments.Add(attachment);
                await _context.SaveChangesAsync();
            }

            // 5. Tạo DTO để broadcast
            var messageDto = new ChatMessageDto
            {
                Id = message.MessageId,
                RoomId = "CR" + roomId,
                SenderId = dto.SenderId,
                SenderName = sender.User != null ? sender.User.FullName : sender.Phone,
                IsAdmin = sender.Role == 1,
                Message = message.MessageText ?? "",
                Timestamp = message.CreatedAt?.ToString("yyyy-MM-dd HH:mm:ss") ?? "",
                AttachmentUrl = attachmentUrl,
                AttachmentType = attachmentType,
                TempId = dto.TempId // Gửi lại TempId
            };

            // 6. Gửi SignalR
            await _hubContext.Clients.Group(dto.RoomId)
                .SendAsync("ReceiveMessage", messageDto);

            return Ok(messageDto);
        }

        // 🟢 Tạo phòng mới (Dùng cho Client)
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
                // AdminId sẽ do Admin tự gán sau
            };

            _context.ChatRooms.Add(room);
            await _context.SaveChangesAsync();

            return Ok(new { roomId = "CR" + room.RoomId });
        }

        // 🟢 Admin nhận xử lý phòng chat
        [HttpPost("rooms/{roomId}/assign")]
        public async Task<IActionResult> AssignAdmin(int roomId, [FromBody] AdminAssignDto dto)
        {
            var room = await _context.ChatRooms.FindAsync(roomId);
            if (room == null) return NotFound();

            room.AdminId = dto.AdminId;
            await _context.SaveChangesAsync();

            return Ok();
        }
        
        // 🟢 [MỚI] Lấy danh sách phòng chat của 1 khách hàng (user)
        [HttpGet("user-rooms/{customerId}")]
        public async Task<IActionResult> GetUserRooms(int customerId)
        {
            // Kiểm tra tài khoản có tồn tại không
            var customer = await _context.Accounts
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.AccountId == customerId && a.Role == 0);

            if (customer == null)
                return NotFound(new { message = "Customer not found." });

            // --- BƯỚC 1: LẤY DỮ LIỆU THÔ TỪ DATABASE ---
            var roomsFromDb = await _context.ChatRooms
                .Include(r => r.Admin.User) // Include Admin.User để lấy tên
                .Where(r => r.CustomerId == customerId)
                .OrderByDescending(r =>
                    r.ChatMessages
                        .OrderByDescending(m => m.CreatedAt)
                        .Select(m => m.CreatedAt)
                        .FirstOrDefault()
                )
                .Select(r => new
                {
                    // Lấy các giá trị thô
                    r.RoomId,
                    r.IsClosed,
                    Admin = r.Admin, // Lấy cả object Admin
                    AdminFullName = r.Admin != null ? r.Admin.User.FullName : null,
                    AdminPhone = r.Admin != null ? r.Admin.Phone : null,
                    
                    // Lấy tin nhắn cuối
                    LastMessageData = r.ChatMessages
                        .OrderByDescending(m => m.CreatedAt)
                        .Select(m => new {
                            Text = m.MessageText,
                            HasAttachment = m.ChatAttachments.Any()
                        })
                        .FirstOrDefault(),
                    
                    // Lấy thời gian cuối (kiểu DateTime? nullable)
                    LastMessageTimeData = r.ChatMessages
                        .OrderByDescending(m => m.CreatedAt)
                        .Select(m => m.CreatedAt)
                        .FirstOrDefault()
                })
                .ToListAsync(); // <--- Thực thi truy vấn SQL

            // --- BƯỚC 2: FORMAT DỮ LIỆU BẰNG C# (TRONG MEMORY) ---
            var customerName = customer.User?.FullName ?? customer.Phone ?? "Customer";

            var roomsDto = roomsFromDb.Select(r => new
            {
                id = "CR" + r.RoomId,
                customerName = customerName,
                
                // Logic C# (dùng ?: và ??) chạy bình thường
                adminName = r.Admin != null
                    ? (r.AdminFullName ?? r.AdminPhone)
                    : "(Chưa có admin)",
                    
                isClosed = r.IsClosed ?? false,
                
                // Logic C# cho tin nhắn cuối
                lastMessage = r.LastMessageData == null
                    ? "..."
                    : (r.LastMessageData.HasAttachment ? "[Hình ảnh]" : r.LastMessageData.Text),

                // Logic C# (dùng ?. và ToString()) chạy bình thường
                lastMessageTime = r.LastMessageTimeData?.ToString("yyyy-MM-dd HH:mm:ss") ?? ""
            }).ToList();

            return Ok(roomsDto);
        }


        // 🟢 [MỚI] Lấy tin nhắn trong phòng (user dùng)
        [HttpGet("user-rooms/{roomId}/messages")]
        public async Task<IActionResult> GetUserMessages(string roomId, [FromQuery] int customerId)
        {
            // Kiểm tra format "CRxxx"
            if (string.IsNullOrEmpty(roomId) || !roomId.StartsWith("CR") || !int.TryParse(roomId.AsSpan(2), out int idValue))
                return BadRequest("Invalid Room ID format. Expected 'CR' prefix.");

            // Kiểm tra quyền truy cập
            var room = await _context.ChatRooms.FindAsync(idValue);
            if (room == null)
                return NotFound("Room not found.");
            if (room.CustomerId != customerId)
                return Forbid("You are not allowed to access this room.");

            // Lấy tin nhắn
            var messages = await _context.ChatMessages
                .Include(m => m.Sender).ThenInclude(a => a.User)
                .Include(m => m.ChatAttachments)
                .Where(m => m.RoomId == idValue)
                .OrderBy(m => m.CreatedAt)
                .Select(m => new ChatMessageDto
                {
                    Id = m.MessageId,
                    RoomId = "CR" + m.RoomId,
                    SenderId = m.SenderId,
                    SenderName = m.Sender.User != null ? m.Sender.User.FullName : m.Sender.Phone,
                    IsAdmin = m.Sender.Role == 1,
                    Message = m.MessageText ?? "",
                    Timestamp = m.CreatedAt.HasValue ? m.CreatedAt.Value.ToString("yyyy-MM-dd HH:mm:ss") : "",
                    AttachmentUrl = m.ChatAttachments.Select(a => a.FileUrl).FirstOrDefault(),
                    AttachmentType = m.ChatAttachments.Select(a => a.FileType).FirstOrDefault()
                })
                .ToListAsync();

            return Ok(messages);
        }
        
        // 🟢 [ENDPOINT MỚI] Đóng phòng chat
        // PUT: /api/chat/rooms/{roomId}/close
        [HttpPut("rooms/{roomId}/close")]
        public async Task<IActionResult> CloseRoom(string roomId)
        {
            if (string.IsNullOrEmpty(roomId) || !roomId.StartsWith("CR") || !int.TryParse(roomId.AsSpan(2), out int idValue))
                return BadRequest("Invalid Room ID format. Expected 'CR' prefix.");

            var room = await _context.ChatRooms.FindAsync(idValue);
            
            if (room == null)
                return NotFound("Room not found.");

            if (room.IsClosed == true)
                return Ok(new { message = "Room is already closed." });

            // Cập nhật trạng thái
            room.IsClosed = true;
            await _context.SaveChangesAsync();

            // Tùy chọn: Gửi SignalR thông báo phòng đã đóng (cho cả admin và khách)
            await _hubContext.Clients.Group(roomId)
                .SendAsync("RoomClosed", new { roomId = roomId, closed = true });

            return Ok(new { message = "Room successfully closed." });
        }
    }
}