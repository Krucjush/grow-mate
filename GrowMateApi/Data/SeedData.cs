using GrowMateApi.Models;
using GrowMateApi.Models.Enums;
using MongoDB.Driver;
using MongoDB.Bson;

public static class SeedData
{
	public static async Task Initialize(IMongoDatabase database)
	{
		var usersCollection = database.GetCollection<User>("Users");
		var gardensCollection = database.GetCollection<Garden>("Gardens");
		var plantsCollection = database.GetCollection<Plant>("Plants");
		var gardenTasksCollection = database.GetCollection<GardenTask>("GardenTasks");

		// Ensure that admin user exists
		var adminExists = await usersCollection.Find(u => u.Role == "Admin").FirstOrDefaultAsync();
		if (adminExists == null)
		{
			var adminUser = new User
			{
				Username = "admin",
				Email = "admin@example.com",
				PasswordHash = BCrypt.Net.BCrypt.HashPassword("AdminPassword123!"),
				Role = "Admin"
			};
			await usersCollection.InsertOneAsync(adminUser);
		}

		// Ensure there are users in the database
		if (await usersCollection.CountDocumentsAsync(_ => true) == 0)
		{
			await usersCollection.InsertManyAsync(new[]
			{
				new User
				{
					Id = ObjectId.GenerateNewId().ToString(),
					Username = "user1",
					Email = "user1@example.com",
					PasswordHash = BCrypt.Net.BCrypt.HashPassword("user1Password")
				},
				new User
				{
					Id = ObjectId.GenerateNewId().ToString(),
					Username = "user2",
					Email = "user2@example.com",
					PasswordHash = BCrypt.Net.BCrypt.HashPassword("user2Password")
				}
			});
		}

		// Ensure there are gardens in the database
		if (await gardensCollection.CountDocumentsAsync(_ => true) == 0)
		{
			await gardensCollection.InsertManyAsync(new[]
			{
				new Garden
				{
					Id = ObjectId.GenerateNewId().ToString(),
					UserId = "1",
                    Name = "User1's Garden",
					Location = "New York City",
					Soil = new SoilParameters { Type = "Loamy", pHLevel = "6.5", MoistureLevel = "Medium" },
					Plants = new List<Plant>
					{
						new Plant
						{
							Id = ObjectId.GenerateNewId().ToString(),
							ApiPlantId = 1,
                            LastWatered = DateTime.UtcNow.AddDays(-1),
							DatePlanted = new DateTime(2023, 5, 1)
						},
						new Plant
						{
							Id = ObjectId.GenerateNewId().ToString(),
							ApiPlantId = 2,
                            LastWatered = DateTime.UtcNow.AddDays(-2),
							DatePlanted = new DateTime(2023, 4, 15)
						}
					}
				}
			});
		}

		if (await gardenTasksCollection.CountDocumentsAsync(_ => true) == 0)
		{
			await gardenTasksCollection.InsertManyAsync(new[]
			{
				new GardenTask
				{
					Id = ObjectId.GenerateNewId().ToString(),
					UserId = "1",
                    TaskName = "Water Buttercups",
					PlantId = 1,
                    ScheduledTime = DateTime.UtcNow.AddHours(8),
					IsCompleted = false
				},
				new GardenTask
				{
					Id = ObjectId.GenerateNewId().ToString(),
					UserId = "1",
					TaskName = "Water Rose",
					PlantId = 2,
                    ScheduledTime = DateTime.UtcNow.AddDays(2),
					IsCompleted = false
				}
			});
		}
	}
}