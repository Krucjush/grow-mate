using GrowMateApi.Models;
using GrowMateApi.Models.Templates;
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
		private readonly IMongoCollection<PlantKnowledgeBase> _plantsKnowledgeBaseCollection;
		private readonly IMongoCollection<GardenTask> _tasksCollection;
		private readonly IMongoCollection<Notification> _notificationsCollection;
		private readonly IMongoCollection<PlantGrowthRecord> _growthRecordCollection;
		private readonly IMongoCollection<Garden> _gardensCollection;

		public PlantsController(IMongoDatabase database)
		{
			_plantsCollection = database.GetCollection<Plant>("Plants");
			_plantsKnowledgeBaseCollection = database.GetCollection<PlantKnowledgeBase>("PlantKnowledgeBase");
			_tasksCollection = database.GetCollection<GardenTask>("GardenTasks");
			_notificationsCollection = database.GetCollection<Notification>("Notifications");
			_growthRecordCollection = database.GetCollection<PlantGrowthRecord>("GrowthRecords");
			_gardensCollection = database.GetCollection<Garden>("Gardens");
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
		[HttpGet("by-knowledge-base/{knowledgeBaseId}")]
		public async Task<IActionResult> GetByKnowledgeBase(string knowledgeBaseId)
		{
			var plants = await _plantsCollection.Find(p => p.KnowledgeBaseId == knowledgeBaseId).ToListAsync();
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
		[HttpPost("add-to-garden/{userId}/{plantId}")]
		public async Task<IActionResult> AddPlantToUserGarden(string userId, string plantId)
		{
			var plantKnowledge = await _plantsKnowledgeBaseCollection
				.Find(pk => pk.Id == plantId)
				.FirstOrDefaultAsync();

			if (plantKnowledge == null) return NotFound("Plant not found in knowledge base.");

			var createdTasks = new List<GardenTask>();

			foreach (var taskTemplate in plantKnowledge.SuggestedTasks)
			{
				var gardenTask = new GardenTask
				{
					UserId = userId,
					PlantId = plantId,
					TaskName = taskTemplate.TaskName,
					TaskType = taskTemplate.TaskType,
					ScheduledTime = DateTime.Now.Add(taskTemplate.RecurrenceInterval ?? TimeSpan.Zero),
					IsCompleted = false,
					Notes = taskTemplate.Notes
				};

				await _tasksCollection.InsertOneAsync(gardenTask);
				createdTasks.Add(gardenTask);

				var notification = new Notification
				{
					UserId = userId,
					Message = $"You have a new task: {taskTemplate.TaskName}",
					IsRead = false,
					ScheduledTime = DateTime.Now.Add(taskTemplate.RecurrenceInterval ?? TimeSpan.Zero)
				};

				await _notificationsCollection.InsertOneAsync(notification);
			}

			return CreatedAtAction(nameof(AddPlantToUserGarden), new { userId, plantId }, createdTasks);
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
	}
}