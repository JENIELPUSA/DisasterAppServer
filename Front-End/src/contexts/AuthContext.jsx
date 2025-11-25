import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const apiUrl = Constants.expoConfig.extra.apiUrl;
  const [authToken, setAuthToken] = useState(null);
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState(null);
  const [first_name, setFirstName] = useState(null);
  const [last_name, setLastName] = useState(null);
  const [contact_number, setContactNumber] = useState(null);
  const [userId, setUserID] = useState(null);
  const [linkId, setLinkId] = useState(null);
  const [Designatedzone, setDesignatedzone] = useState(null);
  const [theme, setTheme] = useState("light");
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to safely handle undefined/null values
  const safeValue = (value) => {
    return value !== null && value !== undefined ? value.toString() : "";
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const keys = ["token", "role", "email", "first_name", "last_name", "contact_number", "userId", "linkId", "Designatedzone", "theme"];
        const values = await AsyncStorage.multiGet(keys);
        
        console.log('Loaded values:', values);

        values.forEach(([key, value]) => {
          if (value !== null && value !== 'null' && value !== '') {
            console.log(`Setting ${key}:`, value);
            
            switch (key) {
              case "token":
                setAuthToken(value);
                break;
              case "role":
                setRole(value);
                break;
              case "email":
                setEmail(value);
                break;
              case "first_name":
                setFirstName(value);
                break;
              case "last_name":
                setLastName(value);
                break;
              case "contact_number":
                setContactNumber(value);
                break;
              case "userId":
                setUserID(value);
                break;
              case "linkId":
                setLinkId(value);
                break;
              case "Designatedzone":
                setDesignatedzone(value);
                break;
              case "theme":
                setTheme(value || "light");
                break;
              default:
                break;
            }

            // Set axios header if token
            if (key === "token" && value) {
              axios.defaults.headers.common["Authorization"] = `Bearer ${value}`;
            }
          }
        });
      } catch (error) {
        console.error('Error loading data from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Update axios header when authToken changes
  useEffect(() => {
    if (authToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [authToken]);

  // Login function
  const login = async (inputEmail, password) => {
    try {

      const res = await axios.post(
        `${apiUrl}/api/v1/authentication/login`,
        { email: inputEmail, password },
        { withCredentials: true }
      );

      console.log('Login response:', res.data);

      if (res.data.status === "Success") {
        const {
          token,
          role,
          email: serverEmail,
          first_name,
          last_name,
          contact_number,
          userId,
          linkId,
          Designatedzone,
          theme,
        } = res.data;

        // Prepare data for AsyncStorage - ensure no undefined values
        const storageData = [
          ["token", safeValue(token)],
          ["role", safeValue(role)],
          ["email", safeValue(serverEmail)],
          ["first_name", safeValue(first_name)],
          ["last_name", safeValue(last_name)],
          ["contact_number", safeValue(contact_number)], // This was causing the error
          ["userId", safeValue(userId)],
          ["linkId", safeValue(linkId)],
          ["Designatedzone", safeValue(Designatedzone)],
          ["theme", safeValue(theme || "light")],
        ];
        await AsyncStorage.multiSet(storageData);

        // Update state
        setAuthToken(token || "");
        setRole(role || "");
        setEmail(serverEmail || "");
        setFirstName(first_name || "");
        setLastName(last_name || "");
        setContactNumber(contact_number || ""); // Handle undefined contact_number
        setUserID(userId || "");
        setLinkId(linkId || "");
        setDesignatedzone(Designatedzone || "");
        setTheme(theme || "light");

        // Set axios header
        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }

        return { success: true, role, userId };
      } else {
        return {
          success: false,
          message: res.data.message || "Login failed",
        };
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Network error",
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const keys = ["token", "role", "email", "first_name", "last_name", "contact_number", "userId", "linkId", "Designatedzone", "theme"];
      await AsyncStorage.multiRemove(keys);

      // Reset all states
      setAuthToken(null);
      setRole(null);
      setEmail(null);
      setFirstName(null);
      setLastName(null);
      setContactNumber(null);
      setUserID(null);
      setLinkId(null);
      setDesignatedzone(null);
      setTheme("light");
      
      delete axios.defaults.headers.common["Authorization"];
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authToken,
        role,
        email,
        first_name,
        last_name,
        contact_number,
        userId,
        linkId,
        Designatedzone,
        theme,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};