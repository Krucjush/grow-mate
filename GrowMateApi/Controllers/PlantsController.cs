using System.Security.Claims;
using GrowMateApi.Models;
using GrowMateApi.Models.Templates;
using GrowMateApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace GrowMateApi.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class PlantsController : ControllerBase
	{
		private readonly IMongoCollection<Plant> _plantsCollection;
		private readonly IMongoCollection<GardenTask> _tasksCollection;
		private readonly IMongoCollection<Notification> _notificationsCollection;
		private readonly IMongoCollection<PlantGrowthRecord> _growthRecordCollection;
		private readonly IMongoCollection<Garden> _gardensCollection;
		private readonly PlantApiService _plantApiService;

		public PlantsController(IMongoDatabase database, PlantApiService plantApiService)
		{
			_plantsCollection = database.GetCollection<Plant>("Plants");
			_tasksCollection = database.GetCollection<GardenTask>("GardenTasks");
			_notificationsCollection = database.GetCollection<Notification>("Notifications");
			_growthRecordCollection = database.GetCollection<PlantGrowthRecord>("GrowthRecords");
			_gardensCollection = database.GetCollection<Garden>("Gardens");
			_plantApiService = plantApiService;
		}

		[AllowAnonymous]
		[HttpGet]
		public async Task<IActionResult> Get()
		{
			var plants = await _plantsCollection.Find(_ => true).ToListAsync();
			return Ok(plants);
		}

		[Authorize]
		[HttpPost]
		public async Task<IActionResult> Create(Plant plant)
		{
			await _plantsCollection.InsertOneAsync(plant);
			return CreatedAtAction(nameof(Get), new { id = plant.Id }, plant);
		}

		[Authorize]
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

		[AllowAnonymous]
		[HttpGet("by-api/{apiPlantId}")]
		public async Task<IActionResult> GetByApiPlant(string apiPlantId)
		{
			var plants = await _plantsCollection.Find(p => p.ApiPlantId == apiPlantId).ToListAsync();
			return Ok(plants);
		}

		[Authorize]
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

		[Authorize]
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

		[Authorize]
		[HttpPost("add-to-garden/{gardenId}/{plantId}")]
		public async Task<IActionResult> AddPlantToUserGarden(string gardenId, string plantId)
		{
			var garden = await _gardensCollection.Find(g => g.Id == gardenId).FirstOrDefaultAsync();
			if (garden == null)
			{
				return NotFound("Garden not found.");
			}

			var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

			if (userId == null)
			{
				return Unauthorized("User ID not found in the token.");
			}

			if (garden.UserId != userId)
			{
				return Forbid("You do not have access to this garden.");
			}

			var plantData = await _plantApiService.GetPlantDataAsync(plantId);
			if (plantData == null)
			{
				return NotFound("Plant not found in the external API.");
			}

			var plant = new Plant
			{
				Id = Guid.NewGuid().ToString(),
				Name = plantData.CommonName,
				ApiPlantId = plantId,
				DatePlanted = DateTime.UtcNow,
				LastWatered = DateTime.UtcNow,
			};

			garden.Plants ??= new List<Plant>();
			garden.Plants.Add(plant);

			await _gardensCollection.ReplaceOneAsync(g => g.Id == gardenId, garden);

			var recurrenceInterval = plantData.Watering switch
			{
				"Frequent" => TimeSpan.FromDays(1),
				"Average" => TimeSpan.FromDays(2),
				_ => TimeSpan.FromDays(3)
			};

			var wateringTask = new GardenTask
			{
				Id = Guid.NewGuid().ToString(),
				UserId = garden.UserId,
				PlantId = plantId,
				TaskName = "Watering",
				TaskType = "Recurring",
				ScheduledTime = DateTime.Now.Add(recurrenceInterval),
				RecurrenceInterval = recurrenceInterval,
				IsCompleted = false,
				Notes = $"Water your plant '{plantData.CommonName}' regularly based on its needs."
			};

			await _tasksCollection.InsertOneAsync(wateringTask);

			var notification = new Notification
			{
				Id = Guid.NewGuid().ToString(),
				UserId = userId,
				Message = $"You have a new task: Water your plant '{plantData.CommonName}'.",
				IsRead = false,
				ScheduledTime = wateringTask.ScheduledTime
			};

			await _notificationsCollection.InsertOneAsync(notification);

			return CreatedAtAction(nameof(AddPlantToUserGarden), new { userId, plantId }, wateringTask);
		}
		[Authorize]
		[HttpPost("add-growth-record/{userId}/{plantId}")]
		public async Task<IActionResult> AddPlantGrowthRecord(string userId, string plantId, [FromBody] PlantGrowthRecord growthRecord)
		{
			var garden = await _gardensCollection
				.Find(g => g.UserId == userId)
				.FirstOrDefaultAsync();

			if (garden == null)
			{
				return NotFound("Garden not found for this user.");
			}

			var plant = garden.Plants.FirstOrDefault(p => p.Id == plantId);
			if (plant == null)
			{
				return NotFound("Plant not found in the user's garden.");
			}

			growthRecord.RecordDate = growthRecord.RecordDate == default ? DateTime.Now : growthRecord.RecordDate;

			plant.GrowthRecords.Add(growthRecord);

			await _gardensCollection.ReplaceOneAsync(g => g.Id == garden.Id, garden);

			return Ok(growthRecord);
		}
		[Authorize]
		[HttpGet("growth-records/{userId}/{plantId}")]
		public async Task<IActionResult> GetGrowthRecordsForPlant(string userId, string plantId)
		{
			var garden = await _gardensCollection
				.Find(g => g.UserId == userId)
				.FirstOrDefaultAsync();

			if (garden == null || !garden.Plants.Any())
			{
				return NotFound("No plants found in the user's garden.");
			}

			var plant = garden.Plants.FirstOrDefault(p => p.Id == plantId);
			if (plant == null || !plant.GrowthRecords.Any())
			{
				return NotFound("No growth records found for this plant.");
			}

			return Ok(plant.GrowthRecords);
		}

		[Authorize]
		[HttpGet("plants/{plantId}/tasks")]
		public async Task<IActionResult> GetTasksForPlant(string plantId)
		{
			var tasks = await _tasksCollection.Find(t => t.PlantId == plantId).ToListAsync();

			if (tasks == null || !tasks.Any())
			{
				return NotFound("No tasks found for this plant.");
			}

			return Ok(tasks);
		}
	}
}