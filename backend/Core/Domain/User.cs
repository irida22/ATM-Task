namespace ATM.Core.Domain;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Pin { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public List<Transaction> Transactions { get; set; } = new();
} 