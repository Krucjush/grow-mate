using GrowMateApi.Models.Templates;

namespace GrowMateApi.Interfaces
{
	public interface IGardenTemplateService
	{
		IEnumerable<GardenTemplate> GetAllTemplates();
		GardenTemplate GetTemplateById(string id);
	}
}
