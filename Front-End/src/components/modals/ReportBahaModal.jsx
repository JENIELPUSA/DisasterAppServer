import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Alert,
  Platform,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import SelectionModal from "../modals/ReportBahaModal/SelectionModal";
import StatusModal from "../modals/SuccessFailed/SuccessFailedModal";

// --- EXPANDED REPORT TYPES ---
const REPORT_TYPES = [
  { label: "Baha (Flood)", value: "flood", icon: "water" },
  { label: "Landslide", value: "landslide", icon: "terrain" },
  { label: "Sunog (Fire)", value: "fire", icon: "local-fire-department" },
  { label: "Earthquake", value: "earthquake", icon: "vibration" },
  { label: "Accident", value: "accident", icon: "warning" },
];

// Existing severity options
const WATER_LEVELS = [
  { label: "Ankle (Tobilya)", value: "ankle" },
  { label: "Knee (Tuhod)", value: "knee" },
  { label: "Waist (Kiwal)", value: "waist" },
  { label: "Chest (Dibdib)", value: "chest" },
  { label: "Above Head", value: "above_head" },
];

const LANDSLIDE_TYPES = [
  { label: "Minor Fall (Gumuho)", value: "minor" },
  { label: "Blocked Road (Harang)", value: "blocked" },
  { label: "Major Slide", value: "major" },
];

// --- NEW SEVERITY OPTIONS ---
const FIRE_SEVERITIES = [
  { label: "Minor (Maliit na sunog)", value: "minor" },
  { label: "Moderate (Kumakalat)", value: "moderate" },
  { label: "Major (Malaking sunog)", value: "major" },
];

const EARTHQUAKE_SEVERITIES = [
  { label: "Weak (Mahina)", value: "weak" },
  { label: "Moderate (Katamtaman)", value: "moderate" },
  { label: "Strong (Malakas)", value: "strong" },
  { label: "Very Strong (Napakalakas)", value: "very_strong" },
];

const ACCIDENT_SEVERITIES = [
  { label: "Minor (Maliit na aksidente)", value: "minor" },
  { label: "Serious (Malubha)", value: "serious" },
  { label: "Fatal (May nasawi)", value: "fatal" },
];

