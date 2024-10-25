using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using GrowMateApi.Interfaces;
using GrowMateApi.Models.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using Amazon.Runtime.Internal;


[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
	private readonly IMongoCollection<User> _usersCollection;
	private readonly IConfiguration _configuration;
	private readonly IEmailService _emailService;
	private readonly Regex _passwordRegex = new (@"^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$");

	public AuthController(IMongoDatabase database, IConfiguration configuration, IEmailService emailService)
	{
		_usersCollection = database.GetCollection<User>("Users");
		_configuration = configuration;
		_emailService = emailService;
	}

	[AllowAnonymous]
	[HttpPost("register")]
	public async Task<IActionResult> Register(UserDto request)
	{
		request.Username = request.Username.ToLower();
		request.Email = request.Email.ToLower();

		var emailRegex = new Regex(@"^[a-z0-9]([a-z0-9.]*[a-z0-9])?@[a-z0-9]+\.[a-z0-9]+$");
		if (!emailRegex.IsMatch(request.Email))
		{
			return BadRequest("Invalid email format.");
		}

		
		if (!_passwordRegex.IsMatch(request.Password))
		{
			return BadRequest(
				"Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
		}

		var existingUser = await _usersCollection.Find(u => u.Email == request.Email).FirstOrDefaultAsync();
		if (existingUser != null)
			return BadRequest("User with this email already exists.");

		var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

		var user = new User
		{
			Id = Guid.NewGuid().ToString(),
			Username = request.Username,
			Email = request.Email,
			PasswordHash = passwordHash,
			Role = "User"
		};

		await _usersCollection.InsertOneAsync(user);
		return Ok("User registered successfully");
	}

	[AllowAnonymous]
	[HttpPost("login")]
	public async Task<IActionResult> Login(UserLoginDto request)
	{
		request.Email = request.Email.ToLower();
		var user = await _usersCollection.Find(u => u.Email == request.Email).FirstOrDefaultAsync();
		if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
			return Unauthorized("Invalid credentials.");

		var token = CreateToken(user);
		return Ok(new { token, user.Id });
	}

	[AllowAnonymous]
	[HttpPost("request-password-reset")]
	public async Task<IActionResult> RequestPasswordReset([FromBody] string email)
	{
		email = email.ToLower();
		var user = await _usersCollection.Find(u => u.Email == email).FirstOrDefaultAsync();
		if (user == null) return NotFound("No user found with this email.");

		var resetToken = Guid.NewGuid().ToString();
		user.PasswordResetToken = resetToken;
		user.ResetTokenExpiration = DateTime.UtcNow.AddHours(1);

		await _usersCollection.ReplaceOneAsync(u => u.Id == user.Id, user);

		var resetLink = $"{Request.Scheme}://{Request.Host}/reset-password?token={resetToken}";
		await _emailService.SendEmailAsync(user.Email, "Password Reset Request",
			$"Click here to reset your password: {resetLink}");

		return Ok("Password reset link has been sent to your email.");
	}

	[AllowAnonymous]
	[HttpPost("reset-password")]
	public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto request)
	{
		var user = await _usersCollection.Find(u => u.PasswordResetToken == request.Token && u.ResetTokenExpiration > DateTime.UtcNow).FirstOrDefaultAsync();
		if (user == null) return BadRequest("Invalid or expired token.");

		user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
		user.PasswordResetToken = null;
		user.ResetTokenExpiration = null;

		await _usersCollection.ReplaceOneAsync(u => u.Id == user.Id, user);

		return Ok("Password has been reset successfully.");
	}

	[Authorize]
	[HttpPut("update-profile")]
	public async Task<IActionResult> UpdateProfile(UpdateUserProfileDto request)
	{
		var requesterId = User.FindFirstValue(ClaimTypes.NameIdentifier);
		if (requesterId == null) return Unauthorized("User not authenticated.");

		if (!string.IsNullOrEmpty(request.Username))
		{
			request.Username = request.Username.ToLower();
		}

		var isAdmin = User.IsInRole("Admin");

		var userId = isAdmin && !string.IsNullOrEmpty(request.UserId) ? request.UserId : requesterId;

		var user = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
		if (user == null) return NotFound("User not found.");

		if (!string.IsNullOrEmpty(request.Username))
		{
			user.Username = request.Username;
		}

		if (!string.IsNullOrEmpty(request.CurrentPassword) && !string.IsNullOrEmpty(request.NewPassword))
		{
			if (!isAdmin)
			{
				if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
				{
					return BadRequest("Current password is incorrect.");
				}
			}
			
			user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
		}

		await _usersCollection.ReplaceOneAsync(u => u.Id == user.Id, user);

		return Ok("Profile updated successfully.");
	}

	private string CreateToken(User user)
	{
		var claims = new[]
		{
			new Claim(ClaimTypes.NameIdentifier, user.Id),
			new Claim(ClaimTypes.Email, user.Email),
			new Claim(ClaimTypes.Name, user.Username),
			new Claim(ClaimTypes.Role, user.Role)
		};

		var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Key"]!));
		var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

		var token = new JwtSecurityToken(
			claims: claims,
			expires: DateTime.Now.AddHours(1),
			signingCredentials: creds
		);

		return new JwtSecurityTokenHandler().WriteToken(token);
	}
}