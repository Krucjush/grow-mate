namespace GrowMateApi.Services
{
	public class WeatherUpdateService : BackgroundService
	{
		private readonly WeatherApiService _weatherApiService;
		private readonly ILogger<WeatherUpdateService> _logger;

		private static readonly HashSet<string> FrequentlyRequestedLocations = new()
		{
			"New York",
			"London",
			"Tokyo"
		};

		public WeatherUpdateService(WeatherApiService weatherApiService, ILogger<WeatherUpdateService> logger)
		{
			_weatherApiService = weatherApiService;
			_logger = logger;
		}

		protected override async Task ExecuteAsync(CancellationToken stoppingToken)
		{
			while (!stoppingToken.IsCancellationRequested)
			{
				try
				{
					foreach (var location in FrequentlyRequestedLocations)
					{
						_logger.LogInformation($"Refreshing weather for {location}");
						await _weatherApiService.GetWeatherAsync(location);
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
