using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using Shancrys.Api.Models;
using System.IdentityModel.Tokens.Jwt;

namespace Shancrys.Api.Services;

public interface IAuthService
{
    Task<(bool Success, string? Token, string? RefreshToken, User? User, string? Error)> LoginAsync(string email, string password);
    Task<(bool Success, User? User, string? Error)> RegisterAsync(string email, string password, string name, Guid tenantId, List<string> roles);
    string GenerateJwtToken(User user);
}

public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;
    private readonly IPasswordHasher<User> _passwordHasher;

    public AuthService(IConfiguration configuration, IPasswordHasher<User> passwordHasher)
    {
        _configuration = configuration;
        _passwordHasher = passwordHasher;
    }

    public Task<(bool Success, string? Token, string? RefreshToken, User? User, string? Error)> LoginAsync(string email, string password)
    {
        // Mock user para desenvolvimento
        var mockUser = new User
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Email = email,
            Name = "Mock User",
            TenantId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Roles = new List<string> { "admin", "manager" },
            PasswordHash = _passwordHasher.HashPassword(null!, "demo123"),
            CreatedAt = DateTime.UtcNow
        };

        var passwordVerification = _passwordHasher.VerifyHashedPassword(mockUser, mockUser.PasswordHash, password);
        
        if (passwordVerification == PasswordVerificationResult.Failed)
        {
            return Task.FromResult<(bool, string?, string?, User?, string?)>((false, null, null, null, "Credenciais inválidas. Use senha: demo123"));
        }

        var token = GenerateJwtToken(mockUser);
        
        return Task.FromResult<(bool, string?, string?, User?, string?)>((true, token, null, mockUser, null));
    }

    public Task<(bool Success, User? User, string? Error)> RegisterAsync(string email, string password, string name, Guid tenantId, List<string> roles)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            Name = name,
            TenantId = tenantId,
            Roles = roles,
            PasswordHash = "", // Temporário
            CreatedAt = DateTime.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, password);

        // TODO: Salvar no banco via DbContext
        
        return Task.FromResult<(bool, User?, string?)>((true, user, null));
    }

    public string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
        var issuer = jwtSettings["Issuer"];
        var audience = jwtSettings["Audience"];
        var expirationMinutes = int.Parse(jwtSettings["ExpirationMinutes"] ?? "60");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim("tenantId", user.TenantId.ToString())
        };

        foreach (var role in user.Roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
