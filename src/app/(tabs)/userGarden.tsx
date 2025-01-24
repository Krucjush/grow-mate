import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Button,
  Alert,
  Dimensions,
  TextInput,
  Platform,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import DatePicker from "react-datepicker"; // For web
import "react-datepicker/dist/react-datepicker.css";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/components/AuthContext";
import { automateTasks } from "@/components/TaskAutomation";
import React from "react";
import { Feather, FontAwesome } from "@expo/vector-icons";

// Define the types for the data structure
interface UserGarden {
  id: string;
  userId: string;
  name: string;
  plants: UserPlant[];
  location: string;
  soil: Soil | null; // Allow soil to be null in case it's not available
}

interface Soil {
  type: string;
  pHLevel: string;
  moistureLevel: string;
}

interface UserPlant {
  id: string;
  name: string;
  apiPlantId: string;
  lastWatered: string; // ISO date format
  datePlanted: string; // ISO date format
  growthRecords: GrowthRecord[]; // List of growth records
}

interface GrowthRecord {
  recordDate: string; // ISO date format
  notes: string;
  photoUrl: string | null; // Optional photo URL
}
interface GardenTask {
  id: string;
  userId: string;
  taskName: string;
  plantId: string;
  taskType: string;
  scheduledTime: string;
  isCompleted: boolean;
  recurrenceInterval: number;
  notes: string;
}

