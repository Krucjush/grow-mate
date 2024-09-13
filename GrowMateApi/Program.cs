
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace GrowMateApi
{
	public class Program
	{
		public static void Main(string[] args)
		{
			var builder = WebApplication.CreateBuilder(args);

			// Add services to the container.
			builder.Services.Configure<DatabaseSettings>(builder.Configuration.GetSection("DatabaseSettings"));

			builder.Services.AddSingleton<IMongoClient, MongoClient>(sp =>
			{
				var settings = sp.GetRequiredService<IOptions<DatabaseSettings>>().Value; 
				return new MongoClient(settings.ConnectionString);
			});

			builder.Services.AddSingleton<IMongoDatabase>(sp =>
			{
				var settings = sp.GetRequiredService<IOptions<DatabaseSettings>>().Value;
				var mongoClient = sp.GetRequiredService<IMongoClient>();
				return mongoClient.GetDatabase(settings.DatabaseName);
			});

			builder.Services.AddControllers();
			// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
			builder.Services.AddEndpointsApiExplorer();
			builder.Services.AddSwaggerGen();

			var app = builder.Build();

			using (var scope = app.Services.CreateScope())
			{
				var database = scope.ServiceProvider.GetRequiredService<IMongoDatabase>();
				SeedData.Initialize(database).Wait();
			}

			// Configure the HTTP request pipeline.
			if (app.Environment.IsDevelopment())
			{
				app.UseSwagger();
				app.UseSwaggerUI();
			}

			app.UseHttpsRedirection();

			app.UseAuthorization();


			app.MapControllers();

			app.Run();
		}
	}
}