using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace GrowMateApi.Services
{
	public class WeatherUpdateService : BackgroundService
	{
		private readonly IHttpClientFactory _httpClientFactory;
		private readonly ILogger<WeatherUpdateService> _logger;

		private static readonly HashSet<string> FrequentlyRequestedLocations = new()
		{
			"Krakow"
		};

		public WeatherUpdateService(IHttpClientFactory httpClientFactory, ILogger<WeatherUpdateService> logger)
		{
			_httpClientFactory = httpClientFactory;
			_logger = logger;
		}

		protected override async Task ExecuteAsync(CancellationToken stoppingToken)
		{
			while (!stoppingToken.IsCancellationRequested)
			{
				try
				{
					var client = _httpClientFactory.CreateClient(nameof(WeatherApiService));
					foreach (var location in FrequentlyRequestedLocations)
					{
						_logger.LogInformation($"Refreshing weather for {location}");

						var response = await client.GetAsync($"weather?location={location}", stoppingToken);
						if (!response.IsSuccessStatusCode)
						{
							_logger.LogWarning($"Failed to fetch weather data for {location}. Status: {response.StatusCode}");
						}
					}
				}
				catch (Exception ex)
				{
					_logger.LogError(ex, "Error refreshing weather data");
				}

				await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
			}
		}
	}
}
