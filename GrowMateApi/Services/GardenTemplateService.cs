using GrowMateApi.Data;
using GrowMateApi.Interfaces;
using GrowMateApi.Models.Templates;

namespace GrowMateApi.Services
{
	public class GardenTemplateService : IGardenTemplateService
	{
		private readonly List<GardenTemplate> _templates;

		public GardenTemplateService()
		{
			_templates = SampleGardenTemplates.GetSampleTemplates();
		}

		public IEnumerable<GardenTemplate> GetAllTemplates()
		{
			return _templates;
		}

		public GardenTemplate GetTemplateById(string id)
		{
			return _templates.FirstOrDefault(t => t.Id == id)!;
		}
	}
}
