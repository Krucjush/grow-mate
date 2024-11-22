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
  const [debouncedQuery, setDebouncedQuery] = useState<string>(""); // Debounced query
  const [page, setPage] = useState<number>(1); // Track current page
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery); // Update debouncedQuery after delay
    }, 500); // 500ms delay

    return () => clearTimeout(timer); // Clear timeout if query changes before delay ends
  }, [searchQuery]);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setLoading(true);
        const queryParam = debouncedQuery ? `&q=${debouncedQuery}` : ""; // Add debounced query if present
        const response = await fetch(`${apiUrl}&page=${page}${queryParam}`);
        const data = await response.json();
        setPlants(data.data); // Replace data on every fetch
      } catch (error) {
        setError("Failed to fetch plants");
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, [debouncedQuery, page]); // Fetch plants when debouncedQuery or page changes

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setPage((prevPage) => (prevPage > 1 ? prevPage - 1 : 1));
  };

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
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
      </View>

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

      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, page === 1 && styles.disabledButton]}
          onPress={handlePreviousPage}
          disabled={page === 1}
        >
          <Text style={styles.paginationText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.paginationButton}
          onPress={handleNextPage}
        >
          <Text style={styles.paginationText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
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
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  paginationButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 8,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    alignItems: "center",
  },
  paginationText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
});

export default PlantsScreen;
