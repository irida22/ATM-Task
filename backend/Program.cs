using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ATM.Infrastructure.Data;
using ATM.Core.Application;
using ATM.API.DTOs;
using ATM.Core.Domain;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .SetBasePath(Path.Combine(builder.Environment.ContentRootPath, "Config"))
    .AddJsonFile("appsettings.json")
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddEnvironmentVariables();

// Using the correct external database URL with port
var connectionString = "postgresql://atm_db_user:jDbpHvc4tWY3GgbJKPojksvAhz4I9ZhK@dpg-d25ubpggjchc73dorij0-a.oregon-postgres.render.com:5432/atm_db";

Console.WriteLine($"Using connection string: {connectionString}");

builder.Services.AddCors()
    .AddDbContext<AtmDbContext>(options => 
        options.UseNpgsql(connectionString))
    .AddScoped<UserService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    try 
    {
        var context = scope.ServiceProvider.GetService<AtmDbContext>();
        
        Console.WriteLine("Running database migrations...");
        await context.Database.MigrateAsync();
        Console.WriteLine("Database migrations completed successfully");
        
        if (!await context.Users.AnyAsync())
        {
            var adminUser = new User { Username = "admin", Pin = "123", Balance = 1000.00m };
            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
            Console.WriteLine("Created admin user successfully");
        }
        else 
        {
            Console.WriteLine("Admin user already exists");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database setup error: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
    }
}

var allowedOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")?.Split(',') 
                    ?? new[] { "http://localhost:5173" };

app.UseCors(options => options
    .WithOrigins(allowedOrigins)
    .AllowAnyMethod()
    .AllowAnyHeader());

app.MapPost("/api/login", async (LoginRequest request, UserService userService) =>
{
    var user = await userService.ValidateUserAsync(request.Username, request.Password);
    return user != null 
        ? Results.Ok(new { userId = user.Id })
        : Results.Unauthorized();
});

app.MapGet("/api/users/{userId}/balance", async (int userId, UserService userService) =>
{
    var balance = await userService.GetUserBalanceAsync(userId);
    return balance.HasValue
        ? Results.Ok(new { balance = balance.Value })
        : Results.NotFound();
});

app.MapPost("/api/users/{userId}/deposit", async (int userId, TransactionRequest request, UserService userService) =>
{
    var success = await userService.DepositAsync(userId, request.Amount);
    return success 
        ? Results.Ok(new { message = "Deposit successful" })
        : Results.BadRequest(new { message = "Deposit failed" });
});

app.MapPost("/api/users/{userId}/withdraw", async (int userId, TransactionRequest request, UserService userService) =>
{
    var success = await userService.WithdrawAsync(userId, request.Amount);
    return success 
        ? Results.Ok(new { message = "Withdrawal successful" })
        : Results.BadRequest(new { message = "Insufficient funds or invalid amount" });
});

app.MapGet("/api/users/{userId}/transactions", async (int userId, UserService userService) =>
{
    var transactions = await userService.GetTransactionsAsync(userId);
    return Results.Ok(transactions);
});

app.Run();
