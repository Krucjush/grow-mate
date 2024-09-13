using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

[Route("api/[controller]")]
[ApiController]
public class PlantsController : ControllerBase
{
	private readonly IMongoCollection<Plant> _plantsCollection;

	public PlantsController(IMongoClient mongoClient)
	{
		var database = mongoClient.GetDatabase("GrowMateDB");
		_plantsCollection = database.GetCollection<Plant>("Plants");
	}

	[HttpGet]
	public async Task<IActionResult> Get()
	{
		var plants = await _plantsCollection.Find(_ => true).ToListAsync();
		return Ok(plants);
	}
	[HttpPost]
	public async Task<IActionResult> Create(Plant plant)
	{
		await _plantsCollection.InsertOneAsync(plant);
		return CreatedAtAction(nameof(Get), new { id = plant.Id }, plant);
	}
}