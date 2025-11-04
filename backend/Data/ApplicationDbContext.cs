using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using backend.Entities;

namespace backend.Data;

public partial class ApplicationDbContext : DbContext
{
    public ApplicationDbContext()
    {
    }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Account> Accounts { get; set; }

    public virtual DbSet<Cart> Carts { get; set; }

    public virtual DbSet<CartItem> CartItems { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<ChatAttachment> ChatAttachments { get; set; }

    public virtual DbSet<ChatMessage> ChatMessages { get; set; }

    public virtual DbSet<ChatRoom> ChatRooms { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderDetail> OrderDetails { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<ProductImage> ProductImages { get; set; }

    public virtual DbSet<ProductVariant> ProductVariants { get; set; }

    public virtual DbSet<Review> Reviews { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserAddress> UserAddresses { get; set; }

    public virtual DbSet<Voucher> Vouchers { get; set; }

    public virtual DbSet<Wishlist> Wishlists { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=localhost,1434;Database=Skynet_commerce;User Id=sa;Password=MatKhauSuperSecure123!;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasKey(e => e.AccountId).HasName("PK__Accounts__349DA58606ECF488");

            entity.HasIndex(e => e.Username, "UQ__Accounts__536C85E463E13590").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__Accounts__A9D10534F7CA0D75").IsUnique();

            entity.Property(e => e.AccountId).HasColumnName("AccountID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(150);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.Username).HasMaxLength(100);

            entity.HasMany(d => d.Roles).WithMany(p => p.Accounts)
                .UsingEntity<Dictionary<string, object>>(
                    "AccountRole",
                    r => r.HasOne<Role>().WithMany()
                        .HasForeignKey("RoleId")
                        .HasConstraintName("FK__AccountRo__RoleI__1EA48E88"),
                    l => l.HasOne<Account>().WithMany()
                        .HasForeignKey("AccountId")
                        .HasConstraintName("FK__AccountRo__Accou__1DB06A4F"),
                    j =>
                    {
                        j.HasKey("AccountId", "RoleId").HasName("PK__AccountR__8C32096528B1798E");
                        j.ToTable("AccountRoles");
                        j.IndexerProperty<int>("AccountId").HasColumnName("AccountID");
                        j.IndexerProperty<int>("RoleId").HasColumnName("RoleID");
                    });
        });

        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasKey(e => e.CartId).HasName("PK__Carts__51BCD79758F3F53B");

            entity.Property(e => e.CartId).HasColumnName("CartID");
            entity.Property(e => e.AccountId).HasColumnName("AccountID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Account).WithMany(p => p.Carts)
                .HasForeignKey(d => d.AccountId)
                .HasConstraintName("FK__Carts__AccountID__5CD6CB2B");
        });

        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasKey(e => e.CartItemId).HasName("PK__CartItem__488B0B2A1EBABB1B");

            entity.Property(e => e.CartItemId).HasColumnName("CartItemID");
            entity.Property(e => e.AddedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.CartId).HasColumnName("CartID");
            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.VariantId).HasColumnName("VariantID");

            entity.HasOne(d => d.Cart).WithMany(p => p.CartItems)
                .HasForeignKey(d => d.CartId)
                .HasConstraintName("FK__CartItems__CartI__619B8048");

            entity.HasOne(d => d.Product).WithMany(p => p.CartItems)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__CartItems__Produ__628FA481");

            entity.HasOne(d => d.Variant).WithMany(p => p.CartItems)
                .HasForeignKey(d => d.VariantId)
                .HasConstraintName("FK__CartItems__Varia__6383C8BA");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__Categori__19093A2BD9008168");

            entity.Property(e => e.CategoryId).HasColumnName("CategoryID");
            entity.Property(e => e.CategoryName).HasMaxLength(150);
            entity.Property(e => e.ParentCategoryId).HasColumnName("ParentCategoryID");

            entity.HasOne(d => d.ParentCategory).WithMany(p => p.InverseParentCategory)
                .HasForeignKey(d => d.ParentCategoryId)
                .HasConstraintName("FK__Categorie__Paren__44FF419A");
        });

        modelBuilder.Entity<ChatAttachment>(entity =>
        {
            entity.HasKey(e => e.AttachmentId).HasName("PK__ChatAtta__442C64DE4515782F");

            entity.Property(e => e.AttachmentId).HasColumnName("AttachmentID");
            entity.Property(e => e.FileType).HasMaxLength(50);
            entity.Property(e => e.FileUrl)
                .HasMaxLength(255)
                .HasColumnName("FileURL");
            entity.Property(e => e.MessageId).HasColumnName("MessageID");

            entity.HasOne(d => d.Message).WithMany(p => p.ChatAttachments)
                .HasForeignKey(d => d.MessageId)
                .HasConstraintName("FK__ChatAttac__Messa__17F790F9");
        });

