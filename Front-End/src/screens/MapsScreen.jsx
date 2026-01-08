import { View } from "react-native";
import NavigationMap from "../components/modals/Map/NavigationMap";
import { EvacuationDisplayContext } from "../contexts/EvacuationContext/EvacuationContext";
import { BarangayDisplayContext } from "../contexts/BrgyContext/BarangayContext";
import { HouseholdContext } from "../contexts/HouseholdLeadContext/HouseholdContext";
import { useContext, useEffect, useState } from "react";
import * as Location from "expo-location";

export default function MapsScreen() {
  const { fetchNearbyEvacuations, nearEvacuations } = useContext(
    EvacuationDisplayContext
  );
  const { dropdownhousehold, displayDropdownInMaps } = useContext(
    BarangayDisplayContext
  );
  const [currentLocation, setCurrentLocation] = useState(null);
  const { getHouseholdLeadsByBarangayId, PinpointHousehold } =
    useContext(HouseholdContext);

  // 1. Add state to store the selected destination
  const [selectedDestination, setSelectedDestination] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.log("❌ Permission denied");
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const { latitude, longitude } = location.coords;
        await fetchNearbyEvacuations({ latitude, longitude });
        setCurrentLocation({ latitude, longitude });
      } catch (error) {
        console.log("🚨 Location error:", error);
      }
    })();
  }, []);

  // 2. Define the missing function
  const handleSelectDestination = (coords) => {
    console.log("Setting destination to:", coords);
    setSelectedDestination(coords);
  };

  return (
    <View className="flex-1 bg-black">
      <NavigationMap
        evacuations={nearEvacuations}
        navigationMode={true}
        userLocation={currentLocation}
        destination={selectedDestination}
        onSelectDestination={handleSelectDestination}
        displayDropdownInMaps={displayDropdownInMaps}
        dropdownhousehold={dropdownhousehold}
        getHouseholdLeadsByBarangayId={getHouseholdLeadsByBarangayId}
        PinpointHousehold={PinpointHousehold}
      />
    </View>
  );
}
