import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
  StyleSheet,
  Switch,
} from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from 'expo-location';

export default function RegisterBarangayForm({ 
  addBarangay, 
  onClose, 
  visible, 
  selectedMunicipality, 
  initialData = null,
  isEditing = false,
  onSubmit
}) {
  const [barangayName, setBarangayName] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [marker, setMarker] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedMunicipalityInternal, setSelectedMunicipalityInternal] = useState("");
  const [mapHtml, setMapHtml] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [isMapReady, setIsMapReady] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const webViewRef = useRef(null);
  const { width, height } = Dimensions.get("window");
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

  const municipalities = Object.keys(municipalityData);

  // UPDATED: Populate form when editing
  useEffect(() => {
    if (visible) {
      if (isEditing && initialData) {
        setBarangayName(initialData.barangayName || "");
        setSelectedMunicipalityInternal(initialData.municipality || "");
        
        // Handle coordinates - they might be stored differently
        if (initialData.coordinates) {
          setMarker({
            latitude: initialData.coordinates.latitude || initialData.coordinates.lat,
            longitude: initialData.coordinates.longitude || initialData.coordinates.lng,
            address: initialData.fullAddress || ""
          });
          setFullAddress(initialData.fullAddress || "");
        } else if (initialData.latitude && initialData.longitude) {
          setMarker({
            latitude: initialData.latitude,
            longitude: initialData.longitude,
            address: initialData.fullAddress || ""
          });
          setFullAddress(initialData.fullAddress || "");
        }
        
        validateField('municipality', initialData.municipality || "");
      } else {
        // Reset form for adding new barangay
        resetForm();
        if (selectedMunicipality) {
          const municipalityName = selectedMunicipality.name || selectedMunicipality;
          setSelectedMunicipalityInternal(municipalityName);
          validateField('municipality', municipalityName);
        }
      }
    }
  }, [visible, isEditing, initialData, selectedMunicipality]);

  // Calculate current step
  useEffect(() => {
    let step = 0;
    if (barangayName.trim()) step = 1;
    if (selectedMunicipalityInternal) step = 2;
    if (marker) step = 3;
    setCurrentStep(step);
  }, [barangayName, selectedMunicipalityInternal, marker]);

  const getCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to use GPS. Please enable it in your device settings.",
          [{ text: "OK" }]
        );
        setIsGettingLocation(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });
      const { latitude, longitude } = location.coords;
      const biliranBounds = {
        north: 11.85,
        south: 11.40,
        west: 124.30,
        east: 124.65
      };
      if (
        latitude < biliranBounds.south || 
        latitude > biliranBounds.north || 
        longitude < biliranBounds.west || 
        longitude > biliranBounds.east
      ) {
        Alert.alert(
          "Out of Range",
          "Your current location is outside Biliran Province. Please select a location within the red rectangle area on the map.",
          [{ text: "OK" }]
        );
        setIsGettingLocation(false);
        return;
      }
      setUserLocation({ latitude, longitude });
      if (webViewRef.current && isMapReady) {
        webViewRef.current.injectJavaScript(`
          if (typeof setMarkerFromGPS === 'function') {
            setMarkerFromGPS(${latitude}, ${longitude});
          }
        `);
      } else {
        Alert.alert(
          "Map Not Ready",
          "The map is still loading. Please wait a moment and try again.",
          [{ text: "OK" }]
        );
      }
      setIsGettingLocation(false);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert(
        "Location Error",
        "Unable to get your current location. Please try again or select location manually.",
        [{ text: "OK" }]
      );
      setIsGettingLocation(false);
    }
  };

  const toggleGPS = () => {
    if (gpsEnabled) {
      setGpsEnabled(false);
      setUserLocation(null);
    } else {
      setGpsEnabled(true);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!barangayName.trim()) {
      errors.barangayName = "Please enter Barangay Name.";
    }
    if (!selectedMunicipalityInternal) {
      errors.municipality = "Please select a Municipality.";
    }
    if (!fullAddress.trim() || !marker) {
      errors.location = "Please select a location on the map.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateField = (field, value) => {
    const errors = { ...formErrors };
    switch (field) {
      case 'barangayName':
        errors.barangayName = !value.trim() ? 'Please enter Barangay Name.' : '';
        break;
      case 'municipality':
        errors.municipality = !value ? 'Please select a Municipality.' : '';
        break;
      case 'location':
        errors.location = !value ? 'Please select a location on the map.' : '';
        break;
    }
    setFormErrors(errors);
  };

  const FormProgress = () => {
    const steps = ['Barangay', 'Municipality', 'Location', 'Review'];
    return (
      <View className="px-6 pt-5">
        <Text className="text-gray-600 text-sm font-medium mb-4">
          Step {currentStep + 1} of {steps.length}
        </Text>
        <View className="flex-row mb-1">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <View className="flex-1 items-center">
                <View className={`w-8 h-8 rounded-full items-center justify-center ${
                  index <= currentStep ? 'bg-cyan-600' : 'bg-gray-200'
                }`}>
                  {index < currentStep ? (
                    <MaterialIcons name="check" size={16} color="white" />
                  ) : (
                    <Text className={`font-bold ${
                      index <= currentStep ? 'text-white' : 'text-gray-500'
                    }`}>
                      {index + 1}
                    </Text>
                  )}
                </View>
              </View>
              {index < steps.length - 1 && (
                <View className={`flex-1 h-1 mt-3.5 ${
                  index < currentStep ? 'bg-cyan-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </View>
        <View className="flex-row mb-6">
          {steps.map((step, index) => (
            <View key={step} className="flex-1 items-center">
              <Text className={`text-xs font-medium mt-1.5 ${
                index <= currentStep ? 'text-cyan-600' : 'text-gray-400'
              }`}>
                {step}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const biliranBounds = {
    north: 11.85,
    south: 11.40,
    west: 124.30,
    east: 124.65
  };

  const generateMapHtml = (municipality = null) => {
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
      initialZoom = 14;
    }
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
        <style>
          #map { height: 100vh; width: 100%; }
          .biliran-bounds {
            border: 3px solid #ef4444;
            background-color: rgba(239, 68, 68, 0.1);
            border-radius: 5px;
          }
          .municipality-marker {
            background-color: #0891B2;
            border-radius: 50%;
            width: 12px;
            height: 12px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          .gps-marker {
            background-color: #10b981;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.5);
            animation: pulse 2s infinite;
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
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <script>
          let map;
          let selectedMarker = null;
          let gpsMarker = null;
          const bounds = [
            [${biliranBounds.north}, ${biliranBounds.west}],
            [${biliranBounds.south}, ${biliranBounds.east}]
          ];
          function initializeMap() {
            map = L.map('map').setView([${initialLat}, ${initialLng}], ${initialZoom});
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
                ).join(',')}
              };
              Object.keys(municipalities).forEach(mun => {
                const coords = municipalities[mun];
                const marker = L.marker(coords, {
                  icon: L.divIcon({
                    className: 'municipality-marker',
                    iconSize: [16, 16]
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
                  iconSize: [20, 20]
                })
              }).addTo(map).bindTooltip("${municipality}", {
                permanent: true,
                direction: 'top',
                className: 'municipality-tooltip'
              });
            ` : ''}
            map.on('click', function(e) {
              const lat = e.latlng.lat;
              const lng = e.latlng.lng;
              if(lat < ${biliranBounds.south} || lat > ${biliranBounds.north} || 
                 lng < ${biliranBounds.west} || lng > ${biliranBounds.east}) {
                alert("Please select a location within Biliran Province (red rectangle area).");
                return;
              }
              setBarangayMarker(lat, lng);
            });
            window.setBarangayMarker = function(lat, lng) {
              if(lat < ${biliranBounds.south} || lat > ${biliranBounds.north} || 
                 lng < ${biliranBounds.west} || lng > ${biliranBounds.east}) {
                alert("Location is outside Biliran Province. Please select within red rectangle.");
                return false;
              }
              if (selectedMarker) {
                map.removeLayer(selectedMarker);
              }
              selectedMarker = L.marker([lat, lng], {
                draggable: true,
                icon: L.icon({
                  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                  iconSize: [30, 41],
                  iconAnchor: [15, 41],
                  popupAnchor: [1, -34]
                })
              }).addTo(map);
              selectedMarker.bindPopup(
                "<b>Barangay Location</b><br>" +
                "Lat: " + lat.toFixed(6) + "<br>" +
                "Lng: " + lng.toFixed(6) + "<br>" +
                "<i>Drag to adjust position</i>"
              ).openPopup();
              selectedMarker.on('dragend', function(event) {
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
            window.setMarkerFromGPS = function(lat, lng) {
              if (window.setBarangayMarker(lat, lng)) {
                if (gpsMarker) {
                  map.removeLayer(gpsMarker);
                }
                gpsMarker = L.marker([lat, lng], {
                  icon: L.divIcon({
                    className: 'gps-marker',
                    iconSize: [26, 26]
                  })
                }).addTo(map);
                gpsMarker.bindTooltip("Your Current Location", {
                  permanent: false,
                  direction: 'top',
                  className: 'gps-tooltip'
                });
              }
            };
            ${!municipality ? `
              map.fitBounds(bounds, { padding: [50, 50] });
            ` : ''}
            setTimeout(() => {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'map_ready' }));
            }, 500);
          }
          document.addEventListener('DOMContentLoaded', initializeMap);
        </script>
      </body>
      </html>
    `;
  };

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  const handleMunicipalitySelect = (mun) => {
    setSelectedMunicipalityInternal(mun);
    validateField('municipality', mun);
  };

  const openMapForMunicipality = () => {
    if (!selectedMunicipalityInternal) {
      Alert.alert("Select Municipality", "Please select a municipality first.");
      return;
    }
    if (!barangayName.trim()) {
      Alert.alert("Enter Barangay Name", "Please enter the barangay name before pinning location.");
      return;
    }
    const html = generateMapHtml(selectedMunicipalityInternal);
    setMapHtml(html);
    setShowMap(true);
    setIsMapReady(false);
  };

  const handleSelectFromWebView = async (data) => {
    if (data.type === 'map_ready') {
      setIsMapReady(true);
      return;
    }
    if (data.type === 'location_selected' || data.type === 'location_updated') {
      const { latitude, longitude } = data;
      try {
        if (!selectedMunicipalityInternal) {
          Alert.alert("Error", "No municipality selected. Please select a municipality first.");
          return;
        }
        const result = await reverseGeocode(latitude, longitude);
        const fullAddressText = buildFullAddress(barangayName, selectedMunicipalityInternal, result.addressDetails);
        setMarker({ 
          latitude, 
          longitude, 
          address: fullAddressText,
          municipality: selectedMunicipalityInternal,
          barangay: barangayName
        });
        setFullAddress(fullAddressText);
        validateField('location', 'selected');
        if (data.type === 'location_selected') {
          Alert.alert(
            "Location Pinned",
            `Barangay: ${barangayName}
Municipality: ${selectedMunicipalityInternal}
Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
You can drag the marker to adjust the position.`,
            [{ 
              text: "OK", 
              onPress: () => {}
            }]
          );
        }
      } catch (error) {
        console.error("Error selecting location:", error);
        Alert.alert("Error", "Failed to select location. Please try again.");
      }
    }
  };

  const buildFullAddress = (barangay, municipality, addressDetails) => {
    const street = addressDetails?.road || addressDetails?.neighbourhood || "";
    const village = addressDetails?.village || addressDetails?.suburb || "";
    const town = addressDetails?.town || addressDetails?.city || municipality;
    const addressParts = [];
    if (street) addressParts.push(street);
    if (barangay && barangay.trim()) {
      addressParts.push(`Barangay ${barangay.trim()}`);
    } else if (village) {
      addressParts.push(village);
    }
    if (town) addressParts.push(town);
    addressParts.push("Biliran", "Philippines");
    return addressParts.filter(Boolean).join(", ");
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        format: "json",
        addressdetails: 1,
        zoom: 16,
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
        headers: { 
          'User-Agent': 'SagipBayanApp/1.0 (sagipbayan.app@gmail.com)',
          'Accept': 'application/json' 
        }
      });
      const data = await response.json();
      return { addressDetails: data.address || {} };
    } catch (err) {
      console.error("Reverse geocode error:", err);
      return { addressDetails: {} };
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert(
        "Missing Information",
        "Please complete all required fields before submitting.",
        [{ text: "OK" }]
      );
      return;
    }

    const locationData = {
      barangayName: barangayName.trim(),
      municipality: selectedMunicipalityInternal,
      fullAddress: fullAddress.trim(),
      coordinates: { 
        latitude: marker.latitude, 
        longitude: marker.longitude 
      },
      dateAdded: new Date().toISOString()
    };

    // If editing, include the ID
    if (isEditing && initialData) {
      locationData.id = initialData._id || initialData.id;
    }

    Alert.alert(
      isEditing ? "Confirm Barangay Update" : "Confirm Barangay Registration",
      `Barangay: ${locationData.barangayName}
Municipality: ${locationData.municipality}
Full Address: ${locationData.fullAddress}
Coordinates: ${locationData.coordinates.latitude.toFixed(6)}, ${locationData.coordinates.longitude.toFixed(6)}`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: isEditing ? "Update Barangay" : "Save Barangay", 
          onPress: () => {
            if (isEditing && onSubmit) {
              // Call the onSubmit prop for editing
              onSubmit(locationData);
            } else if (addBarangay) {
              // Call the addBarangay prop for adding new
              addBarangay(locationData);
            }
            
            Alert.alert(
              "Success", 
              isEditing ? "Barangay updated successfully!" : "Barangay registered successfully!"
            );
            resetForm();
            if (onClose) onClose();
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setBarangayName("");
    setFullAddress("");
    setMarker(null);
    setSelectedMunicipalityInternal("");
    setMapHtml("");
    setCurrentStep(0);
    setFormErrors({});
    setIsMapReady(false);
    setGpsEnabled(false);
    setUserLocation(null);
  };

  const handleCancel = () => {
    resetForm();
    if (onClose) onClose();
  };

  const getSubmitButtonState = () => {
    if (!barangayName || !selectedMunicipalityInternal || !marker) {
      return { 
        bg: 'bg-gray-300', 
        text: 'Complete All Steps to Save',
        disabled: true
      };
    }
    return { 
      bg: 'bg-cyan-600', 
      text: isEditing ? 'Update Barangay Location' : 'Save Barangay Location',
      disabled: false
    };
  };

  const submitButtonState = getSubmitButtonState();

  const handleConfirmLocation = () => {
    if (!marker) {
      Alert.alert("No Location Selected", "Please select a location on the map first.");
      return;
    }
    setShowMap(false);
    Alert.alert(
      "Location Confirmed",
      `Location has been pinned for ${barangayName}. You can now save the barangay.`,
      [{ text: "OK" }]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={() => handleCancel()}
      statusBarTranslucent={false}
    >
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-6 pt-2 pb-3 border-b border-gray-100 bg-white">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-gray-800">
                {isEditing ? "Edit Barangay" : "Register Barangay"}
              </Text>
              <Text className="text-gray-500 text-sm mt-1">
                {isEditing 
                  ? `Editing ${barangayName || "barangay"}`
                  : selectedMunicipality 
                    ? `Adding barangay in ${selectedMunicipality.name || selectedMunicipality}` 
                    : "Add new barangay for emergency response"
                }
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleCancel}
              className="p-2 rounded-lg bg-gray-50"
            >
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        <FormProgress />

        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          <View className="px-6 mb-6">
            <View className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 rounded-full bg-cyan-100 items-center justify-center mr-3">
                  <MaterialIcons name="location-city" size={20} color="#0891B2" />
                </View>
                <Text className="text-lg font-semibold text-gray-800">
                  Barangay Information
                </Text>
              </View>
              <View className="mb-1">
                <Text className="text-gray-700 text-sm mb-2 font-medium">
                  Barangay Name *
                </Text>
                {formErrors.barangayName && (
                  <View className="flex-row items-center mb-2">
                    <MaterialIcons name="error-outline" size={16} color="#EF4444" />
                    <Text className="text-red-500 text-xs ml-1">{formErrors.barangayName}</Text>
                  </View>
                )}
                <TextInput 
                  value={barangayName} 
                  onChangeText={(text) => {
                    setBarangayName(text);
                    validateField('barangayName', text);
                  }} 
                  placeholder="Enter Barangay Name" 
                  className="bg-gray-50 rounded-lg px-4 py-3.5 border border-gray-200 text-base"
                  onBlur={() => validateField('barangayName', barangayName)}
                />
              </View>
            </View>
          </View>

          <View className="px-6 mb-6">
            <View className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 rounded-full bg-cyan-100 items-center justify-center mr-3">
                  <MaterialIcons name="map" size={20} color="#0891B2" />
                </View>
                <Text className="text-lg font-semibold text-gray-800">
                  Select Municipality
                </Text>
              </View>
              <View className="mb-1">
                <Text className="text-gray-700 text-sm mb-2 font-medium">
                  Municipality *
                </Text>
                {formErrors.municipality && (
                  <View className="flex-row items-center mb-2">
                    <MaterialIcons name="error-outline" size={16} color="#EF4444" />
                    <Text className="text-red-500 text-xs ml-1">{formErrors.municipality}</Text>
                  </View>
                )}
                <Text className="text-gray-500 text-xs mb-3">
                  {selectedMunicipality 
                    ? `Municipality pre-selected: ${selectedMunicipality.name || selectedMunicipality}`
                    : "Select a municipality for the barangay"}
                </Text>
                <View className="flex-row flex-wrap -mx-1">
                  {municipalities.map((mun) => (
                    <TouchableOpacity
                      key={mun}
                      onPress={() => handleMunicipalitySelect(mun)}
                      className={`px-4 py-2.5 rounded-lg m-1 border ${
                        selectedMunicipalityInternal === mun 
                          ? 'bg-cyan-600 border-cyan-600' 
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <Text className={`text-sm font-medium ${
                        selectedMunicipalityInternal === mun 
                          ? 'text-white' 
                          : 'text-gray-700'
                      }`}>
                        {mun}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {selectedMunicipalityInternal && (
                  <View className="mt-4 p-4 bg-cyan-50 rounded-lg border-l-4 border-cyan-500">
                    <View className="flex-row items-center">
                      <MaterialIcons name="check-circle" size={20} color="#0891B2" />
                      <View className="ml-3">
                        <Text className="text-sm text-gray-600">
                          Selected Municipality:
                        </Text>
                        <Text className="font-bold text-cyan-800 text-lg">
                          {selectedMunicipalityInternal}
                        </Text>
                        {selectedMunicipality && selectedMunicipality.name === selectedMunicipalityInternal && (
                          <Text className="text-xs text-cyan-600 mt-1">
                            (Automatically selected from previous screen)
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View className="px-6 mb-6">
            <View className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 rounded-full bg-cyan-100 items-center justify-center mr-3">
                  <MaterialIcons name="place" size={20} color="#0891B2" />
                </View>
                <Text className="text-lg font-semibold text-gray-800">
                  Location Details
                </Text>
              </View>
              <View className="mb-4">
                <Text className="text-gray-700 text-sm mb-2 font-medium">
                  Full Address *
                </Text>
                {formErrors.location && (
                  <View className="flex-row items-center mb-2">
                    <MaterialIcons name="error-outline" size={16} color="#EF4444" />
                    <Text className="text-red-500 text-xs ml-1">{formErrors.location}</Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={openMapForMunicipality}
                  disabled={!selectedMunicipalityInternal || !barangayName.trim()}
                  className={`rounded-lg p-4 mb-4 flex-row items-center justify-center ${
                    !selectedMunicipalityInternal || !barangayName.trim() 
                      ? 'bg-gray-100 border border-gray-300' 
                      : 'bg-cyan-600 border border-cyan-700'
                  }`}
                >
                  <MaterialIcons 
                    name="push-pin" 
                    size={24} 
                    color={!selectedMunicipalityInternal || !barangayName.trim() ? "#9CA3AF" : "white"} 
                  />
                  <Text className={`ml-3 font-semibold text-lg ${
                    !selectedMunicipalityInternal || !barangayName.trim() 
                      ? 'text-gray-500' 
                      : 'text-white'
                  }`}>
                    Pin Barangay Location on Map
                  </Text>
                </TouchableOpacity>
                {(!selectedMunicipalityInternal || !barangayName.trim()) && (
                  <Text className="text-red-500 text-sm mb-3 text-center">
                    {!selectedMunicipalityInternal && !barangayName.trim() 
                      ? "Enter barangay name and select municipality first" 
                      : !selectedMunicipalityInternal 
                        ? "Select a municipality first" 
                        : "Enter barangay name first"}
                  </Text>
                )}
                <View className="bg-gray-50 rounded-lg p-4 border border-gray-200 min-h-20">
                  {fullAddress ? (
                    <View>
                      <Text className="text-gray-700 text-base leading-6 mb-2">
                        {fullAddress}
                      </Text>
                      {marker && (
                        <View className="flex-row items-center mt-2">
                          <MaterialIcons name="gps-fixed" size={16} color="#0891B2" />
                          <Text className="text-cyan-600 text-sm ml-2">
                            Coordinates: {marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View className="flex-row items-center justify-center h-full">
                      <MaterialIcons name="location-off" size={24} color="#9CA3AF" />
                      <Text className="text-gray-400 text-base ml-2 text-center">
                        {selectedMunicipalityInternal 
                          ? "Click 'Pin Barangay Location' to select location on map"
                          : "Select a municipality first, then pin location on map"
                        }
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              {marker && (
                <View className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <View className="flex-row items-start">
                    <MaterialIcons name="check-circle" size={24} color="#059669" />
                    <View className="ml-3 flex-1">
                      <Text className="font-bold text-green-800 mb-1">
                        ✅ Location Pinned Successfully
                      </Text>
                      <Text className="text-sm text-gray-700 mb-2">
                        {marker.address}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        Coordinates: {marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}
                      </Text>
                      <TouchableOpacity 
                        onPress={() => setShowMap(true)}
                        className="mt-3 flex-row items-center"
                      >
                        <MaterialIcons name="edit-location" size={18} color="#0891B2" />
                        <Text className="text-cyan-600 text-sm font-medium ml-2">
                          Edit or Adjust Location on Map
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          <View className="px-6 mb-6">
            <View className="bg-cyan-50 rounded-xl p-5 border border-cyan-200">
              <View className="flex-row items-start">
                <View className="w-8 h-8 rounded-full bg-cyan-100 items-center justify-center mr-3 mt-0.5">
                  <MaterialIcons name="info" size={20} color="#0891B2" />
                </View>
                <View className="flex-1">
                  <Text className="text-cyan-800 font-semibold text-lg mb-3">
                    {isEditing ? "Editing Barangay Information" : "How to Register a Barangay"}
                  </Text>
                  <View style={styles.spaceContainer}>
                    <View style={styles.rowContainer}>
                      <MaterialIcons name="check-circle" size={16} color="#0891B2" style={styles.iconStyle} />
                      <Text className="text-cyan-700 text-sm ml-2 flex-1">
                        1. Enter the barangay name
                      </Text>
                    </View>
                    <View style={styles.rowContainer}>
                      <MaterialIcons name="check-circle" size={16} color="#0891B2" style={styles.iconStyle} />
                      <Text className="text-cyan-700 text-sm ml-2 flex-1">
                        2. {selectedMunicipality && !isEditing ? "Municipality is pre-selected" : "Select a municipality"}
                      </Text>
                    </View>
                    <View style={styles.rowContainer}>
                      <MaterialIcons name="check-circle" size={16} color="#0891B2" style={styles.iconStyle} />
                      <Text className="text-cyan-700 text-sm ml-2 flex-1">
                        3. Click "Pin Barangay Location" button to open map
                      </Text>
                    </View>
                    <View style={styles.rowContainer}>
                      <MaterialIcons name="check-circle" size={16} color="#0891B2" style={styles.iconStyle} />
                      <Text className="text-cyan-700 text-sm ml-2 flex-1">
                        4. Use GPS or tap on map to place marker, drag to adjust position
                      </Text>
                    </View>
                    <View style={styles.rowContainer}>
                      <MaterialIcons name="check-circle" size={16} color="#0891B2" style={styles.iconStyle} />
                      <Text className="text-cyan-700 text-sm ml-2 flex-1">
                        5. Review and {isEditing ? "update" : "save"} the barangay location
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View className="px-6 mb-4">
            <View className="flex-row">
              <TouchableOpacity 
                onPress={handleCancel}
                className="flex-1 bg-gray-100 p-4 rounded-xl mr-2 border border-gray-300"
              >
                <Text className="text-gray-800 font-semibold text-center text-base">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSubmit} 
                className={`flex-1 p-4 rounded-xl ml-2 ${submitButtonState.bg}`}
                disabled={submitButtonState.disabled}
              >
                <View className="flex-row items-center justify-center">
                  <MaterialIcons name={isEditing ? "save-as" : "save"} size={20} color="white" />
                  <Text className="text-white font-semibold text-center text-base ml-2">
                    {submitButtonState.text}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View className="px-6">
            <Text className="text-gray-400 text-xs text-center">
              {isEditing 
                ? "This will update the barangay information for emergency response mapping and resource allocation."
                : "This will register a new barangay location for emergency response mapping and resource allocation."
              }
            </Text>
          </View>
        </ScrollView>

        <Modal 
          visible={showMap} 
          animationType="slide" 
          transparent={false}
          onRequestClose={() => setShowMap(false)}
        >
          <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-between p-5 bg-cyan-600">
              <View className="flex-1">
                <Text className="text-xl font-bold text-white">
                  📍 Pin Barangay Location
                </Text>
                <Text className="text-cyan-200 text-sm mt-1">
                  {barangayName} - {selectedMunicipalityInternal}
                </Text>
              </View>
              <TouchableOpacity 
                className="p-2"
                onPress={() => setShowMap(false)}
              >
                <MaterialIcons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
              <View className="flex-row items-center">
                <MaterialIcons name="gps-fixed" size={24} color="#0891B2" />
                <View className="ml-3">
                  <Text className="text-gray-800 font-semibold">
                    GPS Location
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    Use your device's GPS to get current location
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <Switch
                  value={gpsEnabled}
                  onValueChange={toggleGPS}
                  trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                  thumbColor={gpsEnabled ? '#FFFFFF' : '#F3F4F6'}
                />
                <Text className="ml-2 text-gray-700 font-medium">
                  {gpsEnabled ? 'ON' : 'OFF'}
                </Text>
              </View>
            </View>

            {gpsEnabled && (
              <View className="px-4 py-3 bg-green-50 border-b border-green-200">
                <TouchableOpacity
                  onPress={getCurrentLocation}
                  disabled={isGettingLocation}
                  className={`rounded-lg p-3 flex-row items-center justify-center ${
                    isGettingLocation ? 'bg-gray-300' : 'bg-green-600'
                  }`}
                >
                  {isGettingLocation ? (
                    <>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text className="text-white font-semibold text-base ml-3">
                        Getting Location...
                      </Text>
                    </>
                  ) : (
                    <>
                      <MaterialIcons name="my-location" size={24} color="white" />
                      <Text className="text-white font-semibold text-base ml-3">
                        Get My Current Location
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                {userLocation && (
                  <View className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                    <Text className="text-green-800 text-sm">
                      Last GPS Location:
                    </Text>
                    <Text className="text-gray-700 text-xs">
                      {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View className="bg-cyan-50 p-4 border-b border-cyan-200">
              <View className="flex-row items-start">
                <MaterialIcons name="my-location" size={20} color="#0891B2" />
                <View className="ml-3 flex-1">
                  <Text className="text-cyan-800 font-medium mb-1">
                    How to pin location:
                  </Text>
                  <Text className="text-cyan-700 text-sm">
                    {gpsEnabled 
                      ? "1. Use GPS button to get your current location\n2. Or tap anywhere within the red rectangle to place a marker\n3. You can drag the marker to adjust the position"
                      : "1. Tap anywhere within the red rectangle (Biliran Province) to place a marker\n2. You can drag the marker to adjust the position\n3. The address will be automatically generated"}
                  </Text>
                </View>
              </View>
            </View>

            {mapHtml ? (
              <View style={{ flex: 1 }}>
                <WebView
                  ref={webViewRef}
                  originWhitelist={['*']}
                  source={{ html: mapHtml }}
                  style={{ flex: 1 }}
                  onMessage={(event) => {
                    try {
                      const data = JSON.parse(event.nativeEvent.data);
                      handleSelectFromWebView(data);
                    } catch (error) {
                      console.error("Error parsing WebView message:", error);
                    }
                  }}
                  startInLoadingState={true}
                  renderLoading={() => (
                    <View className="flex-1 justify-center items-center absolute inset-0 bg-white">
                      <ActivityIndicator size="large" color="#0891B2" />
                      <Text className="mt-4 text-gray-600 font-medium">Loading Map...</Text>
                    </View>
                  )}
                />
                <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
                  <View className="flex-row">
                    <TouchableOpacity 
                      onPress={() => setShowMap(false)}
                      className="flex-1 bg-gray-100 p-4 rounded-xl mr-2 border border-gray-300"
                    >
                      <Text className="text-gray-800 font-semibold text-center text-base">
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={handleConfirmLocation}
                      disabled={!marker}
                      className={`flex-1 p-4 rounded-xl ml-2 ${
                        marker ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <View className="flex-row items-center justify-center">
                        <MaterialIcons name="check" size={20} color="white" />
                        <Text className="text-white font-semibold text-center text-base ml-2">
                          {marker ? 'Confirm Location' : 'Select Location First'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#0891B2" />
                <Text className="mt-4 text-gray-600 font-medium">Preparing Map...</Text>
              </View>
            )}
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  spaceContainer: {
    marginVertical: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconStyle: {
    marginTop: 4,
  },
});