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

	[HttpGet]
	public async Task<IActionResult> Get()
	{
		var users = await _usersCollection.Find(_ => true).ToListAsync();
		return Ok(users);
	}

	[HttpPost]
	public async Task<IActionResult> Create(User user)
	{
		await _usersCollection.InsertOneAsync(user);
		return CreatedAtAction(nameof(Get), new { id = user.Id }, user);
	}

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

	[HttpDelete("{id}")]
	public async Task<IActionResult> Delete(string id)
	{
		var result = await _usersCollection.DeleteOneAsync(u => u.Id == id);
		if (result.DeletedCount == 0)
		{
			return NotFound();
		}

		return NoContent();
	}

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