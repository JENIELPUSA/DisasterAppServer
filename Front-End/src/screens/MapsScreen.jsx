import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Animated,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  TextInput,
  ScrollView,
  FlatList
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const slideAnim = useRef(new Animated.Value(300)).current;
  const arrowRotate = useRef(new Animated.Value(0)).current;
  const searchSlideAnim = useRef(new Animated.Value(0)).current;

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

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const allItems = [
      ...barangays.map(item => ({ 
        ...item, 
        type: 'municipality',
        displayName: item.name || item.barangay_name || 'Unknown Municipality'
      })),
      ...evacuations.map(item => ({ 
        ...item, 
        type: 'evacuation',
        displayName: item.name || item.evacuation_name || 'Unknown Evacuation'
      }))
    ];

    const filtered = allItems.filter(item => {
      const name = item.displayName.toLowerCase();
      const address = item.address ? item.address.toLowerCase() : '';
      const type = item.type;
      
      return name.includes(query) || 
             address.includes(query) ||
             type.includes(query);
    });

    setSearchResults(filtered);
    setShowSearchResults(true);
  }, [searchQuery, barangays, evacuations]);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    Animated.timing(searchSlideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    if (searchQuery === "") {
      Animated.timing(searchSlideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleSearchItemPress = (item) => {
    console.log("Selected item:", item);
    
    // Send data to WebView to focus on selected item
    if (webViewRef.current && isInitialized) {
      const data = {
        view: item.type === 'municipality' ? "municipalities" : "evacuations",
        municipalities: barangays,
        evacuations: evacuations,
        roads: [],
        household: [],
        municipalitiesVisible: true,
        evacuationsVisible: true,
        roadsVisible: true,
        householdVisible: true,
        focusOn: {
          id: item.id,
          type: item.type,
          coordinates: item.coordinates || item.location,
          name: item.displayName
        }
      };
      webViewRef.current.postMessage(JSON.stringify(data));
    }
    
    // Clear search and hide results
    setSearchQuery("");
    setShowSearchResults(false);
    setIsSearchFocused(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSearchResults(false);
    setIsSearchFocused(false);
    Animated.timing(searchSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

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

  // Search results item renderer
  const renderSearchResultItem = ({ item }) => (
    <TouchableOpacity
      className="p-4 border-b border-gray-100 bg-white active:bg-gray-50"
      onPress={() => handleSearchItemPress(item)}
    >
      <View className="flex-row items-center">
        <View className={`w-10 h-10 rounded-full justify-center items-center mr-3 ${
          item.type === 'municipality' ? 'bg-blue-100' : 'bg-orange-100'
        }`}>
          <MaterialIcons
            name={item.type === 'municipality' ? 'location-city' : 'place'}
            size={22}
            color={item.type === 'municipality' ? '#3b82f6' : '#f97316'}
          />
        </View>
        <View className="flex-1">
          <Text className="text-gray-800 font-semibold text-base">
            {item.displayName}
          </Text>
          <Text className="text-gray-500 text-sm mt-1">
            {item.type === 'municipality' ? 'Municipality' : 'Evacuation Center'}
          </Text>
          {item.address && (
            <Text className="text-gray-400 text-xs mt-1">
              <MaterialIcons name="location-on" size={12} color="#9ca3af" />
              {" "}{item.address}
            </Text>
          )}
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#d1d5db" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1">
      {/* Search Bar Container */}
      <Animated.View 
        className="absolute top-0 left-0 right-0 z-10"
        style={{
          transform: [{
            translateY: searchSlideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0]
            })
          }],
          opacity: searchSlideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1]
          })
        }}
      >
        {/* Search Input */}
        <View className="mx-4 mt-10 mb-2">
          <View className="flex-row items-center bg-white rounded-full shadow-lg border border-gray-200 px-4 py-3">
            <MaterialIcons name="search" size={24} color="#6b7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-800 text-base"
              placeholder="Search municipalities or evacuation centers..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery !== "" && (
              <TouchableOpacity onPress={clearSearch} className="ml-2">
                <MaterialIcons name="close" size={22} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <View className="mx-4 max-h-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <View className="p-3 border-b border-gray-100 bg-gray-50">
              <Text className="text-gray-600 font-semibold">
                Search Results ({searchResults.length})
              </Text>
            </View>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResultItem}
              keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* No Results Found */}
        {showSearchResults && searchResults.length === 0 && searchQuery !== "" && (
          <View className="mx-4 mt-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-6 items-center">
            <MaterialIcons name="search-off" size={48} color="#d1d5db" />
            <Text className="text-gray-500 text-lg font-semibold mt-3">
              No results found
            </Text>
            <Text className="text-gray-400 text-center mt-1">
              Try searching for a different municipality or evacuation center
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Map Background Overlay when searching */}
      {showSearchResults && (
        <TouchableOpacity
          className="absolute inset-0 bg-black bg-opacity-30 z-5"
          onPress={() => {
            setShowSearchResults(false);
            setIsSearchFocused(false);
          }}
          activeOpacity={1}
        />
      )}

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