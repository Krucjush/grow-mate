using GrowMateApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace GrowMateApi.Controllers
{
	[Route("api/[controller]")]
	public class PlantTrackingLogsController : ControllerBase
	{
		private readonly IMongoCollection<PlantTrackingLog> _trackingLogsCollection;
		public PlantTrackingLogsController(IMongoDatabase database)
		{
			_trackingLogsCollection = database.GetCollection<PlantTrackingLog>("PlantTrackingLogs");
		}

		[Authorize]
		[HttpGet("by-plant/{plantId}")]
		public async Task<IActionResult> GetByPlantId(string plantId)
		{
			var logs = await _trackingLogsCollection.Find(log => log.PlantId == plantId).ToListAsync();
			return Ok(logs);
		}

		[Authorize]
		[HttpPost]
		public async Task<IActionResult> Create([FromBody] PlantTrackingLog log)
		{
			await _trackingLogsCollection.InsertOneAsync(log);
			return CreatedAtAction(nameof(GetByPlantId), new { plantId = log.PlantId }, log);
		}

		[Authorize]
		[HttpPut("{id}")]
		public async Task<IActionResult> Update(string id, [FromBody] PlantTrackingLog log)
		{
			log.Id = id;

			var result = await _trackingLogsCollection.ReplaceOneAsync(l => l.Id == id, log);
			if (result.MatchedCount == 0)
			{
				return NotFound();
			}
			return Ok(log);
		}

		[Authorize]
		[HttpDelete("{id}")]
		public async Task<IActionResult> Delete(string id)
		{
			var result = await _trackingLogsCollection.DeleteOneAsync(log => log.Id == id);
			if (result.DeletedCount == 0)
			{
				return NotFound();
			}

			return NoContent();
		}
	}
}
