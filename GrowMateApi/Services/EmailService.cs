using System.Net;
using System.Net.Mail;
using GrowMateApi.Interfaces;
using GrowMateApi.Models;
using Microsoft.Extensions.Options;

namespace GrowMateApi.Services
{
	public class EmailService : IEmailService
	{
		private readonly EmailSettings _emailSettings;

		public EmailService(IOptions<EmailSettings> emailSettings)
		{
			_emailSettings =  emailSettings.Value;
		}

		public async Task SendEmailAsync(string toEmail, string subject, string message)
		{
			var client = new SmtpClient(_emailSettings.SmtpServer, _emailSettings.Port)
			{
				Credentials = new NetworkCredential(_emailSettings.Username, _emailSettings.Password),
				EnableSsl = true
			};

			await client.SendMailAsync(new MailMessage(_emailSettings.SenderEmail, toEmail, subject, message));
		}
	}
}
