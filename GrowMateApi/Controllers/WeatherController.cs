using GrowMateApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace GrowMateApi.Controllers
{
	[ApiController]
	[Route("api/weather")]
	public class WeatherController : ControllerBase
	{
		private readonly WeatherApiService _weatherApiService;

		public WeatherController(WeatherApiService weatherApiService)
		{
			_weatherApiService = weatherApiService;
		}

		[HttpGet("{location}")]
		public async Task<IActionResult> GetWeather(string location)
		{
			try
			{
				var weatherData = await _weatherApiService.GetWeatherAsync(location);
				return Ok(weatherData);
			}
			catch (Exception ex)
			{
				return BadRequest(ex.Message);
			}
		}
	}
}
