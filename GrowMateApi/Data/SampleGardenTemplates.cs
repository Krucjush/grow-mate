using GrowMateApi.Models.Templates;

namespace GrowMateApi.Data
{
	public class SampleGardenTemplates
	{
		public static List<GardenTemplate> GetSampleTemplates()
		{
			return new List<GardenTemplate>
			{
				new()
				{
					Id = "1",
					Name = "Vegetable Garden",
					Description = "A small garden to grow various vegetables.",
					Plants = new List<PlantTemplate>
					{
						new() { PlantId = "1", Name = "Tomato", CareInstructions = "Water daily" },
						new() { PlantId = "2", Name = "Lettuce", CareInstructions = "Water every other day" },
						new() { PlantId = "3", Name = "Carrot", CareInstructions = "Needs full sun" }
					},
					Layout = new List<string> { "Row 1: Tomato", "Row 2: Lettuce", "Row 3: Carrot" },
					CreatedAt = DateTime.UtcNow
				},
				new()
				{
					Id = "2",
					Name = "Flower Garden",
					Description = "A beautiful flower garden with various blooms.",
					Plants = new List<PlantTemplate>
					{
						new() { PlantId = "4", Name = "Rose", CareInstructions = "Water twice a week" },
						new() { PlantId = "5", Name = "Tulip", CareInstructions = "Plant in spring" }
					},
					Layout = new List<string> { "Row 1: Rose", "Row 2: Tulip" },
					CreatedAt = DateTime.UtcNow
				}
			};
		}
	}
}
