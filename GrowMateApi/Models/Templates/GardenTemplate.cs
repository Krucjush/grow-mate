﻿namespace GrowMateApi.Models.Templates
{
	public class GardenTemplate
	{
		public string Id { get; set; }
		public string Name { get; set; }
		public List<PlantTemplate> Plants { get; set; }
		public string Description { get; set; }
		public List<string> Layout { get; set; }
		public DateTime CreatedAt { get; set; }
	}

}
