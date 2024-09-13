using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

[Route("api/[controller]")]
[ApiController]
public class PlantsController : ControllerBase
{
	private readonly IMongoCollection<Plant> _plantsCollection;

	public PlantsController(IMongoDatabase database)
	{
		_plantsCollection = database.GetCollection<Plant>("Plants");
	}

	[HttpGet]
	public async Task<IActionResult> Get()
	{
		var plants = await _plantsCollection.Find(_ => true).ToListAsync();
		return Ok(plants);
	}
	[HttpPost]
	public async Task<IActionResult> Create(Plant plant)
	{
		await _plantsCollection.InsertOneAsync(plant);
		return CreatedAtAction(nameof(Get), new { id = plant.Id }, plant);
	}

	[HttpGet("{id}")]
	public async Task<IActionResult> GetById(string id)
	{
		var plant = await _plantsCollection.Find(p => p.Id == id).FirstOrDefaultAsync();
		if (plant == null)
		{
			return NotFound();
		}
		return Ok(plant);
	}

	[HttpGet("by-knowledge-base/{knowledgeBaseId}")]
	public async Task<IActionResult> GetByKnowledgeBase(string knowledgeBaseId)
	{
		var plants = await _plantsCollection.Find(p => p.KnowledgeBaseId == knowledgeBaseId).ToListAsync();
		return Ok(plants);
	}

	[HttpPut("{id}")]
	public async Task<IActionResult> Update(string id, Plant plant)
	{
		var result = await _plantsCollection.ReplaceOneAsync(p => p.Id == id, plant);
		if (result.MatchedCount == 0)
		{
			return NotFound();
		}
		return Ok(plant);
	}

	[HttpDelete("{id}")]
	public async Task<IActionResult> Delete(string id)
	{
		var result = await _plantsCollection.DeleteOneAsync(p => p.Id == id);
		if (result.DeletedCount == 0)
		{
			return NotFound();
		}
		return NoContent();
	}
}