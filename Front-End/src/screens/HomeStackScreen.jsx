import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import lahat ng screens
import HomeScreen from "./HomeScreen";


const HomeStack = createNativeStackNavigator();

export default function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}
