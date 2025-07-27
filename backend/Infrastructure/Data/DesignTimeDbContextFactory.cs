using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace ATM.Infrastructure.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AtmDbContext>
{
    public AtmDbContext CreateDbContext(string[] args)
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "Config"))
            .AddJsonFile("appsettings.json")
            .Build();

        var builder = new DbContextOptionsBuilder<AtmDbContext>();
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        
        builder.UseNpgsql(connectionString);

        return new AtmDbContext(builder.Options);
    }
} 