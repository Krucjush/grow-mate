public class PlantKnowledgeBase
{
	public string Id { get; set; }
	public string Name { get; set; }
	public string Species { get; set; }
	public string Description { get; set; }
	public string SoilRequirements { get; set; }
	public string LightRequirements { get; set; }
	public TimeSpan WateringInterval { get; set; }
	public string WateringIntensity { get; set; }
	public PlantingSeason TypicalPlantingSeason { get; set; }
	public string? ImageUrl { get; set; }
}