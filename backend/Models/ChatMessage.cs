using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class ChatMessage
{
    public int MessageId { get; set; }

    public int RoomId { get; set; }

    public int SenderId { get; set; }

    public string? MessageText { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<ChatAttachment> ChatAttachments { get; set; } = new List<ChatAttachment>();

    public virtual ChatRoom Room { get; set; } = null!;

    public virtual Account Sender { get; set; } = null!;
}
