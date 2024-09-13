using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

[Route("api/[controller]")]
[ApiController]
public class GardensController : ControllerBase
{
	private readonly IMongoCollection<Garden> _gardensCollection;

	public GardensController(IMongoDatabase database)
	{
		_gardensCollection = database.GetCollection<Garden>("Gardens");
	}

	[HttpGet]
	public async Task<IActionResult> Get()
	{
		var gardens = await _gardensCollection.Find(_ => true).ToListAsync();
		return Ok(gardens);
	}

	[HttpPost]
	public async Task<IActionResult> Create(Garden garden)
	{
		await _gardensCollection.InsertOneAsync(garden);
		return CreatedAtAction(nameof(Get), new { id = garden.Id }, garden);
	}

	[HttpPut("{id}")]
	public async Task<IActionResult> Update(string id, Garden garden)
	{
		var result = await _gardensCollection.ReplaceOneAsync(g => g.Id == id, garden);
		if (result.MatchedCount == 0)
		{
			return NotFound();
		}
		return Ok(garden);
	}

	[HttpDelete("{id}")]
	public async Task<IActionResult> Delete(string id)
	{
		var result = await _gardensCollection.DeleteOneAsync(g => g.Id == id);
		if (result.DeletedCount == 0)
		{
			return NotFound();
		}
		return NoContent();
	}

	[HttpGet("{id}")]
	public async Task<IActionResult> GetById(string id)
	{
		var garden = await _gardensCollection.Find(g => g.Id == id).FirstOrDefaultAsync();
		if (garden == null)
		{
			return NotFound();
		}
		return Ok(garden);
	}

	[HttpGet("by-user/{userId}")]
	public async Task<IActionResult> GetByUserId(string userId)
	{
		var gardens = await _gardensCollection.Find(g => g.UserId == userId).ToListAsync();
		return Ok(gardens);
	}

}