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

    if (selectedEvacuation) {
      initialLat = selectedEvacuation.location.latitude;
      initialLng = selectedEvacuation.location.longitude;
      initialZoom = 15;
    }

    if (mode === "select" && selectedLocation) {
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
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html, body {
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          
          #map { 
            height: 100vh; 
            width: 100%; 
          }
          
          .leaflet-container {
            background: #f8f9fa;
          }
          
          .biliran-bounds {
            border: 3px solid #ef4444;
            background-color: rgba(239, 68, 68, 0.1);
            border-radius: 5px;
          }
          
          /* FIXED MARKER STYLES - Proper positioning */
          .municipality-marker {
            position: absolute;
            background-color: #0891B2;
            border-radius: 50%;
            width: 12px;
            height: 12px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            transform: translate(-50%, -50%);
          }
          
          .evacuation-marker {
            position: absolute;
            background-color: #f97316;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            transform: translate(-50%, -50%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 10px;
          }
          
          .selected-evacuation-marker {
            position: absolute;
            background-color: #ef4444;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
            transform: translate(-50%, -50%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            animation: pulse 2s infinite;
          }
          
          .selection-marker {
            position: absolute;
            background-color: #10b981;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.5);
            transform: translate(-50%, -50%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.1); }
            100% { transform: translate(-50%, -50%) scale(1); }
          }
          
          .info-panel {
            position: absolute;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background-color: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            border: 1px solid #ddd;
          }
          
          .info-title {
            font-weight: bold;
            color: #0891B2;
            margin-bottom: 5px;
            font-size: 16px;
          }
          
          .info-text {
            color: #666;
            font-size: 14px;
            line-height: 1.4;
          }
          
          .legend {
            position: absolute;
            top: 20px;
            right: 20px;
            background-color: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            border: 1px solid #ddd;
            max-width: 200px;
          }
          
          .legend-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
          }
          
          .legend-color {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            margin-right: 10px;
          }
          
          .legend-text {
            font-size: 12px;
            color: #666;
          }
          
          .leaflet-popup-content-wrapper {
            border-radius: 8px;
          }
          
          .leaflet-popup-content {
            margin: 12px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        ${mode === "view" ? `
          <div class="legend">
            <div class="legend-item">
              <div class="legend-color" style="background-color: #0891B2;"></div>
              <span class="legend-text">Municipality</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #f97316;"></div>
              <span class="legend-text">Evacuation Center</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #ef4444;"></div>
              <span class="legend-text">Selected Evacuation</span>
            </div>
          </div>
        ` : ''}
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          let map;
          let selectionMarker = null;
          const bounds = [
            [${biliranBounds.north}, ${biliranBounds.west}],
            [${biliranBounds.south}, ${biliranBounds.east}]
          ];
          
          const evacuationLocations = ${JSON.stringify(evacuationLocations)};
          const selectedEvacuation = ${selectedEvacuation ? JSON.stringify(selectedEvacuation) : 'null'};
          const municipality = ${municipality ? `"${municipality}"` : 'null'};
          const mode = "${mode}";
          const initialSelection = ${selectedLocation ? JSON.stringify(selectedLocation) : 'null'};
          
          function initializeMap() {
            // Initialize map with canvas rendering for better performance
            map = L.map('map', {
              preferCanvas: true,
              zoomControl: true,
              attributionControl: false
            }).setView([${initialLat}, ${initialLng}], ${initialZoom});
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
              maxZoom: 19,
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            
            L.rectangle(bounds, {
              className: 'biliran-bounds',
              color: '#ef4444',
              weight: 3,
              fillOpacity: 0.1
            }).addTo(map);
            
            ${!municipality ? `
              const municipalities = {
                ${Object.entries(municipalityData).map(([name, coords]) => 
                  `"${name}": [${coords.lat}, ${coords.lng}]`
                ).join(',\n')}
              };
              
              Object.keys(municipalities).forEach(mun => {
                const coords = municipalities[mun];
                const marker = L.marker(coords, {
                  icon: L.divIcon({
                    className: 'municipality-marker',
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                    popupAnchor: [0, -8]
                  })
                }).addTo(map);
                
                marker.bindTooltip(mun, {
                  permanent: false,
                  direction: 'top',
                  className: 'municipality-tooltip'
                });
              });
            ` : ''}
            
            ${municipality ? `
              const munCoords = [${municipalityData[municipality].lat}, ${municipalityData[municipality].lng}];
              L.marker(munCoords, {
                icon: L.divIcon({
                  className: 'municipality-marker',
                  iconSize: [16, 16],
                  iconAnchor: [8, 8],
                  popupAnchor: [0, -8]
                })
              }).addTo(map).bindTooltip("${municipality}", {
                permanent: true,
                direction: 'top',
                className: 'municipality-tooltip'
              });
            ` : ''}
            
            ${mode === "view" ? `
              evacuationLocations.forEach((evac, index) => {
                const isSelected = selectedEvacuation && selectedEvacuation._id === evac._id;
                
                // FIXED: Correct icon sizes and anchors
                const iconSize = isSelected ? [34, 34] : [26, 26];
                const iconAnchor = isSelected ? [17, 17] : [13, 13];
                
                const marker = L.marker([evac.location.latitude, evac.location.longitude], {
                  icon: L.divIcon({
                    className: isSelected ? 'selected-evacuation-marker' : 'evacuation-marker',
                    iconSize: iconSize,
                    iconAnchor: iconAnchor,
                    popupAnchor: [0, -15],
                    html: \`<span>\${index + 1}</span>\`
                  })
                }).addTo(map);
                
                let statusColor = '#6B7280';
                if(evac.status) {
                  switch(evac.status) {
                    case 'Full': statusColor = '#EF4444'; break;
                    case 'High': statusColor = '#F97316'; break;
                    case 'Available': statusColor = '#10B981'; break;
                  }
                }
                
                if(evac.evacuationCapacity) {
                  L.circle([evac.location.latitude, evac.location.longitude], {
                    color: statusColor,
                    fillColor: statusColor,
                    fillOpacity: 0.2,
                    radius: evac.evacuationCapacity * 0.5
                  }).addTo(map);
                }
                
                marker.bindPopup(
                  \`<b>\${evac.evacuationName.split(',')[0]}</b><br>
                  \${evac.status ? '<b>Status:</b> ' + evac.status + '<br>' : ''}
                  \${evac.evacuationCapacity ? '<b>Capacity:</b> ' + (evac.currentEvacuation || 0) + '/' + evac.evacuationCapacity + '<br>' : ''}
                  \${evac.availableCapacity ? '<b>Available:</b> ' + evac.availableCapacity + ' spots<br>' : ''}
                  \${evac.contactPerson ? '<b>Contact:</b> ' + evac.contactPerson.name + '<br>' : ''}
                  <button onclick="selectEvacuation('\${evac._id}')" style="background-color: #0891B2; color: white; border: none; padding: 5px 10px; border-radius: 5px; margin-top: 5px; cursor: pointer;">
                    View Details
                  </button>\`
                );

              });
            ` : ''}
            
            ${mode === "select" ? `
              if(initialSelection) {
                addSelectionMarker(initialSelection.latitude, initialSelection.longitude);
              }
              
              map.on('click', function(e) {
                const lat = e.latlng.lat;
                const lng = e.latlng.lng;
                
                if(lat < ${biliranBounds.south} || lat > ${biliranBounds.north} || 
                   lng < ${biliranBounds.west} || lng > ${biliranBounds.east}) {
                  alert("Please select a location within Biliran Province (red rectangle area).");
                  return;
                }
                
                addSelectionMarker(lat, lng);
              });
            ` : ''}
            
            window.addSelectionMarker = function(lat, lng) {
              if(lat < ${biliranBounds.south} || lat > ${biliranBounds.north} || 
                 lng < ${biliranBounds.west} || lng > ${biliranBounds.east}) {
                alert("Location is outside Biliran Province. Please select within red rectangle.");
                return false;
              }
              
              if (selectionMarker) {
                map.removeLayer(selectionMarker);
              }
              
              // FIXED: Correct icon size and anchor for selection marker
              selectionMarker = L.marker([lat, lng], {
                draggable: true,
                icon: L.divIcon({
                  className: 'selection-marker',
                  iconSize: [34, 34],
                  iconAnchor: [17, 17],
                  popupAnchor: [0, -20],
                  html: '📍'
                })
              }).addTo(map);
              
              selectionMarker.bindPopup(
                "<b>Selected Location</b><br>" +
                "Lat: " + lat.toFixed(6) + "<br>" +
                "Lng: " + lng.toFixed(6) + "<br>" +
                "<i>Drag to adjust position</i>"
              ).openPopup();
              
              selectionMarker.on('dragend', function(event) {
                const marker = event.target;
                const position = marker.getLatLng();
                
                window.ReactNativeWebView.postMessage(JSON.stringify({ 
                  type: 'location_updated',
                  latitude: position.lat, 
                  longitude: position.lng 
                }));
              });
              
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                type: 'location_selected',
                latitude: lat, 
                longitude: lng 
              }));
              
              map.panTo([lat, lng]);
              
              return true;
            };
            
            window.selectEvacuation = function(evacuationId) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                type: 'evacuation_selected',
                evacuationId: evacuationId
              }));
            };
            
            ${!municipality && !selectedEvacuation && mode !== "select" ? `
              map.fitBounds(bounds, { padding: [50, 50] });
            ` : ''}
            
            setTimeout(() => {
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                type: 'map_ready'
              }));
            }, 500);
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
      
      switch (data.type) {
        case 'location_selected':
          setSelectedLocation({
            latitude: data.latitude,
            longitude: data.longitude
          });
          
          if (onLocationSelect) {
            onLocationSelect({
              latitude: data.latitude,
              longitude: data.longitude
            });
          }
          break;
          
        case 'location_updated':
          setSelectedLocation({
            latitude: data.latitude,
            longitude: data.longitude
          });
          
          if (onLocationSelect) {
            onLocationSelect({
              latitude: data.latitude,
              longitude: data.longitude
            });
          }
          break;
          
        case 'evacuation_selected':
          if (onEvacuationSelect) {
            onEvacuationSelect(data.evacuationId);
          }
          break;
          
        case 'map_ready':
          setIsMapReady(true);
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="h-[85%] bg-white rounded-t-3xl overflow-hidden">
          <View className="px-6 pt-4 pb-3 border-b border-gray-100 bg-white">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center">
                  <TouchableOpacity 
                    onPress={onClose}
                    className="mr-3"
                  >
                    <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
                  </TouchableOpacity>
                  <View>
                    <Text className="text-xl font-bold text-gray-800">
                      {mode === "select" ? "Select Location" : "Evacuation Centers Map"}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      {mode === "select" 
                        ? "Click on the map to select a location"
                        : `${barangayName || municipality || "Biliran Province"}`
                      }
                    </Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity 
                onPress={onClose}
                className="ml-2"
              >
                <MaterialIcons name="close" size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>
          </View>

          {mode === "view" && (
            <View className="px-6 py-3 bg-white border-b border-gray-100">
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-gray-700 font-medium">
                    {selectedEvacuation ? "Selected Evacuation Center" : "All Evacuation Centers"}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    Total: {evacuationLocations.length}
                  </Text>
                </View>
                
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    className="px-3 py-2 bg-cyan-100 rounded-lg flex-row items-center"
                    onPress={() => {
                      if (webViewRef.current && municipalityData[municipality]) {
                        const coords = municipalityData[municipality];
                        webViewRef.current.injectJavaScript(`
                          if (map) {
                            map.setView([${coords.lat}, ${coords.lng}], 14, {animate: true});
                          }
                        `);
                      }
                    }}
                  >
                    <MaterialIcons name="location-city" size={18} color="#0891B2" />
                    <Text className="text-cyan-700 font-medium text-xs ml-1">Municipality</Text>
                  </TouchableOpacity>
                  
                  {selectedEvacuation && (
                    <TouchableOpacity
                      className="px-3 py-2 bg-green-100 rounded-lg flex-row items-center"
                      onPress={() => {
                        if (webViewRef.current && selectedEvacuation) {
                          webViewRef.current.injectJavaScript(`
                            if (map) {
                              map.setView([${selectedEvacuation.location.latitude}, ${selectedEvacuation.location.longitude}], 16, {animate: true});
                            }
                          `);
                        }
                      }}
                    >
                      <MaterialIcons name="place" size={18} color="#059669" />
                      <Text className="text-green-700 font-medium text-xs ml-1">Evacuation</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}

          <View className="flex-1">
            <WebView
              ref={webViewRef}
              source={{ html: generateMapHtml() }}
              style={{ flex: 1 }}
              onMessage={handleWebViewMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              scalesPageToFit={false}  // Important: set to false
              mixedContentMode="always"
              androidHardwareAccelerationDisabled={false}
            />
          </View>

          <View className="absolute bottom-4 left-4 right-4">
            <View className="bg-white rounded-xl p-4 shadow-lg">
              {mode === "select" ? (
                <>
                  <Text className="text-gray-800 font-bold text-base mb-2">
                    Select Location
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    className="mb-3"
                  >
                    <View className="flex-row">
                      <View className="mr-3 p-2 bg-cyan-50 rounded-lg">
                        <Text className="text-cyan-700 text-xs font-medium">1. Click on map</Text>
                        <Text className="text-cyan-600 text-xs">Select within red rectangle</Text>
                      </View>
                      <View className="mr-3 p-2 bg-cyan-50 rounded-lg">
                        <Text className="text-cyan-700 text-xs font-medium">2. Drag marker</Text>
                        <Text className="text-cyan-600 text-xs">Adjust position if needed</Text>
                      </View>
                      <View className="p-2 bg-cyan-50 rounded-lg">
                        <Text className="text-cyan-700 text-xs font-medium">3. Save location</Text>
                        <Text className="text-cyan-600 text-xs">Coordinates auto-saved</Text>
                      </View>
                    </View>
                  </ScrollView>
                  
                  {selectedLocation && (
                    <View className="mb-3 p-3 bg-green-50 rounded-lg">
                      <Text className="text-green-700 font-medium text-sm">Selected Location:</Text>
                      <View className="flex-row justify-between mt-1">
                        <Text className="text-green-600 text-xs">
                          Lat: {selectedLocation.latitude.toFixed(6)}
                        </Text>
                        <Text className="text-green-600 text-xs">
                          Lng: {selectedLocation.longitude.toFixed(6)}
                        </Text>
                      </View>
                    </View>
                  )}
                  
                  <View className="flex-row space-x-3">
                    <TouchableOpacity
                      className="flex-1 px-4 py-3 bg-gray-200 rounded-lg items-center"
                      onPress={onClose}
                    >
                      <Text className="text-gray-700 font-medium">Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      className="flex-1 px-4 py-3 bg-green-600 rounded-lg items-center"
                      onPress={() => {
                        if (selectedLocation && onLocationSelect) {
                          onLocationSelect(selectedLocation);
                        }
                        onClose();
                      }}
                      disabled={!selectedLocation}
                      style={{ opacity: selectedLocation ? 1 : 0.5 }}
                    >
                      <Text className="text-white font-medium">Use Location</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text className="text-gray-800 font-bold text-base mb-2">
                    {selectedEvacuation 
                      ? selectedEvacuation.location.address.split(',')[0]
                      : "Evacuation Centers Map"
                    }
                  </Text>
                  
                  {selectedEvacuation ? (
                    <View className="mb-3">
                      <View className="flex-row items-center mb-1">
                        <View className="w-3 h-3 rounded-full mr-2" 
                          style={{ 
                            backgroundColor: 
                              selectedEvacuation.status === 'Available' ? '#10B981' :
                              selectedEvacuation.status === 'High' ? '#F97316' :
                              selectedEvacuation.status === 'Full' ? '#EF4444' : "#6B7280"
                          }} 
                        />
                        <Text className="text-gray-600 text-sm">
                          Status: {selectedEvacuation.status || "Unknown"}
                        </Text>
                      </View>
                      <Text className="text-gray-600 text-sm">
                        Capacity: {selectedEvacuation.currentEvacuation || 0}/{selectedEvacuation.evacuationCapacity || "N/A"} 
                        {selectedEvacuation.availableCapacity && 
                          ` (${selectedEvacuation.availableCapacity} available)`}
                      </Text>
                      {selectedEvacuation.contactPerson && (
                        <Text className="text-gray-600 text-sm mt-1">
                          Contact: {selectedEvacuation.contactPerson.name}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <View className="mb-3">
                      <Text className="text-gray-600 text-sm mb-2">
                        Tap on any evacuation center marker to view details
                      </Text>
                      <View className="flex-row justify-between">
                        <View className="flex-row items-center">
                          <View className="w-3 h-3 rounded-full bg-green-500 mr-1" />
                          <Text className="text-gray-600 text-xs">Available</Text>
                        </View>
                        <View className="flex-row items-center">
                          <View className="w-3 h-3 rounded-full bg-yellow-500 mr-1" />
                          <Text className="text-gray-600 text-xs">High</Text>
                        </View>
                        <View className="flex-row items-center">
                          <View className="w-3 h-3 rounded-full bg-red-500 mr-1" />
                          <Text className="text-gray-600 text-xs">Full</Text>
                        </View>
                      </View>
                    </View>
                  )}
                  
                  <TouchableOpacity
                    className="px-4 py-3 bg-cyan-600 rounded-lg items-center"
                    onPress={onClose}
                  >
                    <Text className="text-white font-medium">Close Map</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EvacuationMapView;