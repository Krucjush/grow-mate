import { Tabs } from "expo-router";
import React from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
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
      <Tabs.Screen
        name="register"
        options={{
          title: "Sign In/Up",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? "key" : "key-outline"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="plants"
        options={{
          title: "Rośliny",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? "key" : "key-outline"} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
