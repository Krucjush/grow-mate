using System.Text.Json.Serialization;

namespace GrowMateApi.Models
{
	public class WeatherResponse
	{
		[JsonPropertyName("queryCost")]
		public int QueryCost { get; set; }

		[JsonPropertyName("latitude")]
		public double Latitude { get; set; }

		[JsonPropertyName("longitude")]
		public double Longitude { get; set; }

		[JsonPropertyName("resolvedAddress")]
		public string ResolvedAddress { get; set; }

		[JsonPropertyName("days")]
		public List<DayWeatherData> Days { get; set; }
	}
}
