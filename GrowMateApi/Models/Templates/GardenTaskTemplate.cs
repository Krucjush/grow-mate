namespace GrowMateApi.Models.Templates
{
	public class GardenTaskTemplate
	{
		public string TaskName { get; set; }
		public string TaskType { get; set; }
		public TimeSpan? RecurrenceInterval { get; set; }
		public string? Notes { get; set; }
	}
}