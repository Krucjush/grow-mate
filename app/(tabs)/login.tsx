import React, { useState } from "react";
import {
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Text,
  useColorScheme,
  View,
  ScrollView,
  Image, // Dodano import Image
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/components/navigation/types";

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "login"
>;

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigation = useNavigation<LoginScreenNavigationProp>();
  const colorScheme = useColorScheme(); // Detekcja trybu kolorów

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Błąd", "Wszystkie pola muszą być wypełnione");
      return;
    }

    try {
      const response = await fetch("https://example.com/api/login", {
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
        Alert.alert("Sukces", "Logowanie powiodło się");
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
          source={require("@/assets/images/image.png")} // Użyj tego samego obrazka co w rejestracji
          style={{ width: "100%", height: "100%" }} // Ustawienie obrazu na pełny nagłówek
          resizeMode="cover" // Dopasowanie obrazu do rozmiaru
        />
      }
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollViewContainer,
          { backgroundColor: colorScheme === "light" ? "#FFFFFF" : "#FFFFFF" }, // Dodanie tła
        ]}
      >
        <ThemedView style={styles.container}>
          <Text style={styles.title}>Zaloguj się</Text>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Wpisz email"
            placeholderTextColor="#888"
            keyboardType="email-address"
          />
          <Text style={styles.label}>Hasło</Text>
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
            onPress={() => navigation.navigate("register")} // Używanie funkcji nawigacji do ekranu rejestracji
          >
            <Text style={styles.loginText}>
              Nie masz konta? Zarejestruj się
            </Text>
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

export default LoginScreen;
