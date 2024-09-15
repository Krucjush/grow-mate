using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;

namespace GrowMateApi
{
	public class Program
	{
		public static void Main(string[] args)
		{
			var builder = WebApplication.CreateBuilder(args);

			builder.Services.AddCors(option =>
			{
				option.AddPolicy("AllowAllOrigins",
					policy =>
					{
						policy.AllowAnyOrigin()
							.AllowAnyHeader()
							.AllowAnyMethod();
					});
			});


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

			builder.Services.AddAuthentication(options =>
			{
				options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
				options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
			})
			.AddJwtBearer(options =>
			{
				options.TokenValidationParameters = new TokenValidationParameters
				{
					ValidateIssuerSigningKey = true,
					IssuerSigningKey =
						new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"]!)),
					ValidateIssuer = false,
					ValidateAudience = false
				};
			});

			// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
			builder.Services.AddEndpointsApiExplorer();
			builder.Services.AddSwaggerGen(c =>
			{
				c.SwaggerDoc("v1", new OpenApiInfo { Title = "GrowMate API", Version = "v1"});
				c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
				{
					Name = "Authorization",
					Type = SecuritySchemeType.Http,
					Scheme = "bearer",
					BearerFormat = "JWT",
					In = ParameterLocation.Header,
					Description = "Paste your JWT token below.",
				});
				c.AddSecurityRequirement(new OpenApiSecurityRequirement
				{
					{
						new OpenApiSecurityScheme
						{
							Reference = new OpenApiReference
							{
								Type = ReferenceType.SecurityScheme,
								Id = "Bearer"
							}
						},
						Array.Empty<string>()
					}
				});
			});

			var app = builder.Build();

			// Configure the HTTP request pipeline.
			if (app.Environment.IsDevelopment())
			{
				app.UseSwagger();
				app.UseSwaggerUI(c =>
				{
					c.SwaggerEndpoint("/swagger/v1/swagger.json", "GrowMate API v1");
				});
			}

			app.UseHttpsRedirection();

			app.UseCors("AllowAllOrigins");

			app.UseAuthentication();
			app.UseAuthorization();


			app.MapControllers();

			app.Run();
		}
	}
}