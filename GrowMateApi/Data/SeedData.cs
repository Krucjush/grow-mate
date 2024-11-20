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
		var plantKnowledgeBaseCollection = database.GetCollection<PlantKnowledgeBase>("PlantKnowledgeBase");

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

		// Ensure plant knowledge base is populated
		if (await plantKnowledgeBaseCollection.CountDocumentsAsync(_ => true) == 0)
		{
			await plantKnowledgeBaseCollection.InsertManyAsync(new[]
			{
				new PlantKnowledgeBase
				{
					Id = ObjectId.GenerateNewId().ToString(),
					Name = "Buttercup",
					Species = "Ranunculus",
					Description = "Bright yellow flowers.",
					SoilRequirements = "Well-drained soil.",
					LightRequirements = "Full sun.",
					WateringInterval = TimeSpan.FromHours(8),
					WateringIntensity = "Medium",
					TypicalPlantingSeason = PlantingSeason.Spring
				},
				new PlantKnowledgeBase
				{
					Id = ObjectId.GenerateNewId().ToString(),
					Name = "Rose",
					Species = "Rosa",
					Description = "Various colors and fragrances.",
					SoilRequirements = "Loamy soil.",
					LightRequirements = "Full sun to partial shade.",
					WateringInterval = TimeSpan.FromDays(2),
					WateringIntensity = "High",
					TypicalPlantingSeason = PlantingSeason.Summer
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
					UserId = "1", // Make sure the UserId corresponds to an existing user.
                    Name = "User1's Garden",
					Location = "New York City",
					Soil = new SoilParameters { Type = "Loamy", pHLevel = "6.5", MoistureLevel = "Medium" },
					Plants = new List<Plant>
					{
						new Plant
						{
							Id = ObjectId.GenerateNewId().ToString(),
							KnowledgeBaseId = "1", // Make sure this corresponds to a valid knowledge base ID
                            LastWatered = DateTime.UtcNow.AddDays(-1),
							DatePlanted = new DateTime(2023, 5, 1)
						},
						new Plant
						{
							Id = ObjectId.GenerateNewId().ToString(),
							KnowledgeBaseId = "2", // Same here
                            LastWatered = DateTime.UtcNow.AddDays(-2),
							DatePlanted = new DateTime(2023, 4, 15)
						}
					}
				}
			});
		}

		// Ensure there are garden tasks in the database
		if (await gardenTasksCollection.CountDocumentsAsync(_ => true) == 0)
		{
			await gardenTasksCollection.InsertManyAsync(new[]
			{
				new GardenTask
				{
					Id = ObjectId.GenerateNewId().ToString(),
					UserId = "1", // Same note about UserId
                    TaskName = "Water Buttercups",
					PlantId = "1", // Make sure PlantId matches a valid plant
                    ScheduledTime = DateTime.UtcNow.AddHours(8),
					IsCompleted = false
				},
				new GardenTask
				{
					Id = ObjectId.GenerateNewId().ToString(),
					UserId = "1",
					TaskName = "Water Rose",
					PlantId = "2", // Ensure this also corresponds to a valid plant
                    ScheduledTime = DateTime.UtcNow.AddDays(2),
					IsCompleted = false
				}
			});
		}
	}
}