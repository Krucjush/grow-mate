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
} from "react-native";

import { useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/components/AuthContext";

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
}

interface GardenTask {
  id: string;
  userId: string;
  taskName: string;
  plantId: string;
  scheduledTime: string;
  isCompleted: boolean;
}

// Main component
const UserGardenScreen: React.FC = () => {
  const [userGarden, setUserGarden] = useState<UserGarden | null>(null);
  const [gardenTasks, setGardenTasks] = useState<GardenTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const route = useRoute();
  const params = route.params as { userId?: string } | undefined;
  const { userId } = useAuth();
  const navigation = useNavigation();
  const apiUrl = process.env.EXPO_PUBLIC_API;
  console.log("UserGardenScreen received userId:", userId);
  const Logo = require("@/assets/images/plant-image.png"); // Update with the correct path or URL
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
        console.log("Fetched garden data: ", gardenData); // Log the full response

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

  // Function to mark a task as completed
  const markTaskAsCompleted = async (taskId: string) => {
    try {
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
        source={{ uri: "https://via.placeholder.com/150" }} // Temporary image placeholder
        style={styles.plantImage}
      />
      <View style={styles.plantDetails}>
        <Text style={styles.plantName}>Plant Name</Text>
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
      <Image source={Logo} style={styles.logo} />
      {userGarden && (
        <View style={styles.gardenContainer}>
          <Text style={styles.gardenTitle}>Garden Name: {userGarden.name}</Text>
          <Text style={styles.gardenInfo}>Location: {userGarden.location}</Text>

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

          <Text style={styles.sectionTitle}>Garden Tasks</Text>
          <FlatList
            data={gardenTasks}
            renderItem={renderTask}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.taskList}
          />
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
});

export default UserGardenScreen;
