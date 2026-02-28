import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
  ScrollView
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const EvacuationMapView = ({
  visible,
  onClose,
  mode = "view",
  municipality,
  barangayName,
  evacuationLocations = [],
  selectedEvacuation = null,
  onLocationSelect,
  onEvacuationSelect,
  initialLocation = null,
}) => {
  const webViewRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [isMapReady, setIsMapReady] = useState(false);

  const biliranBounds = {
    north: 11.8,
    south: 11.4,
    west: 124.3,
    east: 124.6
  };

  const municipalityData = {
    "Almeria": { lat: 11.620590, lng: 124.381579 },
    "Biliran": { lat: 11.466732, lng: 124.474025 },
    "Cabucgayan": { lat: 11.473962, lng: 124.574919 },
    "Caibiran": { lat: 11.572213, lng: 124.581508 },
    "Culaba": { lat: 11.655504, lng: 124.540672 },
    "Kawayan": { lat: 11.679893, lng: 124.357463 },
    "Maripipi": { lat: 11.783, lng: 124.350 },
    "Naval (Capital)": { lat: 11.561925, lng: 124.396305 }
  };

  const generateMapHtml = () => {
    const biliranCenter = {
      lat: (biliranBounds.north + biliranBounds.south) / 2,
      lng: (biliranBounds.west + biliranBounds.east) / 2
    };
    
    let initialLat = biliranCenter.lat;
    let initialLng = biliranCenter.lng;
    let initialZoom = 10;
    
    if (municipality && municipalityData[municipality]) {
      initialLat = municipalityData[municipality].lat;
      initialLng = municipalityData[municipality].lng;
      initialZoom = mode === "select" ? 13 : 14;
    }

    // SAFE CHECK: Added optional chaining (?)
    if (selectedEvacuation?.location?.latitude && selectedEvacuation?.location?.longitude) {
      initialLat = selectedEvacuation.location.latitude;
      initialLng = selectedEvacuation.location.longitude;
      initialZoom = 15;
    }

    // SAFE CHECK: For selection mode
    if (mode === "select" && selectedLocation?.latitude) {
      initialLat = selectedLocation.latitude;
      initialLng = selectedLocation.longitude;
      initialZoom = 15;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { width: 100%; height: 100%; overflow: hidden; }
          #map { height: 100vh; width: 100%; }
          .evacuation-marker { background-color: #f97316; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
          .selected-evacuation-marker { background-color: #ef4444; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
          .selection-marker { background-color: #10b981; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; }
          .municipality-marker { background-color: #0891B2; border-radius: 50%; border: 2px solid white; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          let map;
          let selectionMarker = null;
          const evacuationLocations = ${JSON.stringify(evacuationLocations.filter(loc => loc?.location?.latitude))};
          
          function initializeMap() {
            map = L.map('map').setView([${initialLat}, ${initialLng}], ${initialZoom});
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

            // Add evacuation markers safely
            evacuationLocations.forEach((evac, index) => {
              if(!evac.location || !evac.location.latitude) return;
              
              const isSelected = ${selectedEvacuation ? `"${selectedEvacuation._id}" === evac._id` : 'false'};
              L.marker([evac.location.latitude, evac.location.longitude], {
                icon: L.divIcon({
                  className: isSelected ? 'selected-evacuation-marker' : 'evacuation-marker',
                  html: '<span>' + (index + 1) + '</span>',
                  iconSize: isSelected ? [30, 30] : [24, 24]
                })
              }).addTo(map).bindPopup("<b>" + evac.evacuationName + "</b>");
            });

            if("${mode}" === "select") {
              map.on('click', function(e) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'location_selected',
                  latitude: e.latlng.lat,
                  longitude: e.latlng.lng
                }));
              });
            }
          }
          document.addEventListener('DOMContentLoaded', initializeMap);
        </script>
      </body>
      </html>
    `;
  };

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'location_selected') {
        setSelectedLocation(data);
        if (onLocationSelect) onLocationSelect(data);
      }
    } catch (e) { console.error(e); }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="h-[85%] bg-white rounded-t-3xl overflow-hidden">
          {/* Header */}
          <View className="px-6 pt-4 pb-3 border-b border-gray-100 flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-bold">{mode === "select" ? "Select Location" : "Map View"}</Text>
              <Text className="text-gray-500 text-sm">{barangayName || municipality || "Biliran"}</Text>
            </View>
            <TouchableOpacity onPress={onClose}><MaterialIcons name="close" size={24} /></TouchableOpacity>
          </View>

          {/* Map */}
          <View className="flex-1">
            <WebView
              ref={webViewRef}
              source={{ html: generateMapHtml() }}
              onMessage={handleWebViewMessage}
              javaScriptEnabled
            />
          </View>

          {/* Bottom Panel */}
          <View className="p-6 bg-white shadow-lg">
            {selectedEvacuation ? (
              <View className="mb-4">
                <Text className="font-bold text-lg">{selectedEvacuation.evacuationName || "Center Details"}</Text>
                <Text className="text-gray-600">{selectedEvacuation?.location?.address || "No address"}</Text>
              </View>
            ) : mode === "select" && selectedLocation ? (
              <View className="mb-4 p-3 bg-green-50 rounded-lg">
                <Text className="text-green-700 font-medium">Selected: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}</Text>
              </View>
            ) : null}

            <TouchableOpacity 
              className="bg-cyan-600 p-4 rounded-xl items-center" 
              onPress={() => {
                if(mode === "select" && selectedLocation) onLocationSelect(selectedLocation);
                onClose();
              }}
            >
              <Text className="text-white font-bold">{mode === "select" ? "Confirm Location" : "Close"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EvacuationMapView;