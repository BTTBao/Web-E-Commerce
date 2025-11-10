using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class ChatRoom
{
    public int RoomId { get; set; }

    public int CustomerId { get; set; }

    public int? AdminId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public bool? IsClosed { get; set; }

    public virtual Account? Admin { get; set; }

    public virtual ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();

    public virtual Account Customer { get; set; } = null!;
}
