// App.js
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "react-native";

// Contexts
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { IncidentReportProvider } from "./src/contexts/IncidentReportContext/IncidentReportContext";
import { NasirangBahayProvider } from "./src/contexts/NasirangBahayReportContext/NasirangBahayReportContext";
import { MunicipalityProvider } from "./src/contexts/MunicipalityContext/MunicipalityContext";
import { ProfileProvider } from "./src/contexts/ProfileContext/ProfileContext";
import { HouseHoldMemberProvider } from "./src/contexts/HouseHoldMemberContext/HouseHoldMemberContext";
import { HouseholdProvider } from "./src/contexts/HouseholdLeadContext/HouseholdContext";
import { EvacuationDisplayProvider } from "./src/contexts/EvacuationContext/EvacuationContext";
import { BarangayDisplayProvider } from "./src/contexts/BrgyContext/BarangayContext";
import { NotificationProvider } from "./src/contexts/NotificationContext/NotificationContext";
import { TrackingEvacuatesProvider } from "./src/contexts/TrackingContext/TrackingContext";

// Screens
import LoginPage from "./src/screens/LoginPage";
import MainTabs from "./MainTabs";
import LoadingScreen from "./src/ReusableComponent/LoadingOverlay";

// Socket Listener
import SocketListener from "./src/SocketListener/SocketListener"; // default export

const Stack = createNativeStackNavigator();

// Navigator that checks auth
const AppNavigator = () => {
  const { authToken, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

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

// Main App
export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Any async initialization
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsAppReady(true);
      } catch (err) {
        console.error("App initialization failed:", err);
        setIsAppReady(true);
      }
    };
    initializeApp();
  }, []);

  if (!isAppReady) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <AuthProvider>
        <TrackingEvacuatesProvider>
          <NotificationProvider>
            <IncidentReportProvider>
              <NasirangBahayProvider>
                <MunicipalityProvider>
                  <ProfileProvider>
                    <HouseHoldMemberProvider>
                      <HouseholdProvider>
                        <EvacuationDisplayProvider>
                          <BarangayDisplayProvider>
                            {/* SocketListener as standalone */}
                            <SocketListener />
                            <AppNavigator />
                          </BarangayDisplayProvider>
                        </EvacuationDisplayProvider>
                      </HouseholdProvider>
                    </HouseHoldMemberProvider>
                  </ProfileProvider>
                </MunicipalityProvider>
              </NasirangBahayProvider>
            </IncidentReportProvider>
          </NotificationProvider>
        </TrackingEvacuatesProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
