import React, { useState, useEffect } from "react";
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
const DAMAGE_TYPES = [
  { label: "Nasira ang Bubong", value: "roof_damage", icon: "🏠" },
  { label: "Gibâ ang Pader", value: "wall_collapse", icon: "🧱" },
  { label: "Bumigay ang Pundasyon", value: "foundation", icon: "⚒️" },
  { label: "Baha ang Bahay", value: "flood_damage", icon: "🌊" },
  { label: "Nasunog", value: "fire_damage", icon: "🔥" },
  { label: "Nasira ang mga Bintana", value: "window_damage", icon: "🪟" },
  { label: "Iba pang Sirâ", value: "other", icon: "🔧" },
];

const SEVERITY_LEVELS = [
  { label: "Magaan", value: "low", color: "green" },
  { label: "Katamtaman", value: "medium", color: "yellow" },
  { label: "Malubha", value: "high", color: "red" },
];

const ReportNasirangBahayModal = ({
  reportNasirangBahayModalVisible,
  setReportNasirangBahayModalVisible,
  selectedMedia,
  setSelectedMedia,
  location,
  setLocation,
  ipAddress,
  setIpAddress,
  nasirangBahayData,
  setNasirangBahayData,
  resetReportForms,
}) => {
  const [formErrors, setFormErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(0);

  // Form validation functions
  const validateForm = () => {
    const errors = {};

    if (selectedMedia.length === 0) {
      errors.media = "Mangyaring mag-upload ng kahit isang larawan o video ng nasirang bahay";
    }

    if (!nasirangBahayData.damageType) {
      errors.damageType = "Pumili ng uri ng sirâ";
    }

    if (!nasirangBahayData.address || nasirangBahayData.address.length < 5) {
      errors.address = "Magbigay ng kumpletong address";
    }

    if (!nasirangBahayData.severity) {
      errors.severity = "Piliin ang antas ng sirâ";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateField = (field, value) => {
    const errors = { ...formErrors };
    
    switch (field) {
      case 'address':
        errors.address = value.length < 5 ? 'Magbigay ng kumpletong address' : '';
        break;
      case 'damageType':
        errors.damageType = !value ? 'Pumili ng uri ng sirâ' : '';
        break;
      case 'severity':
        errors.severity = !value ? 'Piliin ang antas ng sirâ' : '';
        break;
    }
    
    setFormErrors(errors);
  };

  // Progress Indicator Component
  const FormProgress = () => (
    <View className="px-5 pt-3">
      <View className="flex-row justify-between mb-2">
        {['Media', 'Lokasyon', 'Detalye', 'Pagsusuri'].map((step, index) => (
          <View key={step} className="items-center flex-1">
            <View className={`w-6 h-6 rounded-full ${
              index <= currentStep ? 'bg-red-500' : 'bg-gray-300'
            } items-center justify-center`}>
              {index <= currentStep && (
                <Ionicons name="checkmark" size={14} color="white" />
              )}
            </View>
            <Text className="text-xs mt-1 text-gray-600">{step}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // Media handling functions
  const handleMediaPick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          "Permission Required",
          "Kailangan ng permission para ma-access ang media library.",
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
        validateField('media', 'hasMedia');
      }
    } catch (error) {
      console.error("Error picking media:", error);
      Alert.alert("Error", "Hindi ma-access ang media. Subukan muli.");
    }
  };

  const handleRemoveMedia = (id) => {
    setSelectedMedia((prev) => prev.filter((media) => media.id !== id));
    if (selectedMedia.length === 1) {
      validateField('media', '');
    }
  };

  const handleRemoveAllMedia = () => {
    Alert.alert(
      "Tanggalin Lahat ng Media",
      "Sigurado ka bang gusto mong tanggalin lahat ng media?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Tanggalin Lahat", 
          style: "destructive",
          onPress: () => {
            setSelectedMedia([]);
            validateField('media', '');
          }
        },
      ]
    );
  };

  // Enhanced Location functions
  const handleLocationRequest = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Kailangan ng Permission sa Lokasyon",
          "Kailangan ng location permission para ma-report ang eksaktong lokasyon ng nasirang bahay. Paki-enable ang location services sa settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Buksan ang Settings", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      Alert.alert(
        "Kinuha ang Lokasyon",
        "Mangyaring maghintay habang kinukuha ang iyong kasalukuyang lokasyon..."
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

      Alert.alert("Tagumpay", "Matagumpay na nakuha ang lokasyon!");
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert(
        "Error sa Lokasyon",
        "Hindi makuha ang lokasyon. Pakisuri ang iyong koneksyon at subukan muli."
      );
    }
  };

  // Enhanced Report submission
  const handleSubmitReport = () => {
    if (!validateForm()) {
      Alert.alert(
        "Kulang ang Impormasyon",
        "Pakikumpletohin ang mga kinakailangang field bago mag-submit.",
        [{ text: "OK" }]
      );
      return;
    }

    // Emergency warning
    if (nasirangBahayData.emergencyNeeded) {
      Alert.alert(
        "KAILANGAN NG EMERGENCY RESCUE",
        "Ito ay emergency rescue report. Agad itong ipapadala sa rescue teams.\n\nMangyaring tiyakin na nasa ligtas na lugar kayo at hintayin ang rescue team.",
        [
          { text: "Kanselahin", style: "cancel" },
          {
            text: "Kumpirmahin ang Emergency",
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
      latitude: 14.5995,
      longitude: 120.9842,
      accuracy: 5000,
      isApproximate: true,
    };

    const photosCount = selectedMedia.filter((m) => m.type === "image").length;
    const videosCount = selectedMedia.filter((m) => m.type === "video").length;

    const reportData = {
      ...nasirangBahayData,
      media: selectedMedia,
      location: reportLocation,
      ipAddress,
      timestamp: new Date().toISOString(),
      reportId: `NH-${Date.now()}`,
      status: "pending",
      damageTypeLabel: DAMAGE_TYPES.find(
        (d) => d.value === nasirangBahayData.damageType
      )?.label,
      mediaCount: {
        photos: photosCount,
        videos: videosCount,
      },
    };

    console.log("Submitting Nasirang Bahay Report:", reportData);
    showSubmissionSuccess(reportData);
  };

  const showSubmissionSuccess = (reportData) => {
    const locationType = reportData.location.isApproximate ? "Tinatayang Lokasyon" : "Eksaktong Lokasyon";
    const coordinates = `${reportData.location.latitude.toFixed(4)}, ${reportData.location.longitude.toFixed(4)}`;
    
    const emergencyMessage = reportData.emergencyNeeded
      ? "\n\n🚨 EMERGENCY RESCUE REPORT\nNa-notify na ang rescue teams"
      : "";

    Alert.alert(
      "✅ Matagumpay na Na-report!",
      `Ang iyong report ng nasirang bahay ay naipadala.\n\n` +
      `📋 **Report ID:** ${reportData.reportId}\n` +
      `📸 **Mga Larawan:** ${reportData.mediaCount.photos}\n` +
      `🎥 **Mga Video:** ${reportData.mediaCount.videos}\n` +
      `📍 **${locationType}:** ${coordinates}\n` +
      `🏠 **Uri ng Sirâ:** ${reportData.damageTypeLabel}` +
      emergencyMessage,
      [
        {
          text: "OK",
          onPress: () => {
            setReportNasirangBahayModalVisible(false);
            resetReportForms();
          },
        },
      ]
    );
  };

  // Enhanced Media Upload Section Component
  const MediaUploadSection = () => (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-bold text-gray-800">
          Mag-upload ng Larawan o Video ng Nasirang Bahay *
        </Text>
        {selectedMedia.length > 0 && (
          <Text className="text-red-500 text-sm font-semibold">
            {selectedMedia.length}/10
          </Text>
        )}
      </View>

      {formErrors.media && (
        <Text className="text-red-500 text-sm mb-3">{formErrors.media}</Text>
      )}

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
                      {media.type === "image" ? "LARAWAN" : "VIDEO"}
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
                Tanggalin Lahat
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-red-600 py-3 px-4 rounded-full flex-row items-center justify-center shadow-sm"
              onPress={handleMediaPick}
              disabled={selectedMedia.length >= 10}
            >
              <Ionicons name="add" size={18} color="white" />
              <Text className="text-white font-semibold ml-2 text-sm">
                Magdagdag
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-gray-500 text-sm mt-3 text-center">
            {selectedMedia.length} media files na napili • {selectedMedia.filter((m) => m.type === "image").length} larawan • {selectedMedia.filter((m) => m.type === "video").length} video
          </Text>

          {selectedMedia.length >= 8 && (
            <Text className="text-orange-500 text-xs mt-2 text-center">
              ⚠️ Malapit na maabot ang limit (10 files)
            </Text>
          )}
        </View>
      ) : (
        <TouchableOpacity
          className="bg-red-50 py-8 rounded-xl items-center border-2 border-dashed border-red-200"
          onPress={handleMediaPick}
        >
          <Ionicons name="images" size={48} color="#DC2626" />
          <Text className="text-red-600 font-semibold mt-4 text-center text-lg">
            Pumili mula sa Gallery
          </Text>
          <Text className="text-red-400 text-sm mt-2 text-center px-4">
            Pumili ng mga larawan at video ng nasirang bahay
          </Text>
          <Text className="text-red-300 text-xs mt-3 text-center px-4">
            Suportado ang maramihang pagpili (hanggang 10 files)
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Enhanced Location Info Section Component - FIXED BUTTON LAYOUT
  const LocationInfoSection = () => (
    <View className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-200">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-bold text-gray-800 flex-1 mr-3">
          Impormasyon ng Lokasyon at Device
        </Text>
        <TouchableOpacity
          onPress={handleLocationRequest}
          className="bg-red-600 px-4 py-3 rounded-xl shadow-sm flex-row items-center"
        >
          <Ionicons name="location" size={16} color="white" />
          <Text className="text-white font-semibold ml-2 text-sm">
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
                ⚠️ Gumagamit ng tinatayang lokasyon
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View className="space-y-3">
          <Text className="text-gray-500 text-center py-3 text-sm">
            Hindi pa nakukuha ang lokasyon
          </Text>
          <View className="bg-red-100 p-4 rounded-lg">
            <Text className="text-red-800 text-sm text-center">
              Pindutin ang "Get Location" para makuha ang iyong kasalukuyang lokasyon para sa tumpak na pag-report
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  // Enhanced Form Field Components
  const DamageTypeSelector = () => (
    <View className="mb-6">
      <Text className="text-gray-700 text-sm mb-3 font-semibold">
        Uri ng Sirâ sa Bahay *
      </Text>
      {formErrors.damageType && (
        <Text className="text-red-500 text-sm mb-2">{formErrors.damageType}</Text>
      )}
      <View className="flex-row flex-wrap -mx-1">
        {DAMAGE_TYPES.map((type) => (
          <TouchableOpacity
            key={type.value}
            className={`mx-1 mb-2 px-4 py-3 rounded-xl border-2 ${
              nasirangBahayData.damageType === type.value
                ? "bg-red-500 border-red-500 shadow-sm"
                : "bg-white border-gray-300"
            }`}
            onPress={() => {
              setNasirangBahayData({
                ...nasirangBahayData,
                damageType: type.value,
                damageTypeLabel: type.label,
              });
              validateField('damageType', type.value);
            }}
          >
            <Text
              className={`font-medium text-sm ${
                nasirangBahayData.damageType === type.value
                  ? "text-white"
                  : "text-gray-700"
              }`}
            >
              {type.icon} {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const SeveritySelector = () => (
    <View className="mb-6">
      <Text className="text-gray-700 text-sm mb-3 font-semibold">
        Antas ng Sirâ *
      </Text>
      {formErrors.severity && (
        <Text className="text-red-500 text-sm mb-2">{formErrors.severity}</Text>
      )}
      <View className="flex-row justify-between space-x-2">
        {SEVERITY_LEVELS.map((item) => (
          <TouchableOpacity
            key={item.value}
            className={`flex-1 py-4 rounded-xl items-center border-2 ${
              nasirangBahayData.severity === item.value
                ? `bg-${item.color}-500 border-${item.color}-500 shadow-sm`
                : "bg-white border-gray-300"
            }`}
            onPress={() => {
              setNasirangBahayData({ ...nasirangBahayData, severity: item.value });
              validateField('severity', item.value);
            }}
          >
            <Text
              className={`font-semibold text-sm ${
                nasirangBahayData.severity === item.value
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
              May mga Nakatira pa sa Bahay?
            </Text>
            <Text className="text-yellow-600 text-xs mt-1">
              I-check kung may mga tao pa ring nakatira sa nasirang bahay
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              setNasirangBahayData({
                ...nasirangBahayData,
                stillOccupied: !nasirangBahayData.stillOccupied,
              })
            }
          >
            <Ionicons
              name={
                nasirangBahayData.stillOccupied
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={28}
              color={nasirangBahayData.stillOccupied ? "#F59E0B" : "#6B7280"}
            />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
          <View className="flex-1">
            <Text className="text-orange-800 font-semibold text-sm">
              Kailangan ng Temporary Shelter?
            </Text>
            <Text className="text-orange-600 text-xs mt-1">
              I-check kung kailangan ng pansamantalang tirahan ang mga nakatira
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              setNasirangBahayData({
                ...nasirangBahayData,
                needShelter: !nasirangBahayData.needShelter,
              })
            }
          >
            <Ionicons
              name={
                nasirangBahayData.needShelter
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={28}
              color={nasirangBahayData.needShelter ? "#EA580C" : "#6B7280"}
            />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between p-4 bg-red-100 rounded-xl border border-red-300">
          <View className="flex-1">
            <Text className="text-red-900 font-semibold text-sm">
              Kailangan ng Emergency Rescue?
            </Text>
            <Text className="text-red-700 text-xs mt-1">
              I-check kung may mga taong nangangailangan ng agarang rescue
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              setNasirangBahayData({
                ...nasirangBahayData,
                emergencyNeeded: !nasirangBahayData.emergencyNeeded,
              })
            }
          >
            <Ionicons
              name={
                nasirangBahayData.emergencyNeeded
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={28}
              color={nasirangBahayData.emergencyNeeded ? "#DC2626" : "#6B7280"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Enhanced Submit Button State
  const getSubmitButtonState = () => {
    if (selectedMedia.length === 0) {
      return { 
        bg: 'bg-gray-400', 
        text: 'Mag-upload ng Media para ma-Submit ang Report',
        disabled: true
      };
    }
    
    if (nasirangBahayData.emergencyNeeded) {
      return { 
        bg: 'bg-red-700', 
        text: '🚨 I-REPORT ANG EMERGENCY DAMAGE',
        disabled: false
      };
    }
    
    const mediaCount = `${selectedMedia.filter(m => m.type === 'image').length} larawan, ${selectedMedia.filter(m => m.type === 'video').length} video`;
    return { 
      bg: 'bg-red-600', 
      text: `I-submit ang Damage Report • ${mediaCount}`,
      disabled: false
    };
  };

  // Update current step based on form completion
  useEffect(() => {
    let step = 0;
    if (selectedMedia.length > 0) step = 1;
    if (location) step = 2;
    if (nasirangBahayData.damageType && nasirangBahayData.address) step = 3;
    setCurrentStep(step);
  }, [selectedMedia, location, nasirangBahayData]);

  const submitButtonState = getSubmitButtonState();

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={reportNasirangBahayModalVisible}
      onRequestClose={() => {
        setReportNasirangBahayModalVisible(false);
        resetReportForms();
      }}
      statusBarTranslucent={false}
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
          <Text className="text-2xl font-bold text-gray-800">
            Mag-report ng Nasirang Bahay
          </Text>
          <TouchableOpacity
            onPress={() => {
              setReportNasirangBahayModalVisible(false);
              resetReportForms();
            }}
            className="p-2 rounded-full bg-gray-100"
          >
            <MaterialIcons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Progress Indicator */}
        <FormProgress />

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
              Mga Detalye ng Sirâ
            </Text>

            {/* Damage Type Selector */}
            <DamageTypeSelector />

            {/* Severity Selector */}
            <SeveritySelector />

            {/* Location Address */}
            <View className="mb-6">
              <Text className="text-gray-700 text-sm mb-3 font-semibold">
                Kumpletong Address *
              </Text>
              {formErrors.address && (
                <Text className="text-red-500 text-sm mb-2">{formErrors.address}</Text>
              )}
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-4 border border-gray-200 text-base"
                placeholder="Ilagay ang kumpletong address ng nasirang bahay"
                value={nasirangBahayData.address}
                onChangeText={(text) => {
                  setNasirangBahayData({ ...nasirangBahayData, address: text });
                  validateField('address', text);
                }}
                onBlur={() => validateField('address', nasirangBahayData.address)}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="text-gray-700 text-sm mb-3 font-semibold">
                Deskripsyon ng Sirâ
              </Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-4 border border-gray-200 h-32 text-base"
                placeholder="Ilarawan nang detalyado ang mga sirâ sa bahay, mga naapektuhang bahagi, at kalagayan ng istruktura..."
                value={nasirangBahayData.description}
                onChangeText={(text) =>
                  setNasirangBahayData({
                    ...nasirangBahayData,
                    description: text,
                  })
                }
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Emergency Information */}
            <EmergencyInfoSection />

            {/* Additional Information */}
            <View className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
              <Text className="text-red-800 font-semibold mb-2 text-sm">
                Mahalagang Paalala sa Pagre-report
              </Text>
              <Text className="text-red-600 text-xs leading-5">
                • Kumuha ng malinaw na larawan ng mga sirâ sa iba't ibang anggulo{"\n"}
                • Ipakita ang lawak at kalubhaan ng pinsala{"\n"}
                • Isama ang mga larawan ng structural damage{"\n"}
                • I-report agad kung delikado ang kalagayan ng bahay{"\n"}
                • Magbigay ng tumpak na lokasyon para sa mabilis na responde
              </Text>
            </View>
          </View>

          {/* Safety Warning */}
          <View className="bg-red-50 rounded-2xl p-5 mb-6 border border-red-200">
            <View className="flex-row items-start">
              <Ionicons name="warning" size={28} color="#EF4444" />
              <View className="ml-4 flex-1">
                <Text className="text-red-800 font-bold text-lg mb-2">
                  BABALA: Mag-ingat sa Pagsusuri ng Nasirang Bahay!
                </Text>
                <Text className="text-red-700 text-sm leading-5">
                  • Huwag pumasok sa bahay na posibleng gumuho{"\n"}
                  • Mag-ingat sa mga nasirang kable at electrical lines{"\n"}
                  • Maging alerto sa mga posibleng gumuhong bahagi{"\n"}
                  • Kung delikado, maghintay ng professional assistance{"\n"}
                  • Laging unahin ang kaligtasan kaysa sa pagkuha ng larawan
                </Text>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`py-5 rounded-xl items-center mb-2 shadow-sm ${
              submitButtonState.bg
            }`}
            onPress={handleSubmitReport}
            disabled={submitButtonState.disabled}
          >
            <Text className="text-white text-lg font-semibold text-center">
              {submitButtonState.text}
            </Text>
          </TouchableOpacity>

          {/* Footer Note */}
          <Text className="text-gray-500 text-xs text-center px-4">
            Ang iyong report ay makakatulong sa mabilis na pagtugon at assistance sa mga naapektuhan. Lahat ng data ay vina-verify bago i-publish.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default ReportNasirangBahayModal;