const { width, height } = Dimensions.get("window");
const scale = width < 768 ? width / 375 : width / 1024;
// Main component
const UserGardenScreen: React.FC = () => {
  const { userId } = useAuth();
  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [scale, setScale] = useState<number>(1);
  const [userGarden, setUserGarden] = useState<UserGarden | null>(null);
  const [gardenTasks, setGardenTasks] = useState<GardenTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    id: "",
    userId: userId,
    taskName: "",
    plantId: "",
    scheduledTime: "",
    isCompleted: false,
    taskType: "",
    recurrenceInterval: "00:00:00",
    notes: "",
  });
  const route = useRoute();
  const params = route.params as { userId?: string } | undefined;

  const navigation = useNavigation();
  const apiUrl = process.env.EXPO_PUBLIC_API;
  const weatherApiUrl = process.env.EXPO_PUBLIC_API_WEATHER;

  const baseScale = Platform.OS === "web" ? 1 : width / 375;
  const Logo = require("@/assets/images/plant-image.png");
  const weatherIcons: { [key: string]: string } = {
    snow: "cloud-snow",
    rain: "cloud-rain",
    fog: "cloud",
    wind: "wind",
    cloudy: "cloud",
    "partly-cloudy-day": "cloud",
    "clear-day": "sun",
    thunder: "cloud-lightning",
    // dodaj więcej mapowań według potrzeb
  };

  const getFormattedDate = (date: Date) => {
    return date.toISOString().split("T")[0]; // Formatuj datę w formacie YYYY-MM-DD
  };

  const today = new Date();
  const twoDaysLater = new Date();
  twoDaysLater.setDate(today.getDate() + 2);

  const startDate = getFormattedDate(today);
  const endDate = getFormattedDate(twoDaysLater);
  console.log(startDate + "    " + endDate);
  const weatherApi = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/Krak%C3%B3w/${startDate}/${endDate}?unitGroup=metric&key=${weatherApiUrl}&include=current`;
  // Update with the correct path or URL
  // Fetch the garden data and tasks from the API or server
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", () => {
      const { width } = Dimensions.get("window");
      setScale(width / 375);
    });

    return () => subscription?.remove();
  }, []);
  useEffect(() => {
    const fetchGardenData = async () => {
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        const savedUserId = await AsyncStorage.getItem("userId"); // Ensure this key matches

        // Fetch garden data
        const gardenResponse = await fetch(
          `${apiUrl}/api/Gardens/by-user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const gardenData = await gardenResponse.json();

        if (gardenResponse.ok && gardenData.length > 0) {
          setUserGarden(gardenData[0]); // Access the first item in the array
        } else {
          setError("Failed to load garden data");
        }

        // Fetch garden tasks
        const tasksResponse = await fetch(
          `${apiUrl}/api/GardenTask/by-user/${savedUserId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const tasksData = await tasksResponse.json();
        console.log("Fetched tasks: ", tasksData); // Log the tasks

        if (tasksResponse.ok) {
          setGardenTasks(tasksData);
        } else {
          setError("Failed to load tasks data");
        }
      } catch (error) {
        setError("An error occurred while fetching the garden data");
      } finally {
        setLoading(false);
      }
    };

    fetchGardenData();
  }, [userId]);
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch(`${weatherApi}`);
        const data = await response.json();

        const formattedData = data.days.map((day: any) => ({
          datetime: day.datetime,
          temp: day.temp,
          conditions: day.conditions,
          humidity: day.humidity,
          icon: day.icon, // Replace later
        }));

        setWeatherData(formattedData);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch weather data 123");
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);
  useEffect(() => {
    const scheduleTasks = async () => {
      if (userGarden) {
        const plantIds = userGarden.plants.map((plant) => plant.id);
        console.log("task userid" + plantIds); // Get all plant IDs
        await automateTasks(userId, plantIds);
      }
    };

    scheduleTasks();
  }, [userGarden]);

  const WeatherCard = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.date}>{item.datetime}</Text>
      <Feather
        name={weatherIcons[item.icon] || "cloud"}
        size={24}
        color="#000"
        style={styles.icon}
      />
      <Text style={styles.temperature}>{item.temp}°C</Text>
      <Text style={styles.conditions}>{item.conditions}</Text>
      <Text style={styles.humidity}>Humidity: {item.humidity}%</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Function to mark a task as completed
  const markTaskAsCompleted = async (taskId: string) => {
    try {
      console.log(taskId);
      const token = await AsyncStorage.getItem("jwtToken");

      const response = await fetch(`${apiUrl}/api/GardenTask/${taskId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({ isCompleted: true }),
      });

      if (response.ok) {
        Alert.alert("Success", "Task marked as completed!");

        // Update the local task state
        setGardenTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, isCompleted: true } : task
          )
        );
      } else {
        Alert.alert("Error", "Failed to update task status.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while updating the task.");
    }
  };

  // Function to render each plant
  const renderPlant = ({ item }: { item: UserPlant }) => {
    const photoUrl =
      item.growthRecords.length > 0 ? item.growthRecords[0].photoUrl : null;

    return (
      <View style={styles.plantItem}>
        <Image
          source={{
            uri: photoUrl || "https://via.placeholder.com/150",
          }}
          style={styles.plantImage}
        />
        <View style={styles.plantDetails}>
          <Text style={styles.plantName}>{item.name}</Text>
          <Text style={styles.plantInfo}>
            Last Watered: {new Date(item.lastWatered).toLocaleDateString()}
          </Text>
          <Text style={styles.plantInfo}>
            Date Planted: {new Date(item.datePlanted).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.waterButton}
          onPress={() => handleWaterPlant(item.id)} // Funkcja podlewania
        >
          <FontAwesome name="tint" size={30} color="#4caf50" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePlant(item.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };
  const handleWaterPlant = async (plantId: string) => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");

      const response = await fetch(
        `${apiUrl}/api/gardens/${userId}/plants/${plantId}/water`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lastWatered: new Date().toISOString(), // Ustawienie bieżącej daty
          }),
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Plant watered successfully!");
        // Zaktualizowanie lokalnej rośliny
        setUserGarden((prevGarden) => {
          if (!prevGarden) return prevGarden;
          return {
            ...prevGarden,
            plants: prevGarden.plants.map((plant) =>
              plant.id === plantId
                ? { ...plant, lastWatered: new Date().toISOString() }
                : plant
            ),
          };
        });
      } else {
        Alert.alert("Error", "Failed to update watering time.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while watering the plant.");
    }
  };
  const handleDeletePlant = async (plantId: string) => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");

      const response = await fetch(
        `${apiUrl}/api/Gardens/${userId}/plants/${plantId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Plant removed successfully!");

        // Update local garden state
        setUserGarden((prevGarden) => {
          if (!prevGarden) return prevGarden;
          return {
            ...prevGarden,
            plants: prevGarden.plants.filter((plant) => plant.id !== plantId),
          };
        });
      } else {
        Alert.alert("Error", "Failed to remove the plant.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while removing the plant.");
    }
  };

  // Function to render each task
  const renderTask = ({ item }: { item: GardenTask }) => (
    <View style={styles.taskItem}>
      <Text style={styles.taskName}>{item.taskName}</Text>
      <Text>
        Scheduled Time: {new Date(item.scheduledTime).toLocaleString()}
      </Text>
      <Text>Completed: {item.isCompleted ? "Yes" : "No"}</Text>
      {!item.isCompleted && (
        <Button
          title="Mark as Completed"
          color="#FF0000"
          onPress={() => markTaskAsCompleted(item.id)}
        />
      )}
    </View>
  );
  const handleAddTask = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      console.log(newTask);
      const response = await fetch(`${apiUrl}/api/GardenTask`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id: "", // Generuj ID jeśli potrzebne
          userId: userId,
          taskName: newTask.taskName,
          plantId: newTask.plantId,
          scheduledTime: new Date(newTask.scheduledTime).toISOString(),
          isCompleted: newTask.isCompleted || false,
          taskType: newTask.taskType || "",
          recurrenceInterval: newTask.recurrenceInterval || "00:00:00",
          notes: newTask.notes,
        }),
      });

      if (response.ok) {
        const createdTask = await response.json();

        setGardenTasks((prevTasks) => [...prevTasks, createdTask]);
        Alert.alert("Success", "Task added successfully!");
        setNewTask({
          id: "",
          userId: userId,
          taskName: "",
          plantId: "",
          scheduledTime: "",
          isCompleted: false,
          taskType: "",
          recurrenceInterval: "00:00:00",
          notes: "",
        });
        setIsFormVisible((prev) => !prev);
      } else {
        Alert.alert("Error", "Failed to add the task.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while adding the task.");
    }
  };

  const showDatePicker = () => {
    if (Platform.OS === "web") {
      // For web, no need to toggle visibility
    } else {
      setDatePickerVisibility(true); // For mobile
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setNewTask((prev) => ({
        ...prev,
        scheduledTime: selectedDate.toISOString(),
      }));
    }
  };

  const handleWebDateChange = (date: Date) => {
    setNewTask((prev) => ({
      ...prev,
      scheduledTime: date,
    }));
  };

  // Render loading spinner
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Render error message
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Render the garden information and tasks
  return (
    <ImageBackground
      source={require("@/assets/images/image.png")} // Ścieżka do Twojego obrazu
      style={styles.backgroundImage}
    >
      <ScrollView style={styles.container}>
        <FlatList
          data={weatherData}
          renderItem={({ item }) => <WeatherCard item={item} />}
          keyExtractor={(item) => item.datetime}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
        {userGarden && (
          <View style={styles.gardenContainer}>
            <Text style={styles.gardenTitle}> {userGarden.name}</Text>
            <Text style={styles.gardenInfo}> {userGarden.location}</Text>

            {/* Ensure that soil exists before trying to display it */}
            {userGarden.soil ? (
              <>
                <Text style={styles.gardenInfo}>
                  Soil Type: {userGarden.soil.type}
                </Text>
                <Text style={styles.gardenInfo}>
                  Soil pH Level: {userGarden.soil.pHLevel}
                </Text>
                <Text style={styles.gardenInfo}>
                  Soil Moisture Level: {userGarden.soil.moistureLevel}
                </Text>
              </>
            ) : (
              <Text style={styles.gardenInfo}>
                Soil information not available
              </Text>
            )}

            <Text style={styles.sectionTitle}>Plants in the Garden</Text>
            <FlatList
              data={userGarden.plants}
              renderItem={renderPlant}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.plantList}
            />
            <TouchableOpacity
              style={styles.addButton} // Styl dla przycisku "Add Plant"
              onPress={() => navigation.navigate("PlantsScreen")}
            >
              <Text style={styles.buttonText}>Add Plant</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Garden Tasks</Text>
            <FlatList
              data={gardenTasks}
              renderItem={renderTask}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.taskList}
            />
          </View>
        )}
        {userGarden && (
          <View style={styles.gardenContainer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsFormVisible((prev) => !prev)}
            >
              <Text style={styles.toggleButtonText}>
                {isFormVisible ? "▼ Add New Task" : "► Add New Task"}
              </Text>
            </TouchableOpacity>

            {isFormVisible && (
              <View style={styles.formContainer}>
                <Text style={styles.label}>Task Name</Text>
                <TextInput
                  style={styles.input}
                  value={newTask.taskName}
                  onChangeText={(text) =>
                    setNewTask((prev) => ({ ...prev, taskName: text }))
                  }
                  placeholder="Enter task name"
                />

                <Text style={styles.label}>Plant ID</Text>
                <TextInput
                  style={styles.input}
                  value={newTask.plantId}
                  onChangeText={(text) =>
                    setNewTask((prev) => ({ ...prev, plantId: text }))
                  }
                  placeholder="Enter plant ID"
                />

                <Text style={styles.label}>Task Type</Text>
                <TextInput
                  style={styles.input}
                  value={newTask.taskType}
                  onChangeText={(text) =>
                    setNewTask((prev) => ({ ...prev, taskType: text }))
                  }
                  placeholder="Enter task type"
                />

                <Text style={styles.label}>Scheduled Time</Text>
                {Platform.OS === "web" ? (
                  <DatePicker
                    selected={
                      newTask.scheduledTime
                        ? new Date(newTask.scheduledTime)
                        : new Date()
                    }
                    onChange={(date) =>
                      setNewTask((prev) => ({
                        ...prev,
                        scheduledTime: date.toISOString(),
                      }))
                    }
                    showTimeSelect
                    dateFormat="Pp"
                    className="web-datepicker"
                  />
                ) : (
                  <>
                    <Button title="Pick a Date" onPress={showDatePicker} />
                    {isDatePickerVisible && (
                      <DateTimePicker
                        value={new Date(newTask.scheduledTime)}
                        mode="datetime"
                        display="default"
                        onChange={handleDateChange}
                      />
                    )}
                  </>
                )}
                <Text style={styles.dateText}>
                  {newTask.scheduledTime
                    ? new Date(newTask.scheduledTime).toLocaleString()
                    : "No date selected"}
                </Text>

                <Text style={styles.label}>Recurrence Interval (HH:MM:SS)</Text>
                <TextInput
                  style={styles.input}
                  value={newTask.recurrenceInterval}
                  onChangeText={(text) =>
                    setNewTask((prev) => ({
                      ...prev,
                      recurrenceInterval: text,
                    }))
                  }
                  placeholder="Enter recurrence interval"
                />

                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={styles.input}
                  value={newTask.notes}
                  onChangeText={(text) =>
                    setNewTask((prev) => ({ ...prev, notes: text }))
                  }
                  placeholder="Enter any notes"
                />
                <TouchableOpacity
                  style={styles.addButton} // Styl dla przycisku "Add Plant"
                  onPress={handleAddTask}
                >
                  <Text style={styles.buttonText}>Add Task</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8, // Reduced padding for smaller screens
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gardenContainer: {
    marginBottom: 10,
    padding: 8, // Reduced padding
    backgroundColor: "#e8f5e9",
    borderRadius: 8, // Reduced border radius
  },
  gardenTitle: {
    fontSize: 20, // Reduced font size
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
  },
  gardenInfo: {
    fontSize: 14, // Reduced font size
    marginVertical: 2,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18, // Reduced font size
    fontWeight: "bold",
    marginVertical: 8,
  },
  plantList: {
    paddingBottom: 10, // Reduced padding
  },
  plantItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10, // Reduced padding
    backgroundColor: "#f0f0f0",
    borderRadius: 8, // Reduced border radius
    marginVertical: 4, // Reduced margin
  },
  plantImage: {
    width: 40, // Reduced size
    height: 40,
    borderRadius: 20, // Adjusted for smaller circle
    marginRight: 10, // Reduced margin
  },
  plantDetails: {
    flex: 1,
  },
  plantName: {
    fontSize: 14, // Reduced font size
    fontWeight: "bold",
  },
  plantInfo: {
    fontSize: 12, // Reduced font size
    color: "#555",
  },
  taskList: {
    paddingBottom: 10, // Reduced padding
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10, // Reduced padding
    backgroundColor: "#e0f7fa",
    borderRadius: 8, // Reduced border radius
    marginVertical: 4, // Reduced margin
  },
  taskName: {
    fontSize: 14, // Reduced font size
    fontWeight: "bold",
    marginBottom: 2, // Reduced margin
  },
  errorText: {
    color: "red",
    fontSize: 14, // Reduced font size
  },
  logo: {
    width: 80, // Reduced size
    height: 80,
    alignSelf: "center",
    marginVertical: 10, // Reduced margin
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8, // Reduced border radius
    padding: 10, // Reduced padding
    marginHorizontal: 6, // Reduced margin
    alignItems: "center",
    width: Dimensions.get("window").width * 0.4, // Adjusted width for smaller screens
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  date: {
    fontSize: 12, // Reduced font size
    color: "#666",
    marginBottom: 4, // Reduced margin
  },
  icon: {
    width: 40, // Reduced size
    height: 40,
    marginBottom: 6, // Reduced margin
  },
  temperature: {
    fontSize: 16, // Reduced font size
    fontWeight: "bold",
    marginBottom: 2, // Reduced margin
  },
  conditions: {
    fontSize: 14, // Reduced font size
    color: "#333",
    marginBottom: 2, // Reduced margin
  },
  humidity: {
    fontSize: 12, // Reduced font size
    color: "#888",
  },
  formContainer: {
    padding: 10, // Reduced padding
    backgroundColor: "#f9f9f9",
    borderRadius: 8, // Reduced border radius
    marginTop: 8, // Reduced margin
  },
  label: {
    fontSize: 12, // Reduced font size
    fontWeight: "bold",
    marginBottom: 4, // Reduced margin
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8, // Reduced padding
    marginBottom: 8, // Reduced margin
    backgroundColor: "#fff",
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8, // Reduced padding
    backgroundColor: "#f0f0f0",
    borderRadius: 5, // Reduced border radius
  },
  toggleButtonText: {
    fontSize: 14, // Reduced font size
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#FF0000",
    padding: 8, // Reduced padding
    borderRadius: 6, // Reduced border radius
    marginLeft: 10, // Reduced margin
  },
  deleteButtonText: {
    color: "#FFF",
    fontSize: 10, // Reduced font size
    fontWeight: "bold",
  },
  waterButton: {
    marginLeft: 10, // Reduced margin
    padding: 10, // Reduced padding
  },
  addButton: {
    paddingVertical: 8, // Reduced padding
    paddingHorizontal: 16, // Reduced padding
    backgroundColor: "#4CAF50",
    borderRadius: 6, // Reduced border radius
    alignItems: "center",
    marginTop: 8, // Reduced margin
    alignSelf: "flex-start",
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
});

export default UserGardenScreen;
