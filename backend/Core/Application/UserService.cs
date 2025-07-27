using Microsoft.EntityFrameworkCore;
using ATM.Infrastructure.Data;
using ATM.Core.Domain;

namespace ATM.Core.Application;

public class UserService
{
    private readonly AtmDbContext _context;

    public UserService(AtmDbContext context)
    {
        _context = context;
    }

    public async Task<User?> ValidateUserAsync(string username, string pin)
    {
        return await _context.Users.FirstOrDefaultAsync(u => 
            u.Username == username && 
            u.Pin == pin);
    }

    public async Task<decimal?> GetUserBalanceAsync(int userId)
    {
        return await _context.Users
            .Where(u => u.Id == userId)
            .Select(u => u.Balance)
            .FirstOrDefaultAsync();
    }

    public async Task<bool> DepositAsync(int userId, decimal amount)
    {
        if (amount <= 0) return false;

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        user.Balance += amount;
        _context.Transactions.Add(new Transaction 
        { 
            UserId = userId, 
            Type = "Deposit", 
            Amount = amount, 
            BalanceAfter = user.Balance,
            Timestamp = DateTime.UtcNow 
        });
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> WithdrawAsync(int userId, decimal amount)
    {
        if (amount <= 0) return false;

        var user = await _context.Users.FindAsync(userId);
        if (user == null || user.Balance < amount) return false;

        user.Balance -= amount;
        _context.Transactions.Add(new Transaction 
        { 
            UserId = userId, 
            Type = "Withdrawal", 
            Amount = amount, 
            BalanceAfter = user.Balance,
            Timestamp = DateTime.UtcNow 
        });
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<Transaction>> GetTransactionsAsync(int userId)
    {
        return await _context.Transactions.Where(t => t.UserId == userId).OrderByDescending(t => t.Timestamp).Take(10).ToListAsync();
    }
} 