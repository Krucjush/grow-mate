using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;


[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
	private readonly IMongoCollection<User> _usersCollection;
	private readonly IConfiguration _configuration;

	public AuthController(IMongoDatabase database, IConfiguration configuration)
	{
		_usersCollection = database.GetCollection<User>("Users");
		_configuration = configuration;
	}

	[AllowAnonymous]
	[HttpPost("register")]
	public async Task<IActionResult> Register(UserDto request)
	{
		var existingUser = await _usersCollection.Find(u => u.Email == request.Email).FirstOrDefaultAsync();
		if (existingUser != null)
			return BadRequest("User with this email already exists.");

		var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

		var user = new User
		{
			Id = Guid.NewGuid().ToString(),
			Username = request.Username,
			Email = request.Email,
			PasswordHash = passwordHash
		};

		await _usersCollection.InsertOneAsync(user);
		return Ok("User registered successfully");
	}

	[AllowAnonymous]
	[HttpPost("login")]
	public async Task<IActionResult> Login(UserLoginDto request)
	{
		var user = await _usersCollection.Find(u => u.Email == request.Email).FirstOrDefaultAsync();
		if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
			return Unauthorized("Invalid credentials.");

		var token = CreateToken(user);
		return Ok(new { token, user.Id });
	}

	private string CreateToken(User user)
	{
		var claims = new[]
		{
			new Claim(ClaimTypes.NameIdentifier, user.Id),
			new Claim(ClaimTypes.Email, user.Email),
			new Claim(ClaimTypes.Name, user.Username)
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