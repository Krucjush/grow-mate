import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { API_KEY, API_URL } from "@env";
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

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await fetch(`${API_URL}${API_KEY}`);
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

  return (
    <View style={styles.container}>
      <FlatList
        data={plants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>{item.common_name}</Text>
            <Text style={styles.subtitle}>
              Scientific Name: {item.scientific_name.join(", ")}
            </Text>
            <Text>Cycle: {item.cycle}</Text>
            <Text>Watering: {item.watering}</Text>
            {item.default_image && (
              <Image
                source={{ uri: item.default_image.original_url }}
                style={styles.image}
              />
            )}
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
  item: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
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
    width: "100%",
    height: 200,
    marginTop: 8,
    borderRadius: 8,
  },
});

export default PlantsScreen;
