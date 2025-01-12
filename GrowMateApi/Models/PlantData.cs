using System.Text.Json.Serialization;

namespace GrowMateApi.Models
{
	public class PlantData
	{
		public int Id { get; set; }

		[JsonPropertyName("common_name")]
		public string CommonName { get; set; }

		[JsonPropertyName("scientific_name")]
		public List<string> ScientificName { get; set; }

		[JsonPropertyName("other_name")]
		public List<string> OtherName { get; set; }

		[JsonPropertyName("cycle")]
		public string Cycle { get; set; }

		[JsonPropertyName("watering")]
		public string Watering { get; set; }

		[JsonPropertyName("sunlight")]
		public List<string> Sunlight { get; set; }

		[JsonPropertyName("default_image")]
		public PlantImage DefaultImage { get; set; }
	}
}
