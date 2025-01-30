using GrowMateApi.Interfaces;
using GrowMateApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Threading.Tasks;

namespace GrowMateApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class GardensController : ControllerBase
{
	private readonly IMongoCollection<Garden> _gardensCollection;
	private readonly IGardenTemplateService _gardenTemplateService;
	private readonly IMongoCollection<GardenTask> _tasksCollection;

	public GardensController(IMongoDatabase database, IGardenTemplateService gardenTemplateService)
	{
		_gardensCollection = database.GetCollection<Garden>("Gardens");
		_gardenTemplateService = gardenTemplateService;
		_tasksCollection = database.GetCollection<GardenTask>("GardenTasks");
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

	[Authorize]
	[HttpPost("{gardenId}/plants")]
	public async Task<IActionResult> AddPlant(string gardenId, [FromBody] Plant plant)
	{
		plant.Id = Guid.NewGuid().ToString();

		var garden = await _gardensCollection.Find(g => g.Id == gardenId).FirstOrDefaultAsync();

		garden.Plants?.Add(plant);

		await _gardensCollection.ReplaceOneAsync(g => g.Id == gardenId, garden);

		var newTask = new GardenTask
		{
			Id = Guid.NewGuid().ToString(),
			UserId = gardenId,
			TaskName = $"{plant.Name} watering",
			PlantId = plant.Id,
			ScheduledTime = DateTime.UtcNow.Add(TimeSpan.FromHours(10)),
			IsCompleted = false,
			TaskType = "Watering",
			RecurrenceInterval = TimeSpan.FromHours(10),
			Notes = ""
		};

		await _tasksCollection.InsertOneAsync(newTask);

		return Ok(garden);
	}

	[Authorize]
	[HttpDelete("{gardenId}/plants/{plantId}")]
	public async Task<IActionResult> RemovePlant(string gardenId, string plantId)
	{
		var garden = await _gardensCollection.Find(g => g.Id == gardenId).FirstOrDefaultAsync();
		if (garden == null)
		{
			return NotFound($"Garden with ID {gardenId} not found.");
		}

		var plant = garden.Plants?.FirstOrDefault(p => p.Id == plantId);
		if (plant == null)
		{
			return NotFound($"Plant with ID {plantId} not found in garden {gardenId}.");
		}

		garden.Plants!.Remove(plant);

		await _gardensCollection.ReplaceOneAsync(g => g.Id == gardenId, garden);

		return NoContent();
	}

	[Authorize]
	[HttpPut("{gardenId}/plants/{plantId}/water")]
	public async Task<IActionResult> UpdatePlantLastWatered(string gardenId, string plantId)
	{
		var garden = await _gardensCollection.Find(g => g.Id == gardenId).FirstOrDefaultAsync();
		if (garden == null)
		{
			return NotFound($"Garden with ID {gardenId} not found.");
		}

		var plant = garden.Plants?.FirstOrDefault(p => p.Id == plantId);
		if (plant == null)
		{
			return NotFound($"Plant with ID {plantId} not found in garden {gardenId}.");
		}

		plant.LastWatered = DateTime.UtcNow;

		await _gardensCollection.ReplaceOneAsync(g => g.Id == gardenId, garden);

		return Ok(plant);
	}

	[Authorize]
	[HttpPost("{gardenId}/plants/{plantId}/growth-records")]
	public async Task<IActionResult> AddGrowthRecord(string gardenId, string plantId, [FromBody] PlantGrowthRecord record)
	{
		var garden = await _gardensCollection.Find(g => g.Id == gardenId).FirstOrDefaultAsync();
		if (garden == null)
		{
			return NotFound($"Garden with ID {gardenId} not found.");
		}

		var plant = garden.Plants?.FirstOrDefault(p => p.Id == plantId);
		if (plant == null)
		{
			return NotFound($"Plant with ID {plantId} not found in garden {gardenId}.");
		}

		record.RecordDate = DateTime.UtcNow;
		plant.GrowthRecords.Add(record);

		await _gardensCollection.ReplaceOneAsync(g => g.Id == gardenId, garden);

		return Ok(record);
	}

	[Authorize]
	[HttpPut("{gardenId}/plants/{plantId}/growth-records/{recordDate}")]
	public async Task<IActionResult> UpdateGrowthRecord(string gardenId, string plantId, DateTime recordDate, [FromBody] PlantGrowthRecord updatedRecord)
	{
		var garden = await _gardensCollection.Find(g => g.Id == gardenId).FirstOrDefaultAsync();
		if (garden == null)
		{
			return NotFound($"Garden with ID {gardenId} not found.");
		}

		var plant = garden.Plants?.FirstOrDefault(p => p.Id == plantId);
		if (plant == null)
		{
			return NotFound($"Plant with ID {plantId} not found in garden {gardenId}.");
		}

		var record = plant.GrowthRecords.FirstOrDefault(r => r.RecordDate == recordDate);
		if (record == null)
		{
			return NotFound($"Growth record with date {recordDate} not found.");
		}

		record.Notes = updatedRecord.Notes;
		record.PhotoUrl = updatedRecord.PhotoUrl;

		await _gardensCollection.ReplaceOneAsync(g => g.Id == gardenId, garden);

		return Ok(record);
	}

	[Authorize]
	[HttpDelete("{gardenId}/plants/{plantId}/growth-records/{recordDate}")]
	public async Task<IActionResult> RemoveGrowthRecord(string gardenId, string plantId, DateTime recordDate)
	{
		var garden = await _gardensCollection.Find(g => g.Id == gardenId).FirstOrDefaultAsync();
		if (garden == null)
		{
			return NotFound($"Garden with ID {gardenId} not found.");
		}

		var plant = garden.Plants?.FirstOrDefault(p => p.Id == plantId);
		if (plant == null)
		{
			return NotFound($"Plant with ID {plantId} not found in garden {gardenId}.");
		}

		var recordToRemove = plant.GrowthRecords.FirstOrDefault(r => r.RecordDate == recordDate);
		if (recordToRemove == null)
		{
			return NotFound($"Growth record with date {recordDate} not found.");
		}

		plant.GrowthRecords.Remove(recordToRemove);

		await _gardensCollection.ReplaceOneAsync(g => g.Id == gardenId, garden);

		return NoContent();
	}
}