        modelBuilder.Entity<ChatMessage>(entity =>
        {
            entity.HasKey(e => e.MessageId).HasName("PK__ChatMess__C87C037C7AA3C3E4");

            entity.Property(e => e.MessageId).HasColumnName("MessageID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.RoomId).HasColumnName("RoomID");
            entity.Property(e => e.SenderId).HasColumnName("SenderID");

            entity.HasOne(d => d.Room).WithMany(p => p.ChatMessages)
                .HasForeignKey(d => d.RoomId)
                .HasConstraintName("FK__ChatMessa__RoomI__14270015");

            entity.HasOne(d => d.Sender).WithMany(p => p.ChatMessages)
                .HasForeignKey(d => d.SenderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ChatMessa__Sende__151B244E");
        });

        modelBuilder.Entity<ChatRoom>(entity =>
        {
            entity.HasKey(e => e.RoomId).HasName("PK__ChatRoom__328639192BF2F3B6");

            entity.Property(e => e.RoomId).HasColumnName("RoomID");
            entity.Property(e => e.AdminId).HasColumnName("AdminID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.IsClosed).HasDefaultValue(false);

            entity.HasOne(d => d.Admin).WithMany(p => p.ChatRoomAdmins)
                .HasForeignKey(d => d.AdminId)
                .HasConstraintName("FK__ChatRooms__Admin__10566F31");

            entity.HasOne(d => d.Customer).WithMany(p => p.ChatRoomCustomers)
                .HasForeignKey(d => d.CustomerId)
                .HasConstraintName("FK__ChatRooms__Custo__0F624AF8");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__Orders__C3905BAF749679E0");

            entity.Property(e => e.OrderId).HasColumnName("OrderID");
            entity.Property(e => e.AccountId).HasColumnName("AccountID");
            entity.Property(e => e.AddressId).HasColumnName("AddressID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Pending");
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(12, 2)");

            entity.HasOne(d => d.Account).WithMany(p => p.Orders)
                .HasForeignKey(d => d.AccountId)
                .HasConstraintName("FK__Orders__AccountI__6A30C649");

            entity.HasOne(d => d.Address).WithMany(p => p.Orders)
                .HasForeignKey(d => d.AddressId)
                .HasConstraintName("FK__Orders__AddressI__6B24EA82");
        });

        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasKey(e => e.OrderDetailId).HasName("PK__OrderDet__D3B9D30CF3B93FA4");

            entity.Property(e => e.OrderDetailId).HasColumnName("OrderDetailID");
            entity.Property(e => e.OrderId).HasColumnName("OrderID");
            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.SubTotal)
                .HasComputedColumnSql("([Quantity]*[UnitPrice])", true)
                .HasColumnType("decimal(23, 2)");
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(12, 2)");
            entity.Property(e => e.VariantId).HasColumnName("VariantID");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__OrderDeta__Order__6FE99F9F");

            entity.HasOne(d => d.Product).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__OrderDeta__Produ__70DDC3D8");

            entity.HasOne(d => d.Variant).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.VariantId)
                .HasConstraintName("FK__OrderDeta__Varia__71D1E811");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__Payments__9B556A58C1B9B27C");

            entity.Property(e => e.PaymentId).HasColumnName("PaymentID");
            entity.Property(e => e.Amount).HasColumnType("decimal(12, 2)");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Method)
                .HasMaxLength(20)
                .HasDefaultValue("COD");
            entity.Property(e => e.OrderId).HasColumnName("OrderID");
            entity.Property(e => e.PaymentStatus)
                .HasMaxLength(20)
                .HasDefaultValue("Pending");

