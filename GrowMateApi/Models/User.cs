public class User
{
	public string Id { get; set; }
	public string Username { get; set; }
	public string Email { get; set; }
	public string PasswordHash { get; set; }
	public string Role { get; set; }
	public string? PasswordResetToken { get; set; } = null;
	public DateTime? ResetTokenExpiration { get; set; } = null;
}