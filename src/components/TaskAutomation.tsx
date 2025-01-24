import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the structure of a Garden Task
interface GardenTask {
  id?: string; // `id` can be optional when creating a new task
  userId: string;
  taskName: string;
  plantId: string;
  scheduledTime: string;
  isCompleted: boolean;
  taskType: string;
  recurrenceInterval?: string,
  notes?: string;
}

const apiUrl = process.env.EXPO_PUBLIC_API;

// Function to add a task to the API
export const addTask = async (task: GardenTask): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem("jwtToken");

    const response = await fetch(`${apiUrl}/api/GardenTask`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      console.error("Failed to create task:", await response.text());
      return false;
    }

    console.log("Task created successfully");
    return true;
  } catch (error) {
    console.error("Error creating task:", error);
    return false;
  }
};

// Function to schedule a weekly harvesting task for a specific plant
export const scheduleWeeklyHarvestingTask = async (
  id:"",
  userId: string,
  plantId: string
): Promise<void> => {
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7); // Set the date for one week from now

  const weeklyTask: GardenTask = {
    id,
    userId,
    taskName: "Weekly Harvesting",
    plantId,
    scheduledTime: nextWeek.toISOString(),
    isCompleted: false,
    taskType: "Harvesting",
    recurrenceInterval: "01:30:00", // One week in ticks (7 days * 24 hours * 60 minutes * 60 seconds * 10 million ticks per second)
    notes: "All you had to do was to harvest the damn plant CJ.",
  };

  const success = await addTask(weeklyTask);

  if (success) {
    console.log(`Weekly harvesting task scheduled for plant ${plantId}.`);
  } else {
   
    console.error("Failed to schedule weekly harvesting task.");
  }
};

// Function to handle other types of task automation in the future
export const automateTasks = async (userId: string, plants: string[]): Promise<void> => {
  for (const plantId of plants) {
    // Example: Schedule weekly harvesting for each plant
    await scheduleWeeklyHarvestingTask(userId, plantId);
  }
};
