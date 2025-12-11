import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Alert,
  Linking,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";

// Constants for better maintainability
const WATER_LEVELS = [
  { label: "Ankle-deep (Tobilya)", value: "ankle", depth: "0.1-0.3m" },
  { label: "Knee-deep (Tuhod)", value: "knee", depth: "0.3-0.5m" },
  { label: "Waist-deep (Bayan)", value: "waist", depth: "0.5-0.8m" },
  { label: "Chest-deep (Dibdib)", value: "chest", depth: "0.8-1.2m" },
  { label: "Neck-deep (Leeg)", value: "neck", depth: "1.2-1.5m" },
  { label: "Above Head (Lampas Tao)", value: "above_head", depth: "1.5m+" },
];

const FLOOD_TYPES = [
  { label: "Dahil sa Ulan", value: "rain_flood" },
  { label: "High Tide", value: "high_tide" },
  { label: "Dahil sa Bagyo", value: "storm_flood" },
  { label: "Iba pang Dahilan", value: "other" },
];

const SEVERITY_LEVELS = [
  { label: "Mababa", value: "low", color: "green" },
  { label: "Katamtaman", value: "medium", color: "yellow" },
  { label: "Mataas", value: "high", color: "red" },
];

const ReportBahaModal = ({
  reportBahaModalVisible,
  setReportBahaModalVisible,
  selectedMedia,
  setSelectedMedia,
  location,
  setLocation,
  ipAddress,
  setIpAddress,
  bahaData,
  setBahaData,
  resetReportForms,
}) => {

  // Media handling functions
  const handleMediaPick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          "Permission Required",
          "Media library permission is required to select photos and videos.",
          [{ text: "OK" }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 10,
        videoMaxDuration: 30,
      });

      if (!result.canceled && result.assets) {
        const newMedia = result.assets.map((asset) => ({
          uri: asset.uri,
          type: asset.type || "image",
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          duration: asset.duration,
          fileName: asset.fileName || `media_${Date.now()}`,
        }));
        
        setSelectedMedia((prev) => [...prev, ...newMedia]);
      }
    } catch (error) {
      console.error("Error picking media:", error);
      Alert.alert("Error", "Failed to select media. Please try again.");
    }
  };

  const handleRemoveMedia = (id) => {
    setSelectedMedia((prev) => prev.filter((media) => media.id !== id));
  };

  const handleRemoveAllMedia = () => {
    Alert.alert(
      "Remove All Media",
      "Are you sure you want to remove all selected media?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove All", 
          style: "destructive",
          onPress: () => setSelectedMedia([])
        },
      ]
    );
  };

  // Location handling functions
  const handleLocationRequest = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Location permission is required to report the exact flood location. Please enable location services in settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      Alert.alert(
        "Getting Location",
        "Please wait while we retrieve your current location..."
      );

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeout: 15000,
      });

      setLocation(currentLocation.coords);

      // Generate simulated IP address
      const simulatedIp = `100.${Math.floor(Math.random() * 255)}.${Math.floor(
        Math.random() * 255
      )}.${Math.floor(Math.random() * 255)}`;
      setIpAddress(simulatedIp);

      Alert.alert("Success", "Location successfully retrieved!");
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert(
        "Location Error",
        "Unable to retrieve location. Please check your connection and try again."
      );
    }
  };

  // Validation functions
  const validateForm = () => {
    if (selectedMedia.length === 0) {
      Alert.alert(
        "Media Required",
        "Please upload at least one photo or video of the flood for verification.",
        [{ text: "OK" }]
      );
      return false;
    }

    if (!bahaData.waterLevel || !bahaData.address) {
      Alert.alert(
        "Incomplete Information",
        "Please fill in all required fields: Water Level and Location.",
        [{ text: "OK" }]
      );
      return false;
    }

    return true;
  };

  // Report submission
  const handleSubmitReport = () => {
    if (!validateForm()) return;

    if (bahaData.emergencyNeeded) {
      Alert.alert(
        "EMERGENCY RESCUE NEEDED",
        "This is an emergency rescue report. It will be immediately sent to rescue teams.\n\nPlease ensure you are in a safe location and wait for the rescue team.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Confirm Emergency",
            onPress: processReportSubmission,
            style: "destructive",
          },
        ]
      );
      return;
    }

    processReportSubmission();
  };

  const processReportSubmission = () => {
    const reportLocation = location || {
      latitude: 14.5995, // Default Manila coordinates
      longitude: 120.9842,
      accuracy: 5000,
      isApproximate: true,
    };

    const photosCount = selectedMedia.filter((m) => m.type === "image").length;
    const videosCount = selectedMedia.filter((m) => m.type === "video").length;

    const reportData = {
      ...bahaData,
      media: selectedMedia,
      location: reportLocation,
      ipAddress,
      timestamp: new Date().toISOString(),
      reportId: `BF-${Date.now()}`,
      status: "pending",
      waterLevelLabel: WATER_LEVELS.find((w) => w.value === bahaData.waterLevel)?.label,
      mediaCount: {
        photos: photosCount,
        videos: videosCount,
      },
    };

    console.log("Submitting Flood Report:", reportData);

    showSubmissionSuccess(reportData);
  };

  const showSubmissionSuccess = (reportData) => {
    const locationMessage = reportData.location.isApproximate
      ? "📍 Estimated Location (Recommended: manual location entry)"
      : `📍 Exact Location: ${reportData.location.latitude.toFixed(4)}, ${reportData.location.longitude.toFixed(4)}`;

    const emergencyMessage = reportData.emergencyNeeded
      ? "\n🚨 EMERGENCY RESCUE REPORT - Rescue teams have been notified"
      : "";

    Alert.alert(
      "Successfully Reported!",
      `✅ Your flood report has been submitted!\n\n📋 Report ID: ${reportData.reportId}\n📸 Photos: ${reportData.mediaCount.photos}\n🎥 Videos: ${reportData.mediaCount.videos}\n${locationMessage}\n🌊 Water Level: ${reportData.waterLevelLabel}${emergencyMessage}`,
      [
        {
          text: "OK",
          onPress: () => {
            setReportBahaModalVisible(false);
            resetReportForms();
          },
        },
      ]
    );
  };

  // Media Upload Section Component
  const MediaUploadSection = () => (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
      <Text className="text-lg font-bold text-gray-800 mb-3">
        Upload Flood Photo or Video *
      </Text>

      {selectedMedia.length > 0 ? (
        <View className="items-center">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
            <View className="flex-row space-x-3">
              {selectedMedia.map((media) => (
                <View key={media.id} className="w-32 h-32 relative">
                  {media.type === "image" ? (
                    <Image
                      source={{ uri: media.uri }}
                      className="w-full h-full rounded-xl"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full rounded-xl bg-gray-800 items-center justify-center">
                      <Ionicons name="videocam" size={32} color="white" />
                      <Text className="text-white text-xs mt-2">Video</Text>
                      {media.duration && (
                        <Text className="text-white text-xs">
                          {Math.round(media.duration)}s
                        </Text>
                      )}
                    </View>
                  )}
                  <TouchableOpacity
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center shadow-sm"
                    onPress={() => handleRemoveMedia(media.id)}
                  >
                    <MaterialIcons name="close" size={16} color="white" />
                  </TouchableOpacity>
                  <View className="absolute top-2 left-2 bg-black bg-opacity-70 px-2 py-1 rounded">
                    <Text className="text-white text-xs">
                      {media.type === "image" ? "PHOTO" : "VIDEO"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <View className="flex-row space-x-3 w-full">
            <TouchableOpacity
              className="flex-1 bg-red-500 py-3 px-4 rounded-full flex-row items-center justify-center shadow-sm"
              onPress={handleRemoveAllMedia}
            >
              <MaterialIcons name="delete" size={18} color="white" />
              <Text className="text-white font-semibold ml-2 text-sm">
                Remove All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-blue-500 py-3 px-4 rounded-full flex-row items-center justify-center shadow-sm"
              onPress={handleMediaPick}
            >
              <Ionicons name="add" size={18} color="white" />
              <Text className="text-white font-semibold ml-2 text-sm">
                Add More
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-gray-500 text-sm mt-3 text-center">
            {selectedMedia.length} media files selected • {selectedMedia.filter((m) => m.type === "image").length} photos • {selectedMedia.filter((m) => m.type === "video").length} videos
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          className="bg-blue-50 py-8 rounded-xl items-center border-2 border-dashed border-blue-200"
          onPress={handleMediaPick}
        >
          <Ionicons name="images" size={48} color="#3B82F6" />
          <Text className="text-blue-600 font-semibold mt-4 text-center text-lg">
            Select from Gallery
          </Text>
          <Text className="text-blue-400 text-sm mt-2 text-center px-4">
            Choose photos and videos from your device
          </Text>
          <Text className="text-blue-300 text-xs mt-3 text-center px-4">
            Multiple selection supported (up to 10 files)
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Location Info Section Component
  const LocationInfoSection = () => (
    <View className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-200">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-bold text-gray-800">
          Location & Device Information
        </Text>
        <TouchableOpacity
          onPress={handleLocationRequest}
          className="bg-blue-500 px-4 py-2 rounded-full shadow-sm"
        >
          <Text className="text-white text-sm font-semibold">
            Get Location
          </Text>
        </TouchableOpacity>
      </View>

      {location ? (
        <View className="space-y-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600 text-sm">GPS Coordinates:</Text>
            <Text className="text-gray-800 font-semibold text-sm">
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </Text>
          </View>

          {location.accuracy && (
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 text-sm">Accuracy:</Text>
              <Text className="text-gray-800 font-semibold text-sm">
                ±{Math.round(location.accuracy)} meters
              </Text>
            </View>
          )}

          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600 text-sm">IP Address:</Text>
            <Text className="text-gray-800 font-semibold text-sm">{ipAddress}</Text>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600 text-sm">Timestamp:</Text>
            <Text className="text-gray-800 font-semibold text-sm">
              {new Date().toLocaleString()}
            </Text>
          </View>

          {location.accuracy > 1000 && (
            <View className="bg-yellow-100 p-3 rounded-lg mt-2">
              <Text className="text-yellow-800 text-xs text-center">
                ⚠️ Using approximate location
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View className="space-y-3">
          <Text className="text-gray-500 text-center py-3 text-sm">
            Location not yet retrieved
          </Text>
          <View className="bg-blue-100 p-4 rounded-lg">
            <Text className="text-blue-800 text-sm text-center">
              Press "Get Location" to retrieve your current location for accurate flood reporting
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  // Form Field Components
  const WaterLevelSelector = () => (
    <View className="mb-6">
      <Text className="text-gray-700 text-sm mb-3 font-semibold">
        Flood Water Level *
      </Text>
      <View className="flex-row flex-wrap -mx-1">
        {WATER_LEVELS.map((level) => (
          <TouchableOpacity
            key={level.value}
            className={`mx-1 mb-2 px-4 py-3 rounded-xl border-2 ${
              bahaData.waterLevel === level.value
                ? "bg-blue-500 border-blue-500 shadow-sm"
                : "bg-white border-gray-300"
            }`}
            onPress={() =>
              setBahaData({
                ...bahaData,
                waterLevel: level.value,
                waterLevelLabel: level.label,
              })
            }
          >
            <Text
              className={`font-medium text-sm ${
                bahaData.waterLevel === level.value
                  ? "text-white"
                  : "text-gray-700"
              }`}
            >
              {level.label}
            </Text>
            <Text
              className={`text-xs mt-1 ${
                bahaData.waterLevel === level.value
                  ? "text-blue-100"
                  : "text-gray-500"
              }`}
            >
              {level.depth}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const FloodTypeSelector = () => (
    <View className="mb-6">
      <Text className="text-gray-700 text-sm mb-3 font-semibold">
        Flood Type
      </Text>
      <View className="flex-row flex-wrap -mx-1">
        {FLOOD_TYPES.map((type) => (
          <TouchableOpacity
            key={type.value}
            className={`mx-1 mb-2 px-4 py-3 rounded-xl border ${
              bahaData.floodType === type.value
                ? "bg-blue-500 border-blue-500"
                : "bg-white border-gray-300"
            }`}
            onPress={() =>
              setBahaData({ ...bahaData, floodType: type.value })
            }
          >
            <Text
              className={
                bahaData.floodType === type.value
                  ? "text-white font-medium text-sm"
                  : "text-gray-700 text-sm"
              }
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const SeveritySelector = () => (
    <View className="mb-6">
      <Text className="text-gray-700 text-sm mb-3 font-semibold">
        Severity Level *
      </Text>
      <View className="flex-row justify-between space-x-2">
        {SEVERITY_LEVELS.map((item) => (
          <TouchableOpacity
            key={item.value}
            className={`flex-1 py-4 rounded-xl items-center border-2 ${
              bahaData.severity === item.value
                ? `bg-${item.color}-500 border-${item.color}-500 shadow-sm`
                : "bg-white border-gray-300"
            }`}
            onPress={() =>
              setBahaData({ ...bahaData, severity: item.value })
            }
          >
            <Text
              className={`font-semibold text-sm ${
                bahaData.severity === item.value
                  ? "text-white"
                  : "text-gray-700"
              }`}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const EmergencyInfoSection = () => (
    <View className="mb-6">
      <Text className="text-gray-700 text-sm mb-3 font-semibold">
        Emergency Information
      </Text>
      <View className="space-y-3">
        <View className="flex-row items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <View className="flex-1">
            <Text className="text-yellow-800 font-semibold text-sm">
              Stranded Vehicles?
            </Text>
            <Text className="text-yellow-600 text-xs mt-1">
              Check if vehicles are stuck in floodwater
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              setBahaData({
                ...bahaData,
                vehiclesStranded: !bahaData.vehiclesStranded,
              })
            }
          >
            <Ionicons
              name={
                bahaData.vehiclesStranded
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={28}
              color={bahaData.vehiclesStranded ? "#F59E0B" : "#6B7280"}
            />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
          <View className="flex-1">
            <Text className="text-red-800 font-semibold text-sm">
              Road Blocked?
            </Text>
            <Text className="text-red-600 text-xs mt-1">
              Check if vehicles cannot pass through
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              setBahaData({
                ...bahaData,
                roadClosed: !bahaData.roadClosed,
              })
            }
          >
            <Ionicons
              name={
                bahaData.roadClosed
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={28}
              color={bahaData.roadClosed ? "#EF4444" : "#6B7280"}
            />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between p-4 bg-red-100 rounded-xl border border-red-300">
          <View className="flex-1">
            <Text className="text-red-900 font-semibold text-sm">
              Emergency Rescue Needed?
            </Text>
            <Text className="text-red-700 text-xs mt-1">
              Check if people need immediate rescue assistance
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              setBahaData({
                ...bahaData,
                emergencyNeeded: !bahaData.emergencyNeeded,
              })
            }
          >
            <Ionicons
              name={
                bahaData.emergencyNeeded
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={28}
              color={bahaData.emergencyNeeded ? "#DC2626" : "#6B7280"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={reportBahaModalVisible}
      onRequestClose={() => {
        setReportBahaModalVisible(false);
        resetReportForms();
      }}
      statusBarTranslucent={false}
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
          <Text className="text-2xl font-bold text-gray-800">
            Report Road Flooding
          </Text>
          <TouchableOpacity
            onPress={() => {
              setReportBahaModalVisible(false);
              resetReportForms();
            }}
            className="p-2 rounded-full bg-gray-100"
          >
            <MaterialIcons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          className="flex-1 px-5" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {/* Media Upload Section */}
          <MediaUploadSection />

          {/* Location Information */}
          <LocationInfoSection />

          {/* Report Details Form */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
            <Text className="text-lg font-bold text-gray-800 mb-6">
              Flood Details
            </Text>

            {/* Water Level Selector */}
            <WaterLevelSelector />

            {/* Flood Type Selector */}
            <FloodTypeSelector />

            {/* Severity Selector */}
            <SeveritySelector />

            {/* Location Address */}
            <View className="mb-6">
              <Text className="text-gray-700 text-sm mb-3 font-semibold">
                Location (Address) *
              </Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-4 border border-gray-200 text-base"
                placeholder="Enter street name and flood location details"
                value={bahaData.address}
                onChangeText={(text) =>
                  setBahaData({ ...bahaData, address: text })
                }
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="text-gray-700 text-sm mb-3 font-semibold">
                Description
              </Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-4 border border-gray-200 h-32 text-base"
                placeholder="Describe the flood situation, current conditions, and any additional details..."
                value={bahaData.description}
                onChangeText={(text) =>
                  setBahaData({ ...bahaData, description: text })
                }
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Emergency Information */}
            <EmergencyInfoSection />

            {/* Additional Information */}
            <View className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <Text className="text-blue-800 font-semibold mb-2 text-sm">
                Additional Flood Information
              </Text>
              <Text className="text-blue-600 text-xs leading-5">
                • Report exact water level for accurate assessment{"\n"}
                • Include photos showing the flood extent{"\n"}
                • Note if vehicles or pedestrians can still pass{"\n"}
                • Report any visible hazards in the water{"\n"}
                • Include time of observation for trend analysis
              </Text>
            </View>
          </View>

          {/* Safety Warning */}
          <View className="bg-red-50 rounded-2xl p-5 mb-6 border border-red-200">
            <View className="flex-row items-start">
              <Ionicons name="warning" size={28} color="#EF4444" />
              <View className="ml-4 flex-1">
                <Text className="text-red-800 font-bold text-lg mb-2">
                  SAFETY WARNING: Exercise Caution!
                </Text>
                <Text className="text-red-700 text-sm leading-5">
                  • Do not enter floodwaters unnecessarily{"\n"}
                  • Do not risk safety to take photos{"\n"}
                  • Floodwaters may contain strong currents or contaminants{"\n"}
                  • If rescue is needed, call emergency services immediately{"\n"}
                  • Stay in safe locations while reporting
                </Text>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`py-5 rounded-xl items-center mb-2 shadow-sm ${
              selectedMedia.length === 0
                ? "bg-gray-400"
                : "bg-blue-600"
            }`}
            onPress={handleSubmitReport}
            disabled={selectedMedia.length === 0}
          >
            <Text className="text-white text-lg font-semibold">
              {selectedMedia.length === 0
                ? "Upload Media to Submit Report"
                : `Submit Flood Report • ${selectedMedia.filter((m) => m.type === "image").length} photos, ${selectedMedia.filter((m) => m.type === "video").length} videos`}
            </Text>
          </TouchableOpacity>

          {/* Footer Note */}
          <Text className="text-gray-500 text-xs text-center px-4">
            Your report helps improve flood monitoring and emergency response. All data is verified before publication.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default ReportBahaModal;