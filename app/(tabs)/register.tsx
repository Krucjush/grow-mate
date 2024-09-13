import React, { useState } from "react";
import {
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Text,
  useColorScheme, // Importowanie hooka do wykrywania trybu
  View,
  ScrollView,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { useNavigation } from "@react-navigation/native"; // Importowanie hooka nawigacji
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/components/navigation/types";

type RegisterScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "register"
>;

const RegisterScreen: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const colorScheme = useColorScheme(); // Detekcja trybu kolorów

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert("Błąd", "Wszystkie pola muszą być wypełnione");
      return;
    }

    try {
      const response = await fetch("https://example.com/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Sukces", "Konto zostało utworzone");
      } else {
        Alert.alert("Błąd", data.message || "Coś poszło nie tak");
      }
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się połączyć z serwerem");
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1DEC4", dark: "#2D4C37" }} // Kolor headera nawiązujący do natury
      headerImage={<ThemedText type="title">Rejestracja</ThemedText>} // Tytuł na górze
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollViewContainer,
          { backgroundColor: colorScheme === "dark" ? "#2D4C37" : "#FFFFFF" }, // Dodanie tła tutaj
        ]}
      >
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            Zarejestruj się
          </ThemedText>
          <ThemedText style={styles.label}>Nazwa użytkownika</ThemedText>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Wpisz nazwę użytkownika"
            placeholderTextColor="#888"
          />
          <ThemedText style={styles.label}>Email</ThemedText>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Wpisz email"
            placeholderTextColor="#888"
            keyboardType="email-address"
          />
          <ThemedText style={styles.label}>Hasło</ThemedText>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Wpisz hasło"
            placeholderTextColor="#888"
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Zarejestruj się</Text>
          </TouchableOpacity>

          {/* Dodanie przycisku do nawigacji na ekran logowania */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate("login")} // Używanie funkcji nawigacji
          >
            <Text style={styles.loginText}>Masz już konto? Zaloguj się</Text>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </ParallaxScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1, // Wypełnienie całego ekranu
    justifyContent: "center", // Wycentrowanie treści
  },
  container: {
    padding: 20,
    backgroundColor: "#FFFFFF", // Białe tło formularza
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
    color: "#1D3D47", // Naturalny, ciemnozielony kolor
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#4A4A4A", // Ciemnoszary kolor dla etykiet
  },
  input: {
    borderWidth: 1,
    borderColor: "#A1DEC4", // Zielonkawa obwódka
    padding: 12,
    marginVertical: 8,
    borderRadius: 6,
    backgroundColor: "#fff",
    color: "#333",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#FF3B30", // Czerwony przycisk, wyróżniający się
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
    color: "#007BFF", // Kolor linku
    fontSize: 16,
  },
});

export default RegisterScreen;
