﻿public class GardenTask
{
	public string Id { get; set; }
	public string UserId { get; set; }
	public string TaskName { get; set; }
	public string PlantId { get; set; }
	public DateTime ScheduledTime { get; set; }
	public bool IsCompleted { get; set; }
}