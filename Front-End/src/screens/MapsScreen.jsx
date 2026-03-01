import { View } from "react-native";
import NavigationMap from "../components/modals/Map/NavigationMap";
import { EvacuationDisplayContext } from "../contexts/EvacuationContext/EvacuationContext";
import { BarangayDisplayContext } from "../contexts/BrgyContext/BarangayContext";
import { HouseholdContext } from "../contexts/HouseholdLeadContext/HouseholdContext";
import { IncidentReportContext } from "../contexts/IncidentReportContext/IncidentReportContext";
import { useContext, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";

export default function MapsScreen() {
  const { fetchNearbyEvacuations, nearEvacuations } = useContext(
    EvacuationDisplayContext
  );

  const { dropdownhousehold, displayDropdownInMaps } = useContext(
    BarangayDisplayContext
  );

  const { fetchReports, reports } = useContext(IncidentReportContext);

  const { getHouseholdLeadsByBarangayId, PinpointHousehold } =
    useContext(HouseholdContext);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);

  // 🔥 Runs EVERY TIME screen is focused
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const initialize = async () => {
        try {
          const { status } =
            await Location.requestForegroundPermissionsAsync();

          if (status !== "granted") {
            console.log("❌ Permission denied");
            return;
          }

          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

          if (!isActive) return;

          const { latitude, longitude } = location.coords;

          setCurrentLocation({ latitude, longitude });

          await Promise.all([
            fetchNearbyEvacuations({ latitude, longitude }),
            fetchReports("", 1, ""),
          ]);

        } catch (error) {
          console.log("🚨 Initialization error:", error);
        }
      };

      initialize();

      // Cleanup kapag umalis sa screen
      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleSelectDestination = (coords) => {
    if (coords?.location) {
      setSelectedDestination({
        latitude: coords.location.latitude,
        longitude: coords.location.longitude,
      });
    } else {
      setSelectedDestination(coords);
    }
  };

  const handleStopNavigation = () => {
    setSelectedDestination(null);
  };

  return (
    <View className="flex-1 bg-black">
      <NavigationMap
        evacuations={nearEvacuations}
        incidentReports={reports}
        navigationMode={true}
        userLocation={currentLocation}
        destination={selectedDestination}
        onSelectDestination={handleSelectDestination}
        onStopNavigation={handleStopNavigation}
        displayDropdownInMaps={displayDropdownInMaps}
        dropdownhousehold={dropdownhousehold}
        getHouseholdLeadsByBarangayId={getHouseholdLeadsByBarangayId}
        PinpointHousehold={PinpointHousehold}
      />
    </View>
  );
}