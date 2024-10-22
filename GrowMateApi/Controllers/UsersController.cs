using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
	private readonly IMongoCollection<User> _usersCollection;

	public UsersController(IMongoDatabase database)
	{
		_usersCollection = database.GetCollection<User>("Users");
	}

	[Authorize(Roles= "Admin")]
	[HttpGet]
	public async Task<IActionResult> Get()
	{
		var users = await _usersCollection.Find(_ => true).ToListAsync();
		return Ok(users);
	}

	[Authorize]
	[HttpPut("{id}")]
	public async Task<IActionResult> Update(string id, User user)
	{
		var result = await _usersCollection.ReplaceOneAsync(u => u.Id == id, user);
		if (result.MatchedCount == 0)
		{
			return NotFound();
		}
		return Ok(user);
	}

	[Authorize]
	[HttpDelete("{id}")]
	public async Task<IActionResult> Delete(string id)
	{
		var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
		var currentUserRole = User.FindFirstValue(ClaimTypes.Role);

		if (currentUserId != id && currentUserRole != "Admin")
		{
			return Forbid();
		}

		var result = await _usersCollection.DeleteOneAsync(u => u.Id == id);
		if (result.DeletedCount == 0)
		{
			return NotFound();
		}

		return NoContent();
	}

	[Authorize]
	[HttpGet("{id}")]
	public async Task<IActionResult> GetById(string id)
	{
		var user = await _usersCollection.Find(u => u.Id == id).FirstOrDefaultAsync();
		if (user == null)
		{
			return NotFound();
		}
		return Ok(user);
	}
}