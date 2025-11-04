using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs
{
    public class ChatHub : Hub
    {
        // Khi Admin (hoặc Customer) mở một phòng chat, họ sẽ "Join" vào đây
        public async Task JoinRoom(string roomId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        }

        // (Chúng ta sẽ gọi hàm SendMessage từ Controller sau)
    }
}