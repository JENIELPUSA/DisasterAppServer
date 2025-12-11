import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";
import { styled } from "nativewind";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function BarangayRegistrationForm({registerBarangay, setRegisterBarangay}) {
  const [barangayName, setBarangayName] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const mapRef = useRef(null);

  // Fetch suggestions while typing
  const handleChangeAddress = async (text) => {
    setQuery(text);
    setSelectedLocation(null);

    if (text.length > 2) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            text
          )}&addressdetails=1&limit=5`
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error(error);
      }
    } else {
      setSuggestions([]);
    }
  };

  // Select suggestion
  const handleSelectAddress = (item) => {
    setQuery(item.display_name);
    setSuggestions([]);
    const location = {
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    };
    setSelectedLocation(location);

    if (mapRef.current) {
      mapRef.current.setCamera({
        centerCoordinate: [location.longitude, location.latitude],
        zoomLevel: 15,
        animationDuration: 1000,
      });
    }
  };

  const handleSubmit = () => {
    if (!barangayName || !captainName || !selectedLocation) {
      alert("Please complete all fields and select an address!");
      return;
    }

    const newBarangay = {
      name: barangayName,
      captain: captainName,
      address: query,
      coordinates: selectedLocation,
    };

    console.log("Registered Barangay:", newBarangay);
    alert("Barangay registered successfully!");
    setBarangayName("");
    setCaptainName("");
    setQuery("");
    setSelectedLocation(null);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView className="p-5">
        {/* Barangay Name */}
        <StyledText className="text-lg font-bold mt-3">Barangay Name</StyledText>
        <StyledTextInput
          value={barangayName}
          onChangeText={setBarangayName}
          placeholder="Enter Barangay Name"
          className="border border-gray-300 rounded-xl p-3 mt-1 text-base"
        />

        {/* Captain Name */}
        <StyledText className="text-lg font-bold mt-4">Barangay Captain</StyledText>
        <StyledTextInput
          value={captainName}
          onChangeText={setCaptainName}
          placeholder="Enter Captain Name"
          className="border border-gray-300 rounded-xl p-3 mt-1 text-base"
        />

        {/* Address */}
        <StyledText className="text-lg font-bold mt-4">Address</StyledText>
        <StyledTextInput
          value={query}
          onChangeText={handleChangeAddress}
          placeholder="Type address..."
          className="border border-gray-300 rounded-xl p-3 mt-1 text-base"
        />

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id.toString()}
            renderItem={({ item }) => (
              <StyledTouchableOpacity
                onPress={() => handleSelectAddress(item)}
                className="p-3 border-b border-gray-200"
              >
                <StyledText>{item.display_name}</StyledText>
              </StyledTouchableOpacity>
            )}
            className="max-h-40 mt-2 border border-gray-300 rounded-xl"
          />
        )}

        {/* Map Preview */}
        {selectedLocation && (
          <StyledView className="h-56 mt-4 rounded-xl overflow-hidden border border-gray-300">
            <MapLibreGL.MapView style={{ flex: 1 }}>
              <MapLibreGL.Camera
                ref={mapRef}
                zoomLevel={15}
                centerCoordinate={[
                  selectedLocation.longitude,
                  selectedLocation.latitude,
                ]}
              />
              <MapLibreGL.PointAnnotation
                id="selectedLocation"
                coordinate={[
                  selectedLocation.longitude,
                  selectedLocation.latitude,
                ]}
              />
            </MapLibreGL.MapView>
          </StyledView>
        )}

        {/* Submit Button */}
        <StyledTouchableOpacity
          className="bg-cyan-500 rounded-xl p-4 mt-5 items-center"
          onPress={handleSubmit}
        >
          <StyledText className="text-white font-bold text-lg">
            Register Barangay
          </StyledText>
        </StyledTouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
