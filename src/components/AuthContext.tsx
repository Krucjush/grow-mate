import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  isLoggedIn: boolean;
  userId: string | null;
  login: (token: string, userId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultAuthContextValue: AuthContextType = {
  isLoggedIn: false,
  userId: null,
  login: async () => {},
  logout: async () => {},
};

export const AuthContext = createContext<AuthContextType>(
  defaultAuthContextValue
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        const savedUserId = await AsyncStorage.getItem("userId");
        if (token && savedUserId) {
          setIsLoggedIn(true);
          setUserId(savedUserId);
          console.log("Restored session with userId:", savedUserId);
        }
      } catch (error) {
        console.log("Error fetching token from storage:", error);
      }
    };

    checkLoginStatus();
  }, []);

  const login = async (token: string, userId: string) => {
    try {
      await AsyncStorage.setItem("jwtToken", token);
      await AsyncStorage.setItem("userId", userId);
      setIsLoggedIn(true);
      setUserId(userId);
      console.log("Logged in with new userId:", userId);
    } catch (error) {
      console.log("Error saving token or userId:", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("jwtToken");
      await AsyncStorage.removeItem("userId");
      setIsLoggedIn(false);
      setUserId(null);
      console.log("User logged out");
    } catch (error) {
      console.log("Error removing token or userId:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
