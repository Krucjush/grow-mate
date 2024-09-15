import React from "react";
import { View, Button, Text } from "react-native";

interface LogoutScreenProps {
  onLogout: () => void;
}

const LogoutScreen: React.FC<LogoutScreenProps> = ({ onLogout }) => {
  return (
    <View>
      <Text>Are you sure you want to logout?</Text>
      <Button title="Logout" onPress={onLogout} />
    </View>
  );
};
export default LogoutScreen;
