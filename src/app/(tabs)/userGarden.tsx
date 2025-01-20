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
  knowledgeBaseId: string;
  lastWatered: string;
  datePlanted: string;
  name: string;
  imageUrl: string;
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

// Main component
const UserGardenScreen: React.FC = () => {
  const [weatherData, setWeatherData] = useState<any[]>([]);

  const [userGarden, setUserGarden] = useState<UserGarden | null>(null);
  const [gardenTasks, setGardenTasks] = useState<GardenTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [newTask, setNewTask] = useState<GardenTask>({
    id: "",
    userId: "",
    taskName: "",
    plantId: "",
    scheduledTime: new Date().toISOString(),
    isCompleted: false,
    taskType: "",
    recurrenceInterval: 0,
    notes: "",
  });
  const route = useRoute();
  const params = route.params as { userId?: string } | undefined;
  const { userId } = useAuth();
  const navigation = useNavigation();
  const apiUrl = process.env.EXPO_PUBLIC_API;
  const weatherApiUrl = process.env.EXPO_PUBLIC_API_WEATHER;

  const Logo = require("@/assets/images/plant-image.png");

  // Update with the correct path or URL
  // Fetch the garden data and tasks from the API or server
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
        const response = await fetch(`${weatherApiUrl}`);
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
      <Image
        source={{
          uri: item, // Replace later
        }}
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
  const renderPlant = ({ item }: { item: UserPlant }) => (
    <View style={styles.plantItem}>
      <Image
        source={{
          uri: item.imageUrl,
        }} // Temporary image placeholder
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
    </View>
  );

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

      const response = await fetch(`${apiUrl}/api/GardenTask`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newTask,
          scheduledTime: newTask.scheduledTime.toISOString(),
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
          recurrenceInterval: 0,
          notes: "",
        });
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setDatePickerVisibility(false);
    if (selectedDate) {
      setNewTask((prev) => ({
        ...prev,
        scheduledTime: selectedDate,
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
          <Button
            title="Add Plant"
            onPress={() => navigation.navigate("addPlantForm")}
          />

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
            style={styles.toggleButton}
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

              <Text style={styles.label}>Scheduled Time</Text>
              {Platform.OS === "web" ? (
                <DatePicker
                  selected={new Date(newTask.scheduledTime)}
                  onChange={handleWebDateChange}
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
                {new Date(newTask.scheduledTime).toLocaleString()}
              </Text>

              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={styles.input}
                value={newTask.notes}
                onChangeText={(text) =>
                  setNewTask((prev) => ({ ...prev, notes: text }))
                }
                placeholder="Enter any notes"
              />

              <Button title="Add Task" onPress={handleAddTask} />
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gardenContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#e8f5e9",
    borderRadius: 10,
  },
  gardenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  gardenInfo: {
    fontSize: 16,
    marginVertical: 4,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  plantList: {
    paddingBottom: 20,
  },
  plantItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginVertical: 5,
  },
  plantImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  plantDetails: {
    flex: 1,
  },
  plantName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  plantInfo: {
    fontSize: 14,
    color: "#555",
  },
  taskList: {
    paddingBottom: 20,
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#e0f7fa",
    borderRadius: 10,
    marginVertical: 5,
  },
  taskName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginVertical: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 10,
    alignItems: "center",
    width: Dimensions.get("window").width * 0.2, // Adjust card width
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  temperature: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  conditions: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  humidity: {
    fontSize: 14,
    color: "#888",
  },
  formContainer: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UserGardenScreen;
