import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Animated,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager
} from "react-native";
import { WebView } from "react-native-webview";
import { BarangayDisplayContext } from "../contexts/BrgyContext/BarangayContext";
import { EvacuationDisplayContext } from "../contexts/EvacuationContext/EvacuationContext";
import { MaterialIcons } from "@expo/vector-icons";

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const { width, height } = Dimensions.get('window');

export default function MapsScreen() {
  const { evacuations } = useContext(EvacuationDisplayContext);
  const { barangays } = useContext(BarangayDisplayContext);
  const webViewRef = useRef(null);
  const [selectedView, setSelectedView] = useState("both");
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const slideAnim = useRef(new Animated.Value(300)).current;
  const arrowRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (barangays.length > 0 && evacuations.length > 0) {
      setIsInitialized(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [barangays, evacuations]);

  const toggleCollapse = () => {
    if (!isInitialized) return;

    // Use LayoutAnimation for smooth height transition
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        300,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity
      )
    );

    // Animate arrow rotation
    Animated.timing(arrowRotate, {
      toValue: isCollapsed ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setIsCollapsed(!isCollapsed);
  };

  const handleMunicipalitiesPress = () => {
    if (!isInitialized) return;
    console.log("Municipalities button pressed");
    setSelectedView("municipalities");
  };

  const handleEvacuationsPress = () => {
    if (!isInitialized) return;
    console.log("Evacuations button pressed");
    setSelectedView("evacuations");
  };

  const handleRoadsPress = () => {
    if (!isInitialized) return;
    console.log("Roads button pressed");
  };

  const handleHouseholdPress = () => {
    if (!isInitialized) return;
    console.log("HouseHold button pressed");
  };

  useEffect(() => {
    if (webViewRef.current && isInitialized) {
      const data = {
        view: selectedView,
        municipalities: barangays,
        evacuations: evacuations,
        roads: [],
        household: [],
        municipalitiesVisible: true,
        evacuationsVisible: true,
        roadsVisible: true,
        householdVisible: true
      };
      webViewRef.current.postMessage(JSON.stringify(data));
    }
  }, [selectedView, barangays, evacuations, isInitialized]);

  const arrowRotation = arrowRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  // Panel height based on collapsed state
  const panelHeight = isCollapsed ? 150 : 270;

  return (
    <View className="flex-1">
      <WebView
        ref={webViewRef}
        source={require("../../assets/map.html")}
        onLoad={() => {
          if (isInitialized) {
            const data = {
              view: selectedView,
              municipalities: barangays,
              evacuations: evacuations,
              roads: [],
              household: [],
              municipalitiesVisible: true,
              evacuationsVisible: true,
              roadsVisible: true,
              householdVisible: true
            };
            webViewRef.current.postMessage(JSON.stringify(data));
          }
        }}
      />

      {/* Bottom Control Panel - Using conditional height with LayoutAnimation */}
      <Animated.View
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl border border-gray-100 border-b-0 overflow-hidden shadow-lg"
        style={{
          transform: [{ translateY: slideAnim }],
          height: panelHeight,
        }}
      >
        {/* Collapse Header - Always visible */}
        <TouchableOpacity
          className="bg-gray-50 border-b border-gray-200 py-3 px-5 items-center"
          onPress={toggleCollapse}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center justify-center">
            <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={28}
                color="#3b82f6"
              />
            </Animated.View>
            <Text className="text-blue-500 text-sm font-semibold ml-2">
              {isCollapsed ? "Tap to Expand" : "Tap to Collapse"}
            </Text>
          </View>
        </TouchableOpacity>

        {!isInitialized ? (
          <View className="items-center py-2.5 px-5">
            <View className="flex-row items-center mb-2.5">
              <MaterialIcons name="sync" size={24} color="#3b82f6" />
              <Text className="text-blue-500 text-sm font-semibold ml-2.5">
                Loading map data...
              </Text>
            </View>
            <View className="bg-gray-50 rounded-lg px-3 py-1.5">
              <Text className="text-gray-500 text-xs font-medium">
                Municipalities: {barangays.length} | Evacuations: {evacuations.length}
              </Text>
            </View>
          </View>
        ) : (
          <>
            {/* Expanded State - Only show when not collapsed */}
            {!isCollapsed && (
              <View className="flex-1 p-5">
                {/* First row of buttons */}
                <View className="flex-row justify-between mb-3">
                  <TouchableOpacity
                    className="flex-1 rounded-xl mx-1.5 py-3 bg-blue-500 shadow-sm active:bg-blue-600"
                    onPress={handleMunicipalitiesPress}
                    disabled={!isInitialized}
                    activeOpacity={0.8}
                  >
                    <View className="flex-row items-center justify-center relative">
                      <MaterialIcons
                        name="location-city"
                        size={22}
                        color="#ffffff"
                      />
                      <Text className="text-white text-sm font-semibold ml-2">
                        Municipalities
                      </Text>
                      <View className="absolute -top-2 -right-2 bg-blue-500 w-6 h-6 rounded-full justify-center items-center shadow">
                        <Text className="text-white text-xs font-extrabold">{barangays.length}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 rounded-xl mx-1.5 py-3 bg-orange-500 shadow-sm active:bg-orange-600"
                    onPress={handleEvacuationsPress}
                    disabled={!isInitialized}
                    activeOpacity={0.8}
                  >
                    <View className="flex-row items-center justify-center relative">
                      <MaterialIcons
                        name="place"
                        size={22}
                        color="#ffffff"
                      />
                      <Text className="text-white text-sm font-semibold ml-2">
                        Evacuations
                      </Text>
                      <View className="absolute -top-2 -right-2 bg-white w-6 h-6 rounded-full justify-center items-center shadow">
                        <Text className="text-orange-500 text-xs font-extrabold">{evacuations.length}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Second row of buttons */}
                <View className="flex-row justify-between">
                  <TouchableOpacity
                    className="flex-1 rounded-xl mx-1.5 py-3 bg-emerald-500 shadow-sm active:bg-emerald-600"
                    onPress={handleRoadsPress}
                    disabled={!isInitialized}
                    activeOpacity={0.8}
                  >
                    <View className="flex-row items-center justify-center relative">
                      <MaterialIcons
                        name="directions"
                        size={22}
                        color="#ffffff"
                      />
                      <Text className="text-white text-sm font-semibold ml-2">
                        Roads
                      </Text>
                      <View className="absolute -top-2 -right-2 bg-white w-6 h-6 rounded-full justify-center items-center shadow">
                        <Text className="text-emerald-500 text-xs font-extrabold">0</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 rounded-xl mx-1.5 py-3 bg-violet-500 shadow-sm active:bg-violet-600"
                    onPress={handleHouseholdPress}
                    disabled={!isInitialized}
                    activeOpacity={0.8}
                  >
                    <View className="flex-row items-center justify-center relative">
                      <MaterialIcons
                        name="home"
                        size={22}
                        color="#ffffff"
                      />
                      <Text className="text-white text-sm font-semibold ml-2">
                        HouseHold
                      </Text>
                      <View className="absolute -top-2 -right-2 bg-white w-6 h-6 rounded-full justify-center items-center shadow">
                        <Text className="text-violet-500 text-xs font-extrabold">0</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Collapsed State - Only show when collapsed */}
            {isCollapsed && (
              <View className="flex-1 p-3.5 items-center justify-center">
                <View className="flex-row items-center justify-center flex-wrap mb-2.5">
                  <View className="w-3 h-3 rounded-full bg-blue-500 mx-1" />
                  <Text className="text-gray-800 text-sm font-semibold mr-2.5">
                    M: {barangays.length}
                  </Text>
                  <View className="w-3 h-3 rounded-full bg-orange-500 mx-1" />
                  <Text className="text-gray-800 text-sm font-semibold mr-2.5">
                    E: {evacuations.length}
                  </Text>
                  <View className="w-3 h-3 rounded-full bg-emerald-500 mx-1" />
                  <Text className="text-gray-800 text-sm font-semibold mr-2.5">
                    R
                  </Text>
                  <View className="w-3 h-3 rounded-full bg-violet-500 mx-1" />
                  <Text className="text-gray-800 text-sm font-semibold mr-2.5">
                    H
                  </Text>
                </View>
                <View className="bg-gray-100 rounded-lg px-3 py-1.5">
                  <Text className="text-gray-500 text-xs font-medium">
                    Tap arrow to show controls
                  </Text>
                </View>
              </View>
            )}
          </>
        )}
      </Animated.View>
    </View>
  );
}