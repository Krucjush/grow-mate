using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace GrowMateApi.Models
{
	public class PlantTrackingLog
	{
		[BsonId]
		[BsonRepresentation(BsonType.ObjectId)]
		public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
		public string PlantId { get; set; }
		public DateTime EventDate { get; set; }
		public string EventType { get; set; }
		public string? Notes { get; set; }
		public string? PhotoUrl { get; set; }
	}
}
