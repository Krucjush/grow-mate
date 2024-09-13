public class Garden
{
	public string Id { get; set; }
	public string UserId { get; set; }
	public string Name { get; set; }
	public List<Plant> Plants { get; set; }
	public string Location { get; set; }
	public SoilParameters Soil { get; set; }
}