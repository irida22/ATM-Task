namespace ATM.Core.Domain;

public class Transaction
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Type { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal BalanceAfter { get; set; }
    public DateTime Timestamp { get; set; }
    public User User { get; set; } = null!;
} 