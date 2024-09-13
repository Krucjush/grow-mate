import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RootStackParamList } from "./types"; // Typy
import HomeScreen from "@/app/(tabs)";
import RegisterScreen from "@/app/(tabs)/register";
import { TabBarIcon } from "./TabBarIcon";
import PlantsScreen from "@/app/(tabs)/plants";
import LoginScreen from "../login";

const Tab = createBottomTabNavigator<RootStackParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="register"
        component={RegisterScreen}
        options={{
          title: "Sign In/Up",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? "key" : "key-outline"} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Plants"
        component={PlantsScreen}
        options={{
          title: "Plants",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "leaf" : "leaf-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="login"
        component={LoginScreen} // Dodaj komponent logowania
        options={{
          title: "Login",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "person" : "person-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
