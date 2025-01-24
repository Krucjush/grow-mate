using GrowMateApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace GrowMateApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class GardenTaskController : ControllerBase
{
	private readonly IMongoCollection<GardenTask> _tasksCollection;
	private readonly IMongoCollection<PlantTrackingLog> _trackingLogsCollection;

	public GardenTaskController(IMongoDatabase database)
	{
		_tasksCollection = database.GetCollection<GardenTask>("GardenTasks");
		_trackingLogsCollection = database.GetCollection<PlantTrackingLog>("PlantTrackingLogs");
	}

	[Authorize]
	[HttpGet]
	public async Task<IActionResult> Get()
	{
		var tasks = await _tasksCollection.Find(_ => true).ToListAsync();
		return Ok(tasks);
	}

	[Authorize]
	[HttpPost]
	public async Task<IActionResult> Create(GardenTask task)
	{
		await _tasksCollection.InsertOneAsync(task);
		return CreatedAtAction(nameof(Get), new { id = task.Id }, task);
	}

	[Authorize]
	[HttpPut("{id}")]
	public async Task<IActionResult> Update(string id, GardenTask task)
	{
		var existingTask = await _tasksCollection.Find(t => t.Id == id).FirstOrDefaultAsync();
		if (existingTask == null) return NotFound();

		var isTaskCompletion = !existingTask.IsCompleted && task.IsCompleted;

		var result = await _tasksCollection.ReplaceOneAsync(t => t.Id == id, task);
		if (result.MatchedCount == 0)
		{
			return NotFound();
		}

		if (!isTaskCompletion) return Ok(task);
		var trackingLog = new PlantTrackingLog
		{
			PlantId = task.PlantId,
			EventDate = DateTime.UtcNow,
			EventType = task.TaskType,
			Notes = task.Notes
		};

		await _trackingLogsCollection.InsertOneAsync(trackingLog);

		return Ok(task);
	}

	[Authorize]
	[HttpDelete("{id}")]
	public async Task<IActionResult> Delete(string id)
	{
		var result = await _tasksCollection.DeleteOneAsync(t => t.Id == id);
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
		var task = await _tasksCollection.Find(t => t.Id == id).FirstOrDefaultAsync();
		if (task == null)
		{
			return NotFound();
		}
		return Ok(task);
	}

	[Authorize]
	[HttpGet("by-user/{userId}")]
	public async Task<IActionResult> GetByUserId(string userId)
	{
		var tasks = await _tasksCollection.Find(t => t.UserId == userId).ToListAsync();
		return Ok(tasks);
	}
}