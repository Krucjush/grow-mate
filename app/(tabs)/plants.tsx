import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Importing icons

interface Plant {
  id: number;
  common_name: string;
  scientific_name: string[];
  cycle: string;
  watering: string;
  default_image: {
    original_url: string;
  };
}

const PlantsScreen: React.FC = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(""); // Search query
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        console.log(apiUrl);
        const response = await fetch(`${apiUrl}`);
        const data = await response.json();
        setPlants(data.data); // Accessing the 'data' array
      } catch (error) {
        setError("Failed to fetch plants");
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  if (loading) {
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

  // Category buttons
  const categories = [
    "All plants",
    "Tall plants",
    "Low Light",
    "Air Purifying",
  ];

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search"
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
      />

      <Text style={styles.heading}>Best Indoor Plants</Text>

      <FlatList
        data={plants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image
              source={{
                uri:
                  item.default_image?.original_url ||
                  "https://via.placeholder.com/150",
              }}
              style={styles.image}
            />

            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.common_name}</Text>
              <Text style={styles.subtitle}>
                Scientific Name: {item.scientific_name.join(", ")}
              </Text>
              <Text>Cycle: {item.cycle}</Text>
              <Text>Watering: {item.watering}</Text>
            </View>

            <TouchableOpacity style={styles.heartIcon}>
              <Ionicons name="heart-outline" size={24} color="black" />
            </TouchableOpacity>
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
  searchInput: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  categoryList: {
    marginBottom: 16,
  },
  categoryButton: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontStyle: "italic",
    marginBottom: 4,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  heartIcon: {
    padding: 8,
  },
});

export default PlantsScreen;
