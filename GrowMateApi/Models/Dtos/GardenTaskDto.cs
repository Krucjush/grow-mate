namespace GrowMateApi.Models.Dtos
{
	public class GardenTaskDto
	{
		public string UserId { get; set; }
		public string TaskName { get; set; }
		public string PlantId { get; set; }
		public string TaskType { get; set; }
		public string RecurrenceInterval { get; set; }
		public string? Notes { get; set; }
		public bool IsCompleted { get; set; }
	}
}
