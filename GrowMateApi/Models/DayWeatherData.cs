using System.Text.Json.Serialization;

namespace GrowMateApi.Models
{
	public class DayWeatherData
	{
		[JsonPropertyName("datetime")]
		public string DateTime { get; set; }

		[JsonPropertyName("tempmax")]
		public double TempMax { get; set; }

		[JsonPropertyName("tempmin")]
		public double TempMin { get; set; }

		[JsonPropertyName("temp")]
		public double Temp { get; set; }

		[JsonPropertyName("humidity")]
		public double Humidity { get; set; }

		[JsonPropertyName("windspeed")]
		public double WindSpeed { get; set; }

		[JsonPropertyName("conditions")]
		public string Conditions { get; set; }

		[JsonPropertyName("preciptype")]
		public List<string> PrecipType { get; set; }

		[JsonPropertyName("description")]
		public string Description { get; set; }
	}
}
