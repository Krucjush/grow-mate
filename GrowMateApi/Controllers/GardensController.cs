using GrowMateApi.Interfaces;
using GrowMateApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace GrowMateApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class GardensController : ControllerBase
{
	private readonly IMongoCollection<Garden> _gardensCollection;
	private readonly IGardenTemplateService _gardenTemplateService;

	public GardensController(IMongoDatabase database, IGardenTemplateService gardenTemplateService)
	{
		_gardensCollection = database.GetCollection<Garden>("Gardens");
		_gardenTemplateService = gardenTemplateService;
	}

	[Authorize]
	[HttpGet]
	public async Task<IActionResult> Get()
	{
		var gardens = await _gardensCollection.Find(_ => true).ToListAsync();
		return Ok(gardens);
	}

	[Authorize]
	[HttpPost]
	public async Task<IActionResult> Create([FromBody] Garden garden)
	{
		if (!string.IsNullOrEmpty(garden.TemplateId))
		{
			var template = _gardenTemplateService.GetTemplateById(garden.TemplateId);

			if (template == null)
			{
				return BadRequest("Template not found.");
			}

			garden.Description ??= template.Description;
		}

		garden.CreatedAt = DateTime.UtcNow;

		await _gardensCollection.InsertOneAsync(garden);

		return CreatedAtAction(nameof(Get), new { id = garden.Id }, garden);
	}

	[Authorize]
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

	[Authorize]
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

	[Authorize]
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

	[Authorize]
	[HttpGet("by-user/{userId}")]
	public async Task<IActionResult> GetByUserId(string userId)
	{
		var gardens = await _gardensCollection.Find(g => g.UserId == userId).ToListAsync();
		return Ok(gardens);
	}

	//testing if works bring back the previous implementation
	[Authorize]
	[HttpPost("{gardenId}/plants")]
	public async Task<IActionResult> AddPlant(string gardenId, [FromBody] Plant plant)
	{
		plant.Id = Guid.NewGuid().ToString();

		var garden = await _gardensCollection.Find(g => g.Id == gardenId).FirstOrDefaultAsync();

		garden.Plants.Add(plant);

		await _gardensCollection.ReplaceOneAsync(g => g.Id == gardenId, garden);

		return Ok(garden);
	}
}