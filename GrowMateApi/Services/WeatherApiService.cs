using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;
using GrowMateApi.Models;

namespace GrowMateApi.Services
{
	public class WeatherApiService
	{
		private readonly HttpClient _httpClient;
		private readonly IMemoryCache _cache;
		private readonly string _apiKey;
		private const int CacheDurationMinutes = 30;

		public WeatherApiService(HttpClient httpClient, IMemoryCache cache, IConfiguration configuration)
		{
			_httpClient = httpClient;
			_cache = cache;
			_apiKey = configuration["WeatherApi:ApiKey"];

			if (string.IsNullOrEmpty(_apiKey))
			{
				throw new Exception("API key is missing in the configuration.");
			}
		}

		public async Task<DayWeatherData> GetWeatherAsync(string location)
		{
			if (_cache.TryGetValue($"Weather_{location}", out DayWeatherData cachedData))
			{
				return cachedData;
			}

			var apiUrl =
				$"https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/{location}/today?key={_apiKey}";

			var response = await _httpClient.GetAsync(apiUrl);
			if (!response.IsSuccessStatusCode)
			{
				throw new Exception($"Failed to fetch weather data: {response.StatusCode}");
			}

			var jsonResponse = await response.Content.ReadAsStringAsync();

			var weatherResponse = JsonSerializer.Deserialize<WeatherResponse>(jsonResponse);

			var currentDayWeather = weatherResponse?.Days?.FirstOrDefault();

			if (currentDayWeather == null)
			{
				throw new Exception("Weather data not found.");
			}

			_cache.Set($"Weather_{location}", currentDayWeather, TimeSpan.FromMinutes(CacheDurationMinutes));

			return currentDayWeather;
		}
	}
}
