using System;
using System.Collections.Generic;

namespace backend.Entities;

public partial class User
{
    public int UserId { get; set; }

    public int? AccountId { get; set; }

    public string? FullName { get; set; }

    public string? Gender { get; set; }

    public string? AvatarUrl { get; set; }

    public DateOnly? DateOfBirth { get; set; }

    public virtual Account? Account { get; set; }
}
