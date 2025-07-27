using Microsoft.EntityFrameworkCore;
using ATM.Core.Domain;

namespace ATM.Infrastructure.Data;

public class AtmDbContext : DbContext
{
    public AtmDbContext(DbContextOptions<AtmDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Transaction> Transactions { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity => {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).HasMaxLength(50);
            entity.Property(e => e.Pin).HasMaxLength(4);
            entity.HasIndex(e => e.Username).IsUnique();
            
            entity.HasData(new User {
                Id = 1,
                Username = "admin",
                Pin = "1234",
                Balance = 1000.00m
            });
        });
    }
} 