            entity.HasOne(d => d.Order).WithMany(p => p.Payments)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__Payments__OrderI__7A672E12");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.ProductId).HasName("PK__Products__B40CC6ED0C9F8DC0");

            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.CategoryId).HasColumnName("CategoryID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.Price).HasColumnType("decimal(12, 2)");
            entity.Property(e => e.SoldCount).HasDefaultValue(0);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Active");
            entity.Property(e => e.StockQuantity).HasDefaultValue(0);

            entity.HasOne(d => d.Category).WithMany(p => p.Products)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK__Products__Catego__4E88ABD4");
        });

        modelBuilder.Entity<ProductImage>(entity =>
        {
            entity.HasKey(e => e.ImageId).HasName("PK__ProductI__7516F4ECC36AA682");

            entity.Property(e => e.ImageId).HasColumnName("ImageID");
            entity.Property(e => e.ImageUrl)
                .HasMaxLength(255)
                .HasColumnName("ImageURL");
            entity.Property(e => e.IsPrimary).HasDefaultValue(false);
            entity.Property(e => e.ProductId).HasColumnName("ProductID");

            entity.HasOne(d => d.Product).WithMany(p => p.ProductImages)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__ProductIm__Produ__52593CB8");
        });

        modelBuilder.Entity<ProductVariant>(entity =>
        {
            entity.HasKey(e => e.VariantId).HasName("PK__ProductV__0EA233E4D91FA446");

            entity.HasIndex(e => e.Sku, "UQ__ProductV__CA1ECF0DDCCB17D1").IsUnique();

            entity.Property(e => e.VariantId).HasColumnName("VariantID");
            entity.Property(e => e.Price).HasColumnType("decimal(12, 2)");
            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.Sku)
                .HasMaxLength(100)
                .HasColumnName("SKU");
            entity.Property(e => e.StockQuantity).HasDefaultValue(0);
            entity.Property(e => e.VariantName).HasMaxLength(100);

            entity.HasOne(d => d.Product).WithMany(p => p.ProductVariants)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__ProductVa__Produ__59063A47");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.ReviewId).HasName("PK__Reviews__74BC79AE7269D6E2");

            entity.Property(e => e.ReviewId).HasColumnName("ReviewID");
            entity.Property(e => e.AccountId).HasColumnName("AccountID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.ProductId).HasColumnName("ProductID");

            entity.HasOne(d => d.Account).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.AccountId)
                .HasConstraintName("FK__Reviews__Account__00200768");

            entity.HasOne(d => d.Product).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__Reviews__Product__7F2BE32F");
        });



        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CCAC8F8B4581");

            entity.HasIndex(e => e.AccountId, "UQ__Users__349DA5877B7EA88E").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("UserID");
            entity.Property(e => e.AccountId).HasColumnName("AccountID");
            entity.Property(e => e.AvatarUrl)
                .HasMaxLength(255)
                .HasColumnName("AvatarURL");
            entity.Property(e => e.FullName).HasMaxLength(150);
            entity.Property(e => e.Gender).HasMaxLength(10);

            entity.HasOne(d => d.Account).WithOne(p => p.User)
                .HasForeignKey<User>(d => d.AccountId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__Users__AccountID__3E52440B");
        });

        modelBuilder.Entity<UserAddress>(entity =>
        {
            entity.HasKey(e => e.AddressId).HasName("PK__UserAddr__091C2A1B780CBC7D");

            entity.Property(e => e.AddressId).HasColumnName("AddressID");
            entity.Property(e => e.AccountId).HasColumnName("AccountID");
            entity.Property(e => e.AddressLine).HasMaxLength(255);
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.IsDefault).HasDefaultValue(false);
            entity.Property(e => e.Province).HasMaxLength(100);

            entity.HasOne(d => d.Account).WithMany(p => p.UserAddresses)
                .HasForeignKey(d => d.AccountId)
                .HasConstraintName("FK__UserAddre__Accou__4222D4EF");
        });

        modelBuilder.Entity<Voucher>(entity =>
        {
            entity.HasKey(e => e.VoucherId).HasName("PK__Vouchers__3AEE79C1B80851FA");

            entity.HasIndex(e => e.Code, "UQ__Vouchers__A25C5AA7D849F029").IsUnique();

            entity.Property(e => e.VoucherId).HasColumnName("VoucherID");
            entity.Property(e => e.Code).HasMaxLength(50);
            entity.Property(e => e.DiscountPercent).HasColumnType("decimal(5, 2)");
            entity.Property(e => e.EndDate).HasColumnType("datetime");
            entity.Property(e => e.MinOrderAmount)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(12, 2)");
            entity.Property(e => e.StartDate).HasColumnType("datetime");
        });

        modelBuilder.Entity<Wishlist>(entity =>
        {
            entity.HasKey(e => e.WishlistId).HasName("PK__Wishlist__233189CBE1A9C88E");

            entity.HasIndex(e => new { e.AccountId, e.ProductId }, "UQ_Wishlist").IsUnique();

            entity.Property(e => e.WishlistId).HasColumnName("WishlistID");
            entity.Property(e => e.AccountId).HasColumnName("AccountID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.ProductId).HasColumnName("ProductID");

            entity.HasOne(d => d.Account).WithMany(p => p.Wishlists)
                .HasForeignKey(d => d.AccountId)
                .HasConstraintName("FK__Wishlists__Accou__04E4BC85");

            entity.HasOne(d => d.Product).WithMany(p => p.Wishlists)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__Wishlists__Produ__05D8E0BE");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
