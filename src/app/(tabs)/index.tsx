import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Logo or Main Image */}
      <Image
        source={require("@/assets/images/plant-image.png")} // Replace with your plant-related image
        style={styles.image}
      />

      {/* Title */}
      <Text style={styles.title}>Grow Mate</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Manage your home plants with ease and precision
      </Text>

      {/* Explore Button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Explore</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8", // Light background color
    paddingHorizontal: 20,
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: "contain",
    marginBottom: 32, // Space between image and title
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1D3D47", // Dark color for title text
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#555", // Lighter color for subtitle
    marginBottom: 40, // Space between subtitle and button
  },
  button: {
    backgroundColor: "#FF3B30", // Bright red button color
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
