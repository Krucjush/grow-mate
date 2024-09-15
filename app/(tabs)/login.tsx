import React, { useState } from "react";
import {
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Text,
  useColorScheme,
  View,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@/components/AuthContext"; // Import the useAuth hook
import ParallaxScrollView from "@/components/ParallaxScrollView";

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigation = useNavigation();
  const { login } = useAuth(); // Destructure the login function from the context
  const colorScheme = useColorScheme();
  const apiUrl = process.env.EXPO_PUBLIC_API;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Błąd", "Wszystkie pola muszą być wypełnione");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/Auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const token = data.token; // Assuming that the JWT token is returned in the response
        const userId = data.id; // Assuming userId is returned
        // Update context with the new login status
        await login(token, userId); // Use the login method from the context

        navigation.navigate("Home", { userId: userId });
        console.log("Navigating to Garden with userId:", userId);
      } else {
        Alert.alert("Błąd", data.message || "Coś poszło nie tak");
      }
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się połączyć z serwerem");
    }
  };

  return (
    <ParallaxScrollView
    headerBackgroundColor={{ light: "#FFFFFF", dark: "#FFFFFF" }} // Kolor tła nagłówka
    headerImage={
      <Image
        source={require("@/assets/images/image.png")} // Lokalny obrazek, upewnij się, że ścieżka do obrazu jest poprawna
        style={{ width: "100%", height: "100%" }} // Ustawienie obrazu na pełny nagłówek
        resizeMode="cover" // Dopasowanie obrazu do rozmiaru
      />
    }
  >
    <ScrollView
      contentContainerStyle={[
        styles.scrollViewContainer,
        { backgroundColor: colorScheme === "dark" ? "#FFFFFF" : "#FFFFFF" },
      ]}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Zaloguj się</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Wpisz email"
          placeholderTextColor="#888"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Wpisz hasło"
          placeholderTextColor="#888"
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Zaloguj się</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.loginText}>Nie masz konta? Zarejestruj się</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </ParallaxScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1D3D47",
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#4A4A4A",
  },
  input: {
    borderWidth: 1,
    borderColor: "#A1DEC4",
    padding: 12,
    marginVertical: 8,
    borderRadius: 6,
    backgroundColor: "#fff",
    color: "#333",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#FF3B30",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },
  loginText: {
    color: "#007BFF",
    fontSize: 16,
  },
});

export default LoginScreen;
