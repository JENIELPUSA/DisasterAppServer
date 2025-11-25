// App.js - idagdag ang MemberOfHouseholdForm screen
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import LoginPage from "./src/screens/LoginPage";
import MainTabs from "./MainTabs";


const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { authToken } = useAuth();


  console.log("authToken",authToken)

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {authToken ? (
        <Stack.Screen name="MainTabs" component={MainTabs} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginPage} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}