const ReportBahaModal = ({
  reportBahaModalVisible,
  setReportBahaModalVisible,
  selectedMedia,
  setSelectedMedia,
  location,
  setLocation,
  bahaData,
  setBahaData,
  resetReportForms,
  addIncidentReport,
  municipalities = [],
  barangays = [],
}) => {
  const [reportType, setReportType] = useState("flood");
  const [isLocating, setIsLocating] = useState(false);
  const [muniModalVisible, setMuniModalVisible] = useState(false);
  const [brgyModalVisible, setBrgyModalVisible] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [statusVisible, setStatusVisible] = useState(false);
  const [statusType, setStatusType] = useState("success");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Helper to get severity options based on report type ---
  const getSeverityOptions = () => {
    switch (reportType) {
      case "flood":
        return WATER_LEVELS;
      case "landslide":
        return LANDSLIDE_TYPES;
      case "fire":
        return FIRE_SEVERITIES;
      case "earthquake":
        return EARTHQUAKE_SEVERITIES;
      case "accident":
        return ACCIDENT_SEVERITIES;
      default:
        return [];
    }
  };

  // --- Helper to get the correct state key for severity ---
  const getSeverityStateKey = () => {
    switch (reportType) {
      case "flood":
        return "waterLevel";
      case "landslide":
        return "landslideType";
      case "fire":
        return "fireSeverity";
      case "earthquake":
        return "earthquakeSeverity";
      case "accident":
        return "accidentSeverity";
      default:
        return "";
    }
  };

  // --- Reset form (including new fields) ---
  const resetForm = () => {
    setBahaData({
      municipalityId: "",
      barangayId: "",
      address: "",
      waterLevel: "",
      landslideType: "",
      fireSeverity: "",       // new
      earthquakeSeverity: "", // new
      accidentSeverity: "",   // new
    });
    setSelectedMedia([]);
    setLocation(null);
    setLocationAccuracy(null);
    setReportType("flood");
    setMuniModalVisible(false);
    setBrgyModalVisible(false);
    setIsLocating(false);
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (reportBahaModalVisible) {
      resetForm();
    }
  }, [reportBahaModalVisible]);

  const filteredBarangays = useMemo(() => {
    if (!bahaData.municipalityId) return [];
    return barangays.filter(
      (brgy) => brgy.municipality === bahaData.municipalityId
    );
  }, [bahaData.municipalityId, barangays]);

  const selectedMuniName =
    municipalities.find((m) => m._id === bahaData.municipalityId)
      ?.municipalityName || "Pumili ng Munisipyo";
  const selectedBrgyName =
    barangays.find((b) => b._id === bahaData.barangayId)?.barangayName ||
    "Pumili ng Barangay";

  const handleCloseModal = () => {
    resetForm();
    setReportBahaModalVisible(false);
  };

  const getBarangayLocation = () => {
    if (bahaData.barangayId) {
      const barangay = barangays.find((b) => b._id === bahaData.barangayId);
      if (barangay && barangay.location && barangay.location.coordinates) {
        return {
          latitude: barangay.location.coordinates[1],
          longitude: barangay.location.coordinates[0],
        };
      }
    }
    if (bahaData.municipalityId) {
      const municipality = municipalities.find(
        (m) => m._id === bahaData.municipalityId
      );
      if (municipality && municipality.centerLocation) {
        return {
          latitude: municipality.centerLocation.lat,
          longitude: municipality.centerLocation.lng,
        };
      }
    }
    return null;
  };

  const getAccurateLocation = async () => {
    setIsLocating(true);
    try {
      let servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert("GPS Hindi Aktibo", "Paki-on ang Location Services.");
        return;
      }
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Kailangan ng access sa lokasyon.");
        return;
      }

      let bestLocation = null;
      let bestAccuracy = 1000;

      try {
        const gpsLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
          maximumAge: 0,
          timeout: 10000,
        });
        bestLocation = gpsLocation.coords;
        bestAccuracy = gpsLocation.coords.accuracy;
        setLocationAccuracy(`GPS (${Math.round(bestAccuracy)}m)`);
      } catch (gpsError) {
        console.log("GPS Error:", gpsError);
      }

      if (bestLocation) {
        setLocation({
          latitude: bestLocation.latitude,
          longitude: bestLocation.longitude,
          accuracy: bestAccuracy,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLocating(false);
    }
  };

  const handleMediaPick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Kailangan ng access sa photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      const newMedia = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.type === "video" ? "video" : "image",
        id: Math.random().toString(36).substring(7),
      }));
      setSelectedMedia([...selectedMedia, ...newMedia]);
    }
  };

  const handleSubmit = async () => {
    if (!bahaData.municipalityId || !bahaData.barangayId || !bahaData.address.trim() || selectedMedia.length === 0) {
      Alert.alert("Kulang na Datos", "Pakikumpleto ang lahat ng may asterisk (*).");
      return;
    }
    await submitReport();
  };

  const submitReport = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("type", reportType);
      if (location) {
        formData.append("location", JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy || null,
        }));
      }

      // Determine severity based on report type
      let severityValue = "";
      switch (reportType) {
        case "flood":
          severityValue = bahaData.waterLevel;
          break;
        case "landslide":
          severityValue = bahaData.landslideType;
          break;
        case "fire":
          severityValue = bahaData.fireSeverity;
          break;
        case "earthquake":
          severityValue = bahaData.earthquakeSeverity;
          break;
        case "accident":
          severityValue = bahaData.accidentSeverity;
          break;
      }

      formData.append("details", JSON.stringify({
        municipalityId: bahaData.municipalityId,
        barangayId: bahaData.barangayId,
        address: bahaData.address,
        severity: severityValue,
        locationMethod: locationAccuracy || "manual",
      }));

      selectedMedia.forEach((file, index) => {
        const fileExtension = file.type === "video" ? "mp4" : "jpg";
        formData.append("media", {
          uri: file.uri,
          type: file.type === "video" ? "video/mp4" : "image/jpeg",
          name: `report_${Date.now()}_${index}.${fileExtension}`,
        });
      });

      const result = await addIncidentReport(formData);
      if (result.success) {
        setStatusType("success");
        setStatusMessage("Matagumpay na naipadala ang iyong report!");
        setTimeout(() => {
          resetForm();
          setStatusVisible(true);
        }, 1000);
      } else {
        setStatusType("error");
        setStatusMessage(result.error || "❌ Hindi matagumpay ang pagpapadala.");
        setStatusVisible(true);
      }
    } catch (e) {
      setStatusType("error");
      setStatusMessage("❌ Nagkaroon ng error.");
      setStatusVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI (minor adjustments for new types) ---
  return (
    <Modal 
      animationType="slide" 
      visible={reportBahaModalVisible}
      onRequestClose={handleCloseModal}
      statusBarTranslucent
    >
      <View className="flex-1 bg-cyan-700">
        <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
        
        {/* Header Section */}
        <SafeAreaView edges={['top']}>
          <View className="flex-row items-center justify-between px-6 py-6">
            <View className="flex-1">
              <Text className="text-3xl font-black text-white leading-tight">
                Mag-ulat ng{"\n"}Sakuna
              </Text>
              <View className="flex-row items-center mt-2">
                <MaterialIcons name="info" size={14} color="rgba(255,255,255,0.7)" />
                <Text className="text-white/70 text-xs font-bold ml-1 uppercase tracking-wider">
                  Incident Reporting Tool
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={handleCloseModal}
              className="bg-white/20 p-3 rounded-full active:bg-white/40"
            >
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* CURVED WHITE CONTAINER */}
        <View className="flex-1 bg-white rounded-t-[35px] overflow-hidden shadow-2xl">
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32, paddingBottom: 60 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Report Type Selector */}
            <View className="mb-8">
              <Text className="font-black text-gray-400 mb-3 uppercase text-[10px] tracking-[2px]">
                Uri ng Sakuna
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {REPORT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() => setReportType(type.value)}
                    className={`flex-1 min-w-[40%] flex-row items-center justify-center py-4 rounded-2xl border-2 ${
                      reportType === type.value
                        ? "border-cyan-500 bg-cyan-50"
                        : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <MaterialIcons
                      name={type.icon}
                      size={22}
                      color={reportType === type.value ? "#06B6D4" : "#9CA3AF"}
                    />
                    <Text
                      className={`ml-2 font-bold ${
                        reportType === type.value ? "text-cyan-600" : "text-gray-400"
                      }`}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Location Section (unchanged) */}
            <View className="bg-gray-50/80 p-5 rounded-[30px] border border-gray-100 mb-6">
              <Text className="font-black text-gray-400 mb-4 uppercase text-[10px] tracking-[2px]">
                Lugar ng Insidente
              </Text>
              
              <Text className="font-bold text-gray-700 mb-2 ml-1">Munisipyo *</Text>
              <TouchableOpacity
                onPress={() => setMuniModalVisible(true)}
                className="flex-row items-center justify-between bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm"
              >
                <Text className={selectedMuniName.includes("Pumili") ? "text-gray-300" : "text-gray-800 font-semibold"}>
                  {selectedMuniName}
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <Text className="font-bold text-gray-700 mb-2 ml-1">Barangay *</Text>
              <TouchableOpacity
                onPress={() => setBrgyModalVisible(true)}
                disabled={!bahaData.municipalityId}
                className={`flex-row items-center justify-between bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm ${!bahaData.municipalityId ? "opacity-40" : ""}`}
              >
                <Text className={selectedBrgyName.includes("Pumili") ? "text-gray-300" : "text-gray-800 font-semibold"}>
                  {selectedBrgyName}
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <Text className="font-bold text-gray-700 mb-2 ml-1">Eksaktong Lokasyon *</Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-xl p-4 text-gray-800 shadow-sm"
                placeholder="Purok, Landmark, o Kalye..."
                placeholderTextColor="#D1D5DB"
                value={bahaData.address}
                onChangeText={(val) => setBahaData({ ...bahaData, address: val })}
              />
            </View>

            {/* Media Section (unchanged) */}
            <View className="mb-6">
              <Text className="font-black text-gray-400 mb-3 uppercase text-[10px] tracking-[2px]">
                Dokumentasyon
              </Text>
              {selectedMedia.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                  <View className="flex-row">
                    {selectedMedia.map((m) => (
                      <View key={m.id} className="w-24 h-24 mr-3 rounded-2xl bg-gray-100 overflow-hidden relative border border-gray-100">
                        <Image source={{ uri: m.uri }} className="w-full h-full" />
                        <TouchableOpacity 
                          onPress={() => setSelectedMedia(selectedMedia.filter((item) => item.id !== m.id))}
                          className="absolute top-1 right-1 bg-black/50 p-1.5 rounded-full"
                        >
                          <MaterialIcons name="close" size={14} color="white" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TouchableOpacity 
                      onPress={handleMediaPick} 
                      className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-2xl items-center justify-center bg-gray-50"
                    >
                      <Ionicons name="add" size={32} color="#D1D5DB" />
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              ) : (
                <TouchableOpacity 
                  onPress={handleMediaPick} 
                  className="py-12 border-2 border-dashed border-cyan-100 bg-cyan-50/30 rounded-[30px] items-center"
                >
                  <View className="bg-cyan-100 p-4 rounded-full mb-3">
                    <Ionicons name="camera" size={32} color="#06B6D4" />
                  </View>
                  <Text className="text-cyan-600 font-bold">Mag-attach ng Media *</Text>
                  <Text className="text-cyan-400 text-xs mt-1">Larawan o Video ng insidente</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Severity Section - Now dynamic */}
            <View className="bg-gray-50/80 p-5 rounded-[30px] border border-gray-100 mb-6">
              <Text className="font-black text-gray-400 mb-4 uppercase text-[10px] tracking-[2px]">
                {reportType === "flood" && "Antas ng Baha"}
                {reportType === "landslide" && "Uri ng Landslide"}
                {reportType === "fire" && "Laki ng Sunog"}
                {reportType === "earthquake" && "Intensity ng Lindol"}
                {reportType === "accident" && "Grabe ng Aksidente"}
              </Text>
              <View className="flex-row flex-wrap">
                {getSeverityOptions().map((item) => {
                  const stateKey = getSeverityStateKey();
                  const isSelected = bahaData[stateKey] === item.value;
                  return (
                    <TouchableOpacity
                      key={item.value}
                      onPress={() => setBahaData({ ...bahaData, [stateKey]: item.value })}
                      className={`mr-2 mb-2 px-4 py-2.5 rounded-xl border-2 ${
                        isSelected
                          ? "bg-cyan-600 border-cyan-600"
                          : "bg-white border-gray-100"
                      }`}
                    >
                      <Text className={`font-bold ${isSelected ? "text-white" : "text-gray-500"}`}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* GPS Section (unchanged) */}
            <View className="bg-gray-900 p-6 rounded-[30px] mb-8 shadow-xl">
               <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <MaterialIcons name="my-location" size={20} color="#06B6D4" />
                    <Text className="text-white font-black ml-2 uppercase text-xs tracking-widest">GPS Localization</Text>
                  </View>
                  {location && (
                    <View className="bg-green-500/20 px-2 py-1 rounded-md">
                      <Text className="text-green-400 text-[10px] font-bold">CONNECTED</Text>
                    </View>
                  )}
               </View>

               {location && (
                 <View className="bg-white/10 p-4 rounded-2xl mb-4 border border-white/5">
                   <Text className="text-white/60 text-xs font-bold">Accuracy: {Math.round(location.accuracy)}m</Text>
                   <Text className="text-cyan-400 text-[10px] mt-1">{locationAccuracy}</Text>
                 </View>
               )}

               <TouchableOpacity
                 onPress={getAccurateLocation}
                 disabled={isLocating}
                 className={`py-4 rounded-2xl items-center flex-row justify-center ${isLocating ? "bg-white/10" : "bg-cyan-500"}`}
               >
                 {isLocating ? <ActivityIndicator color="white" size="small" /> : (
                   <>
                     <MaterialIcons name="refresh" size={18} color="white" />
                     <Text className="text-white font-black ml-2 text-sm">UPDATE GPS LOCATION</Text>
                   </>
                 )}
               </TouchableOpacity>
            </View>

            {/* Final Action Buttons (unchanged) */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`py-5 rounded-2xl items-center shadow-lg ${isSubmitting ? "bg-gray-200" : "bg-cyan-600"}`}
            >
              {isSubmitting ? <ActivityIndicator color="white" /> : (
                <Text className="text-white font-black text-lg tracking-[2px]">I-SUBMIT ANG ULAT</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={resetForm} className="py-6">
              <Text className="text-gray-400 text-center font-bold text-xs uppercase tracking-widest">I-clear ang lahat</Text>
            </TouchableOpacity>
            
          </ScrollView>
        </View>

        {/* Pickers and Feedback Modals (unchanged) */}
        <SelectionModal
          visible={muniModalVisible}
          onClose={() => setMuniModalVisible(false)}
          title="Pumili ng Munisipyo"
          data={municipalities}
          labelKey="municipalityName"
          onSelect={(item) => {
            setBahaData({ ...bahaData, municipalityId: item._id, barangayId: "" });
            setMuniModalVisible(false);
          }}
        />

        <SelectionModal
          visible={brgyModalVisible}
          onClose={() => setBrgyModalVisible(false)}
          title="Pumili ng Barangay"
          data={filteredBarangays}
          labelKey="barangayName"
          onSelect={(item) => {
            setBahaData({ ...bahaData, barangayId: item._id });
            setBrgyModalVisible(false);
          }}
        />
        
        <StatusModal
          visible={statusVisible}
          type={statusType}
          message={statusMessage}
          onClose={() => {
            setStatusVisible(false);
            if (statusType === "success") handleCloseModal();
          }}
        />
      </View>
    </Modal>
  );
};

export default ReportBahaModal;