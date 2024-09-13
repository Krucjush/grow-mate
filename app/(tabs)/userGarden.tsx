import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { API_KEY, API_URL } from "@env";
interface UserPlant {
  id: string;
  name: string;
  imageUrl: string;
}

interface Task {
  id: string;
  userId: string;
  title: string;
  completed: string;
}

const UserGardenScreen: React.FC = () => {
  const [userPlants, setUserPlants] = useState<UserPlant[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingPlants, setLoadingPlants] = useState<boolean>(true);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const numColumns = 2; // Liczba kolumn w siatce
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    // Pobieranie roślin użytkownika
    const fetchUserPlants = async () => {
      try {
        const response = await fetch("test.json"); // Zmień na odpowiedni endpoint
        const data = await response.json();
        setUserPlants(data.plants); // Załóżmy, że `data.plants` to lista roślin użytkownika
      } catch (error) {
        setError("Failed to fetch user plants");
      } finally {
        setLoadingPlants(false);
      }
    };

    // Pobieranie zadań związanych z roślinami
    const fetchTasks = async () => {
      try {
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/todos/1"
        ); // Zmień na odpowiedni endpoint
        const data = await response.json();
        setTasks(data.tasks); // Załóżmy, że `data.tasks` to lista nadchodzących zadań
        console.log(data);
      } catch (error) {
        setError("Failed to fetch tasks");
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchUserPlants();
    fetchTasks();
  }, []);

  const renderPlantItem = ({ item }: { item: UserPlant }) => (
    <View style={[styles.gridItem, { width: screenWidth / numColumns - 20 }]}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <Text style={styles.plantName}>{item.name}</Text>
    </View>
  );

  if (loadingPlants || loadingTasks) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Wyświetlanie siatki roślin */}
      <Text style={styles.sectionTitle}>My Garden</Text>
      <FlatList
        data={userPlants}
        keyExtractor={(item) => item.id}
        renderItem={renderPlantItem}
        numColumns={numColumns}
        contentContainerStyle={styles.grid}
      />

      {/* Wyświetlanie zadań */}
      <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text>{item.userId}</Text>
            <Text style={styles.dueDate}>Due: {item.completed}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
  },
  grid: {
    marginBottom: 24,
  },
  gridItem: {
    margin: 10,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 100,
    borderRadius: 8,
  },
  plantName: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
  taskItem: {
    padding: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 16,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dueDate: {
    marginTop: 4,
    color: "#888",
    fontStyle: "italic",
  },
});

export default UserGardenScreen;
