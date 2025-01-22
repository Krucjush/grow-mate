using GrowMateApi.Interfaces;
using GrowMateApi.Models.Templates;
using Microsoft.AspNetCore.Mvc;

namespace GrowMateApi.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class GardenTemplateController : ControllerBase
	{
		private readonly IGardenTemplateService _gardenTemplateService;

		public GardenTemplateController(IGardenTemplateService gardenTemplateService)
		{
			_gardenTemplateService = gardenTemplateService;
		}

		[HttpGet]
		public ActionResult<IEnumerable<GardenTemplate>> GetAllTemplates()
		{
			var templates = _gardenTemplateService.GetAllTemplates();
			return Ok(templates);
		}

		[HttpGet("{id}")]
		public ActionResult<GardenTemplate> GetTemplateById(string id)
		{
			var template = _gardenTemplateService.GetTemplateById(id);

			return Ok(template);
		}
	}

}
