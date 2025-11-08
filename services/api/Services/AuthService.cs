using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Shancrys.Api.Models;
using System.IdentityModel.Tokens.Jwt;
using Shancrys.Api.Data;
using Shancrys.Api.Configuration;
using MongoDB.Driver;

namespace Shancrys.Api.Services;

public interface IAuthService
{
    Task<(bool Success, string? Token, string? RefreshToken, User? User, string? Error)> LoginAsync(string email, string password);
    Task<(bool Success, User? User, string? Error)> RegisterAsync(string email, string password, string name, Guid tenantId, List<string> roles);
    Task<(bool Success, string? Token, string? RefreshToken, string? Error)> RefreshTokenAsync(string refreshToken);
    Task<bool> RevokeTokenAsync(string refreshToken);
    string GenerateJwtToken(User user);
    Task<User?> GetUserByIdAsync(Guid userId);
}

public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IMongoDbContext _dbContext;
    private readonly ILogger<AuthService> _logger;
    private readonly JwtSettings _jwtSettings;

    public AuthService(
        IConfiguration configuration, 
        IPasswordHasher<User> passwordHasher, 
        IMongoDbContext dbContext,
        ILogger<AuthService> logger)
    {
        _configuration = configuration;
        _passwordHasher = passwordHasher;
        _dbContext = dbContext;
        _logger = logger;
        _jwtSettings = configuration.GetSection("JwtSettings").Get<JwtSettings>() 
            ?? throw new InvalidOperationException("JWT settings not configured");
    }

    public async Task<(bool Success, string? Token, string? RefreshToken, User? User, string? Error)> LoginAsync(string email, string password)
    {
        try
        {
            // Buscar usuário no banco
            var user = await _dbContext.Users
                .Find(u => u.Email.ToLower() == email.ToLower())
                .FirstOrDefaultAsync();

            if (user == null)
            {
                _logger.LogWarning("Login attempt for non-existent user: {Email}", email);
                return (false, null, null, null, "Credenciais inválidas");
            }

            // Verificar se usuário está ativo
            if (!user.IsActive)
            {
                _logger.LogWarning("Login attempt for inactive user: {UserId}", user.Id);
                return (false, null, null, null, "Usuário inativo");
            }

            // Verificar senha
            var passwordVerification = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password);
            if (passwordVerification == PasswordVerificationResult.Failed)
            {
                _logger.LogWarning("Failed login attempt for user: {Email}", email);
                return (false, null, null, null, "Credenciais inválidas");
            }

            // Gerar tokens
            var token = GenerateJwtToken(user);
            var refreshToken = await GenerateRefreshTokenAsync(user.Id);

            // Atualizar último login
            var update = Builders<User>.Update.Set(u => u.LastLoginAt, DateTime.UtcNow);
            await _dbContext.Users.UpdateOneAsync(u => u.Id == user.Id, update);

            _logger.LogInformation("User {UserId} logged in successfully", user.Id);
            return (true, token, refreshToken, user, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for {Email}", email);
            return (false, null, null, null, "Erro ao realizar login");
        }
    }

    public async Task<(bool Success, User? User, string? Error)> RegisterAsync(
        string email, 
        string password, 
        string name, 
        Guid tenantId, 
        List<string> roles)
    {
        try
        {
            // Verificar se o usuário já existe
            var existingUser = await _dbContext.Users
                .Find(u => u.Email.ToLower() == email.ToLower())
                .FirstOrDefaultAsync();

            if (existingUser != null)
            {
                return (false, null, "Email já cadastrado");
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = email.ToLower(),
                Name = name,
                TenantId = tenantId,
                Roles = roles,
                PasswordHash = "", // Temporário
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                EmailVerified = false
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, password);

            // Salvar no MongoDB
            await _dbContext.Users.InsertOneAsync(user);
            
            _logger.LogInformation("User {UserId} registered successfully", user.Id);
            return (true, user, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration for {Email}", email);
            return (false, null, "Erro ao registrar usuário");
        }
    }

    public async Task<(bool Success, string? Token, string? RefreshToken, string? Error)> RefreshTokenAsync(string refreshToken)
    {
        try
        {
            var storedToken = await _dbContext.RefreshTokens
                .Find(rt => rt.Token == refreshToken)
                .FirstOrDefaultAsync();

            if (storedToken == null || !storedToken.IsActive)
            {
                _logger.LogWarning("Invalid refresh token attempt");
                return (false, null, null, "Token inválido ou expirado");
            }

            var user = await GetUserByIdAsync(storedToken.UserId);
            if (user == null || !user.IsActive)
            {
                return (false, null, null, "Usuário não encontrado ou inativo");
            }

            // Revogar token antigo
            var update = Builders<RefreshToken>.Update
                .Set(rt => rt.RevokedAt, DateTime.UtcNow);
            await _dbContext.RefreshTokens.UpdateOneAsync(rt => rt.Id == storedToken.Id, update);

            // Gerar novos tokens
            var newJwtToken = GenerateJwtToken(user);
            var newRefreshToken = await GenerateRefreshTokenAsync(user.Id);

            // Marcar token substituído
            update = Builders<RefreshToken>.Update
                .Set(rt => rt.ReplacedByToken, newRefreshToken);
            await _dbContext.RefreshTokens.UpdateOneAsync(rt => rt.Id == storedToken.Id, update);

            _logger.LogInformation("Token refreshed for user {UserId}", user.Id);
            return (true, newJwtToken, newRefreshToken, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing token");
            return (false, null, null, "Erro ao renovar token");
        }
    }

    public async Task<bool> RevokeTokenAsync(string refreshToken)
    {
        try
        {
            var token = await _dbContext.RefreshTokens
                .Find(rt => rt.Token == refreshToken)
                .FirstOrDefaultAsync();

            if (token == null || !token.IsActive)
            {
                return false;
            }

            var update = Builders<RefreshToken>.Update
                .Set(rt => rt.RevokedAt, DateTime.UtcNow);
            await _dbContext.RefreshTokens.UpdateOneAsync(rt => rt.Id == token.Id, update);

            _logger.LogInformation("Token revoked for user {UserId}", token.UserId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking token");
            return false;
        }
    }

    public string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim("tenantId", user.TenantId.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        foreach (var role in user.Roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<User?> GetUserByIdAsync(Guid userId)
    {
        return await _dbContext.Users
            .Find(u => u.Id == userId)
            .FirstOrDefaultAsync();
    }

    private async Task<string> GenerateRefreshTokenAsync(Guid userId)
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        var token = Convert.ToBase64String(randomBytes);

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays),
            CreatedAt = DateTime.UtcNow
        };

        await _dbContext.RefreshTokens.InsertOneAsync(refreshToken);
        return token;
    }
}
