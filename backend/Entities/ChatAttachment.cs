using System;
using System.Collections.Generic;

namespace backend.Entities;

public partial class ChatAttachment
{
    public int AttachmentId { get; set; }

    public int MessageId { get; set; }

    public string? FileUrl { get; set; }

    public string? FileType { get; set; }

    public virtual ChatMessage Message { get; set; } = null!;
}
