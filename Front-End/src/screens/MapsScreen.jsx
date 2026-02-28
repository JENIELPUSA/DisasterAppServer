import { View } from "react-native";
import NavigationMap from "../components/modals/Map/NavigationMap";
import { EvacuationDisplayContext } from "../contexts/EvacuationContext/EvacuationContext";
import { BarangayDisplayContext } from "../contexts/BrgyContext/BarangayContext";
import { HouseholdContext } from "../contexts/HouseholdLeadContext/HouseholdContext";
import { IncidentReportContext } from "../contexts/IncidentReportContext/IncidentReportContext";
import { useContext, useEffect, useState } from "react";
import * as Location from "expo-location";

export default function MapsScreen() {
  const { fetchNearbyEvacuations, nearEvacuations } = useContext(
    EvacuationDisplayContext
  );
  const { dropdownhousehold, displayDropdownInMaps } = useContext(
    BarangayDisplayContext
  );

  const { fetchReports, reports } = useContext(IncidentReportContext);
  const [currentLocation, setCurrentLocation] = useState(null);
  const { getHouseholdLeadsByBarangayId, PinpointHousehold } =
    useContext(HouseholdContext);
  const [selectedDestination, setSelectedDestination] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // 1. Kunin ang Permissions
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.log("❌ Permission denied");
          return;
        }

        // 2. Kunin ang Current Position
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const { latitude, longitude } = location.coords;
        setCurrentLocation({ latitude, longitude });

        // 3. Sabay na tawagin ang Evacuations at Incident Reports
        // Maaari kang magpasa ng empty strings o default filters sa fetchReports
        await Promise.all([
          fetchNearbyEvacuations({ latitude, longitude }),
          fetchReports("", 1, ""), // search, page, reportTypeFilter
        ]);
      } catch (error) {
        console.log("🚨 Initialization error:", error);
      }
    })();
  }, []); // Tatakbo lang ito pag-mount ng component


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
        incidentReports={reports} // I-pass ang reports para maging markers sa map
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
