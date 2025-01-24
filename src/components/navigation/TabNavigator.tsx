import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons"; // Lub inne ikony

// Importuj ekrany
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import PlantsScreen from "../screens/PlantsScreen";
import UserGardenScreen from "../screens/UserGardenScreen";

const Tab = createBottomTabNavigator();

const TabNavigation = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Login"
        component={LoginScreen}
        options={{
          tabBarLabel: "Sign In/Up",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="key" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Plants"
        component={PlantsScreen}
        options={{
          tabBarLabel: "Rośliny",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="UserGarden"
        component={UserGardenScreen}
        options={{
          tabBarLabel: "userGarden",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flower" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigation;
