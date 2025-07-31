using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ATM.Infrastructure.Data;
using ATM.Core.Application;
using ATM.API.DTOs;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .SetBasePath(Path.Combine(builder.Environment.ContentRootPath, "Config"))
    .AddJsonFile("appsettings.json")
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddEnvironmentVariables();

var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL") ?? 
                      builder.Configuration.GetConnectionString("DefaultConnection");

// Debug logging for both CORS and Database
Console.WriteLine($"DATABASE_URL environment variable: {Environment.GetEnvironmentVariable("DATABASE_URL")}");
Console.WriteLine($"DefaultConnection from config: {builder.Configuration.GetConnectionString("DefaultConnection")}");
Console.WriteLine($"Final connection string being used: {connectionString}");

builder.Services.AddCors()
    .AddDbContext<AtmDbContext>(options => 
        options.UseNpgsql(connectionString))
    .AddScoped<UserService>();

var app = builder.Build();

var allowedOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")?.Split(',') 
                    ?? new[] { "http://localhost:5173" };

// Debug logging
Console.WriteLine($"ALLOWED_ORIGINS environment variable: {Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")}");
Console.WriteLine($"Configured allowed origins: {string.Join(", ", allowedOrigins)}");

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
