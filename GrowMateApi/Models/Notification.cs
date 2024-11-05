namespace GrowMateApi.Models
{
	public class Notification
	{
		public string Id { get; set; }
		public string UserId { get; set; }
		public string Message { get; set; }
		public bool IsRead { get; set; }
		public DateTime ScheduledTime { get; set; }
	}
}
