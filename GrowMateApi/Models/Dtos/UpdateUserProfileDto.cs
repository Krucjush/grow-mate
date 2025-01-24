namespace GrowMateApi.Models.Dtos
{
	public class UpdateUserProfileDto
	{
		public string? UserId { get; set; }
		public string? Username { get; set; }
		public string? CurrentPassword { get; set; }
		public string? NewPassword { get; set; }
	}
}
