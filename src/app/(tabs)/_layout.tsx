import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/components/AuthContext";
// Adjust the path as needed
import { TabBarIcon } from "@/components/navigation/TabBarIcon"; // Adjust the path as needed
import HomeScreen from ".";
import PlantsScreen from "./plants";
import LoginScreen from "./login";
import RegisterScreen from "./register";
import UserGardenScreen from "./userGarden";
import LogoutScreen from "./logout";
import AddPlantForm from "./addPlantForm";

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isLoggedIn, userId, logout } = useAuth();

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Plants"
        component={PlantsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "leaf" : "leaf-outline"}
              color={color}
            />
          ),
        }}
      />
      {!isLoggedIn && (
        <Tab.Screen
          name="Login"
          component={LoginScreen}
          options={{
            tabBarButton: () => null,
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "key" : "key-outline"}
                color={color}
              />
            ),
          }}
        />
      )}
      {!isLoggedIn && (
        <Tab.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "key" : "key-outline"}
                color={color}
              />
            ),
          }}
        />
      )}
      {isLoggedIn && (
        <Tab.Screen
          name="Garden"
          component={UserGardenScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "alert" : "alert-outline"}
                color={color}
              />
            ),
          }}
          initialParams={{ userId: null }}
        />
      )}
      {isLoggedIn && (
        <Tab.Screen
          name="Add plant"
          component={AddPlantForm}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "link" : "link-outline"}
                color={color}
              />
            ),
          }}
          initialParams={{ userId: null }}
        />
      )}
      {isLoggedIn && (
        <Tab.Screen
          name="Logout"
          children={() => <LogoutScreen onLogout={logout} />}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "exit" : "exit-outline"}
                color={color}
              />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
}
