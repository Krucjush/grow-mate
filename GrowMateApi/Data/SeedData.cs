using MongoDB.Driver;

public static class SeedData
{
	public static async Task Initialize(IMongoDatabase database)
	{
		var usersCollection = database.GetCollection<User>("Users");
		var gardensCollection = database.GetCollection<Garden>("Gardens");
		var plantsCollection = database.GetCollection<Plant>("Plants");
		var gardenTasksCollection = database.GetCollection<GardenTask>("GardenTasks");
		var plantKnowledgeBaseCollection = database.GetCollection<PlantKnowledgeBase>("PlantKnowledgeBase");

		var adminExists = usersCollection.Find(u => u.Role == "Admin").FirstOrDefault();

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

		if (await usersCollection.CountDocumentsAsync(_ => true) == 0)
		{
			await usersCollection.InsertManyAsync(new[]
			{
				new User
				{
					Id = "1", Username = "user1", Email = "user1@example.com", PasswordHash = "hashedpassword1"
				},
				new User { Id = "2", Username = "user2", Email = "user2@example.com", PasswordHash = "hashedpassword2" }
			});
		}

		if (await plantKnowledgeBaseCollection.CountDocumentsAsync(_ => true) == 0)
		{
			await plantKnowledgeBaseCollection.InsertManyAsync(new[]
			{
				new PlantKnowledgeBase
				{
					Id = "1",
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
					Id = "2",
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

		if (await gardensCollection.CountDocumentsAsync(_ => true) == 0)
		{
			await gardensCollection.InsertManyAsync(new[]
			{
				new Garden
				{
					Id = "1",
					UserId = "1",
					Name = "User1's Garden",
					Location = "New York City",
					Soil = new SoilParameters { Type = "Loamy", pHLevel = "6.5", MoistureLevel = "Medium" },
					Plants = new List<Plant>
					{
						new()
						{
							Id = "1",
							KnowledgeBaseId = "1",
							LastWatered = DateTime.UtcNow.AddDays(-1),
							DatePlanted = new DateTime(2023, 5, 1)
						},
						new()
						{
							Id = "2",
							KnowledgeBaseId = "2",
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
					Id = "1",
					UserId = "1",
					TaskName = "Water Buttercups",
					PlantId = "1",
					ScheduledTime = DateTime.UtcNow.AddHours(8),
					IsCompleted = false
				},
				new GardenTask
				{
					Id = "2",
					UserId = "1",
					TaskName = "Water Rose",
					PlantId = "2",
					ScheduledTime = DateTime.UtcNow.AddDays(2),
					IsCompleted = false
				}
			});
		}
	}
}
