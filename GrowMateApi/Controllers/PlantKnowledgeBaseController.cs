using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

[Route("api/[controller]")]
[ApiController]
public class PlantKnowledgeBaseController : ControllerBase
{
	private readonly IMongoCollection<PlantKnowledgeBase> _knowledgeBaseCollection;

	public PlantKnowledgeBaseController(IMongoDatabase database)
	{
		_knowledgeBaseCollection = database.GetCollection<PlantKnowledgeBase>("PlantKnowledgeBase");
	}

	[AllowAnonymous]
	[HttpGet]
	public async Task<IActionResult> Get()
	{
		var knowledgeBase = await _knowledgeBaseCollection.Find(_ => true).ToListAsync();
		return Ok(knowledgeBase);
	}

	[Authorize]
	[HttpPost]
	public async Task<IActionResult> Create(PlantKnowledgeBase knowledgeBase)
	{
		await _knowledgeBaseCollection.InsertOneAsync(knowledgeBase);
		return CreatedAtAction(nameof(Get), new { id = knowledgeBase.Id }, knowledgeBase);
	}

	[Authorize]
	[HttpPut("{id}")]
	public async Task<IActionResult> Update(string id, PlantKnowledgeBase knowledgeBase)
	{
		var result = await _knowledgeBaseCollection.ReplaceOneAsync(k => k.Id == id, knowledgeBase);
		if (result.MatchedCount == 0)
		{
			return NotFound();
		}
		return Ok(knowledgeBase);
	}

	[Authorize]
	[HttpDelete("{id}")]
	public async Task<IActionResult> Delete(string id)
	{
		var result = await _knowledgeBaseCollection.DeleteOneAsync(k => k.Id == id);
		if (result.DeletedCount == 0)
		{
			return NotFound();
		}

		return NoContent();
	}
}