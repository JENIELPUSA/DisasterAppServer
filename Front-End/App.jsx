// App.js - with MemberOfHouseholdForm screen addition and fixed provider structure
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "react-native";
import { AuthProvider } from "./src/contexts/AuthContext";
import { BarangayDisplayProvider } from "./src/contexts/BrgyContext/BarangayContext";
import { EvacuationDisplayProvider } from "./src/contexts/EvacuationContext/EvacuationContext";
import LoginPage from "./src/screens/LoginPage";
import MainTabs from "./MainTabs";
import LoadingScreen from "./src/ReusableComponent/LoadingOverlay";
import { HouseholdProvider } from "./src/contexts/HouseholdLeadContext/HouseholdContext";
import { HouseHoldMemberProvider } from "./src/contexts/HouseHoldMemberContext/HouseHoldMemberContext";

const Stack = createNativeStackNavigator();

// Create a separate navigator component that uses useAuth
const AppNavigator = () => {
  const { useAuth } = require("./src/contexts/AuthContext");
  const { authToken, isLoading } = useAuth();

  // Show loading screen while checking auth state
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {authToken ? (
        <Stack.Screen name="MainTabs" component={MainTabs} />
      ) : (
        <Stack.Screen name="Login" component={LoginPage} />
      )}
    </Stack.Navigator>
  );
};

// Main App Component
export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize any async tasks here
        // e.g., load fonts, check initial auth state, etc.

        // Simulate initialization time
        await new Promise((resolve) => setTimeout(resolve, 500));

        setIsAppReady(true);
      } catch (error) {
        console.error("Failed to initialize app:", error);
        setIsAppReady(true); // Still show app even if initialization fails
      }
    };

    initializeApp();
  }, []);

  // Show loading screen until app is ready
  if (!isAppReady) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <AuthProvider>
        <HouseHoldMemberProvider>
          <HouseholdProvider>
            <EvacuationDisplayProvider>
              <BarangayDisplayProvider>
                <AppNavigator />
              </BarangayDisplayProvider>
            </EvacuationDisplayProvider>
          </HouseholdProvider>
        </HouseHoldMemberProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
