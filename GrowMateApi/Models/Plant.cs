namespace GrowMateApi.Models;

public class Plant
{
	public string Id { get; set; }
	public string Name { get; set; }
	public string ApiPlantId { get; set; }
	public DateTime LastWatered { get; set; }
	public DateTime DatePlanted { get; set; }
	public List<PlantGrowthRecord> GrowthRecords { get; set; } = new();
}