import React, { useState } from "react";
import { TextInput, Button, Alert, StyleSheet, Platform } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

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
        Alert.alert("Sukces", "Zalogowano pomyślnie");
      } else {
        Alert.alert("Błąd", data.message || "Nieprawidłowy email lub hasło");
      }
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się połączyć z serwerem");
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={<ThemedText type="title">Logowanie</ThemedText>}
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title">Zaloguj się</ThemedText>

        <ThemedText>Email</ThemedText>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Wpisz email"
          keyboardType="email-address"
        />
        <ThemedText>Hasło</ThemedText>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Wpisz hasło"
          secureTextEntry
        />
        <Button title="Zaloguj się" onPress={handleLogin} />
      </ThemedView>
    </ParallaxScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginVertical: 8,
    borderRadius: 6,
    color: "#000",
    fontSize: 16,
  },
});

export default LoginScreen;
