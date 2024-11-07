using GrowMateApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace GrowMateApi.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class NotificationsController : ControllerBase
	{
		private readonly IMongoCollection<Notification> _notificationsCollection;

		public NotificationsController(IMongoDatabase database)
		{
			_notificationsCollection = database.GetCollection<Notification>("Notifications");
		}

		[Authorize]
		[HttpGet("{userId}")]
		public async Task<IActionResult> GetNotifications(string userId)
		{
			var notifications = await _notificationsCollection.Find(n => n.UserId == userId).ToListAsync();
			return Ok(notifications);
		}

		[Authorize]
		[HttpPost]
		public async Task<IActionResult> CreateNotification(Notification notification)
		{
			await _notificationsCollection.InsertOneAsync(notification);
			return CreatedAtAction(nameof(CreateNotification), new { id = notification.Id }, notification);
		}

		[Authorize]
		[HttpPut("{id}")]
		public async Task<IActionResult> MarkAsRead(string id)
		{
			var update = Builders<Notification>.Update.Set(n => n.IsRead, true);
			var result = await _notificationsCollection.UpdateOneAsync(n => n.Id == id, update);

			if (result.MatchedCount == 0)
			{
				return NotFound();
			}
			return NoContent();
		}
	}
}
