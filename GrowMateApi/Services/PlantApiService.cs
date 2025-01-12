using System.Text.Json;
using GrowMateApi.Models;
using GrowMateApi.Services.Settings;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace GrowMateApi.Services
{
	public class PlantApiService
	{
		private readonly HttpClient _httpClient;
		private readonly IMemoryCache _cache;
		private readonly PlantApiSettings _apiSettings;

		public PlantApiService(HttpClient httpClient, IMemoryCache cache, IOptions<PlantApiSettings> apiSettings)
		{
			_httpClient = httpClient;
			_cache = cache;
			_apiSettings = apiSettings.Value;
		}

		public async Task<PlantData> GetPlantDataAsync(int plantId)
		{
			if (_cache.TryGetValue($"Plant_{plantId}", out PlantData cachedData))
			{
				return cachedData;
			}

			var apiUrl = $"{_apiSettings.BaseUrl}?key={_apiSettings.ApiKey}";
			var response = await _httpClient.GetAsync(apiUrl);

			if (!response.IsSuccessStatusCode)
			{
				throw new Exception($"Failed to fetch plant data: {response.StatusCode}");
			}

			var jsonResponse = await response.Content.ReadAsStringAsync();

			var options = new JsonSerializerOptions
			{
				PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
				PropertyNameCaseInsensitive = true
			};
			var apiResponse = JsonSerializer.Deserialize<ApiResponse>(jsonResponse, options);

			var plantData = apiResponse?.Data?.FirstOrDefault(p => p.Id == plantId);

			if (plantData == null)
			{
				throw new Exception($"Plant with ID {plantId} not found in the API response.");
			}

			_cache.Set($"Plant_{plantId}", plantData, TimeSpan.FromDays(1));

			return plantData;
		}
	}
}
