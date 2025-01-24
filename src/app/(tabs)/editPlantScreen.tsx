import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Button,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/components/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface GrowthRecord {
  recordDate: string;
  notes: string;
  photoUrl: string;
}

interface Plant {
  id: string;
  name: string;
  description?: string;
  growthRecords: GrowthRecord[];
}

interface Task {
  id: string;
  userId: string;
  taskName: string;
  plantId: string;
  scheduledTime: string;
  isCompleted: boolean;
  taskType: string;
  recurrenceInterval: string;
  notes: string;
}

type EditPlantScreenParams = {
  plant: Plant;
};

type EditPlantScreenRouteProp = RouteProp<
  { EditPlant: EditPlantScreenParams },
  "EditPlant"
>;

const EditPlantScreen: React.FC = () => {
  const route = useRoute<EditPlantScreenRouteProp>();
  const { plant } = route.params;

  const navigation = useNavigation();
  const [name, setName] = useState(plant.name);
  const [description, setDescription] = useState(plant.description || "");
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>(
    plant.growthRecords || []
  );
  const [newPhotoUrl, setNewPhotoUrl] = useState<string | null>(null);
  const [newNotes, setNewNotes] = useState("");
  const { userId } = useAuth();
  const apiUrl = process.env.EXPO_PUBLIC_API;

  // Task-related states
  const [newTask, setNewTask] = useState<Task>({
    id: "",
    userId: userId,
    taskName: "",
    plantId: plant.id,
    scheduledTime: "",
    isCompleted: false,
    taskType: "",
    recurrenceInterval: "00:00:00",
    notes: "",
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need media library permissions to make this work!");
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: undefined,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log("Image picker was canceled or no assets returned.");
        return;
      }

      setNewPhotoUrl(result.assets[0].uri);
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "An error occurred while picking the image.");
    }
  };

  const addGrowthRecord = () => {
    if (newPhotoUrl && newNotes) {
      const newRecord: GrowthRecord = {
        recordDate: new Date().toISOString(),
        notes: newNotes,
        photoUrl: newPhotoUrl,
      };
      setGrowthRecords([...growthRecords, newRecord]);
      setNewPhotoUrl(null);
      setNewNotes("");
    }
  };

  const savePlant = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const plantId = plant.id;

      const response = await fetch(
        `${apiUrl}/api/Plants/add-growth-record/${userId}/${plantId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            growthRecords,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      console.log("Success:", result);
      navigation.goBack();
    } catch (error) {
      console.error("Error saving plant:", error);
      Alert.alert("Error", "An error occurred while saving the plant.");
    }
  };

  const handleAddTask = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      console.log(newTask);
      const response = await fetch(`${apiUrl}/api/GardenTask`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "bbbbbdddddbbdbb",
          userId: userId,
          taskName: newTask.taskName,
          plantId: newTask.plantId,
          scheduledTime: new Date(newTask.scheduledTime).toISOString(),
          isCompleted:  false,
          taskType: newTask.taskType || "",
          recurrenceInterval: newTask.recurrenceInterval || "00:00:00",
          notes: newTask.notes,
        }),
      });

      if (response.ok) {
        const createdTask = await response.json();
        Alert.alert("Success", "Task added successfully!");
        setNewTask({
          id: "",
          userId: userId,
          taskName: "",
          plantId: plant.id,
          scheduledTime: "",
          isCompleted: false,
          taskType: "",
          recurrenceInterval: "00:00:00",
          notes: "",
        });
        setIsFormVisible(false);
      } else {
        Alert.alert("Error", "Failed to add the task. " + response.status);
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while adding the task.");
    }
  };
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    setDatePickerVisibility(false); // Ukryj DateTimePicker po wybraniu daty
    if (selectedDate) {
      setNewTask((prev) => ({
        ...prev,
        scheduledTime: selectedDate.toISOString(),
      }));
    }
  };
  const handleWebDateChange = (date: Date) => {
    setNewTask((prev) => ({
      ...prev,
      scheduledTime: date.toISOString(),
    }));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Plant Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter plant name"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter plant description"
        multiline
      />

      <Text style={styles.sectionTitle}>Growth Records</Text>
      {growthRecords.map((record, index) => (
        <View key={index} style={styles.recordContainer}>
          <Image source={{ uri: record.photoUrl }} style={styles.recordImage} />
          <Text style={styles.recordNotes}>{record.notes}</Text>
          <Text style={styles.recordDate}>
            {new Date(record.recordDate).toLocaleDateString()}
          </Text>
        </View>
      ))}

      <Text style={styles.label}>Add New Growth Record</Text>
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {newPhotoUrl ? (
          <Image source={{ uri: newPhotoUrl }} style={styles.image} />
        ) : (
          <Feather name="camera" size={50} color="#ccc" />
        )}
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        value={newNotes}
        onChangeText={setNewNotes}
        placeholder="Enter notes for the new record"
        multiline
      />

      <TouchableOpacity
        onPress={addGrowthRecord}
        style={[styles.button, styles.buttonRed, styles.addButton]}
      >
        <Text style={styles.buttonText}>Add Record</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={savePlant}
        style={[styles.button, styles.buttonRed, styles.saveButton]}
      >
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>

      {/* Task Section */}
      <View style={styles.gardenContainer}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setIsFormVisible((prev) => !prev)}
        >
          <Text style={styles.toggleButtonText}>
            {isFormVisible ? "▼ Add New Task" : "► Add New Task"}
          </Text>
        </TouchableOpacity>
        {isFormVisible && (
          <View style={styles.formContainer}>
            <Text style={styles.label}>Task Name</Text>
            <TextInput
              style={styles.input}
              value={newTask.taskName}
              onChangeText={(text) =>
                setNewTask((prev) => ({ ...prev, taskName: text }))
              }
              placeholder="Enter task name"
            />
            <Text style={styles.label}>Task Type</Text>
            <TextInput
              style={styles.input}
              value={newTask.taskType}
              onChangeText={(text) =>
                setNewTask((prev) => ({ ...prev, taskType: text }))
              }
              placeholder="Enter task type"
            />
            <Text style={styles.label}>Scheduled Time</Text>
            {Platform.OS === "web" ? (
              <DatePicker
                selected={
                  newTask.scheduledTime
                    ? new Date(newTask.scheduledTime)
                    : new Date()
                }
                onChange={(date: Date) => handleWebDateChange(date)}
                showTimeSelect
                dateFormat="Pp"
                className="web-datepicker"
              />
            ) : (
              <>
                <Button title="Pick a Date" onPress={showDatePicker} />
                {Platform.OS === "android" && isDatePickerVisible && (
                  <DateTimePicker
                    value={
                      newTask.scheduledTime
                        ? new Date(newTask.scheduledTime)
                        : new Date()
                    }
                    mode="date" // Ustawia tryb wyboru daty i godziny
                    display="spinner" // Ustawia wyświetlanie jako spinner
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        handleDateChange(event, selectedDate); // Przekazujemy oba wymagane argumenty
                      }
                    }}
                  />
                )}
              </>
            )}
            <Text style={styles.dateText}>
              {newTask.scheduledTime
                ? new Date(newTask.scheduledTime).toLocaleString()
                : "No date selected"}
            </Text>
            <Text style={styles.label}>Recurrence Interval (HH:MM:SS)</Text>
            <TextInput
              style={styles.input}
              value={newTask.recurrenceInterval}
              onChangeText={(text) =>
                setNewTask((prev) => ({
                  ...prev,
                  recurrenceInterval: text,
                }))
              }
              placeholder="Enter recurrence interval"
            />
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={styles.input}
              value={newTask.notes}
              onChangeText={(text) =>
                setNewTask((prev) => ({ ...prev, notes: text }))
              }
              placeholder="Enter any notes"
            />
            <TouchableOpacity
              style={[styles.button, styles.addTaskButton]}
              onPress={handleAddTask}
            >
              <Text style={styles.buttonText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  addButton: {
    alignSelf: "center",
    width: "40%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  recordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  recordImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  recordNotes: {
    flex: 1,
    fontSize: 14,
  },
  recordDate: {
    fontSize: 12,
    color: "#888",
  },
  imagePicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 16,
  },
  buttonRed: {
    backgroundColor: "red",
  },
  saveButton: {
    alignSelf: "flex-end",
    width: "20%",
  },

  gardenContainer: {
    marginTop: 20,
  },
  toggleButton: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  toggleButtonText: {
    fontSize: 16,
    color: "blue",
  },
  formContainer: {
    marginTop: 10,
  },
  addTaskButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  dateText: {
    fontSize: 14,
    marginBottom: 16,
  },
});

export default EditPlantScreen;
