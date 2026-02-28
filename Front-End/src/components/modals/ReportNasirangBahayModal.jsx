import React, { useState, useEffect, useRef } from "react";
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
  KeyboardAvoidingView,
  Keyboard,
  FlatList,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import StatusModal from "../modals/SuccessFailed/SuccessFailedModal";

// Constants
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

const MATERIAL_UNITS = [
  { label: "Piraso", value: "pcs" },
  { label: "Metro", value: "m" },
  { label: "Kilo", value: "kg" },
  { label: "Litro", value: "L" },
  { label: "Sako", value: "sack" },
];

const ReportNasirangBahayModal = ({
  reportNasirangBahayModalVisible,
  setReportNasirangBahayModalVisible,
  selectedMedia,
  setSelectedMedia,
  location,
  setLocation,
  nasirangBahayData,
  setNasirangBahayData,
  resetReportForms,
  addNasirangBahayReport,
  updateNasirangBahayReport,
  fetchTyphoneName,
  TyphoneName,
  linkId,
  sendAfterReport,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAfterMode, setIsAfterMode] = useState(false);
  const [materials, setMaterials] = useState([
    { name: "", quantity: "", unit: "pcs", cost: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalReportData, setOriginalReportData] = useState(null);

  const [statusVisible, setStatusVisible] = useState(false);
  const [statusType, setStatusType] = useState("success");
  const [statusMessage, setStatusMessage] = useState("");

  // Refs for positioning
  const textInputRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  // Get screen dimensions
  const screenHeight = Dimensions.get('window').height;

  // Filtered Typhoon Names logic
  const filteredTyphoons =
    TyphoneName?.data?.filter((item) =>
      item.typhoonName
        .toLowerCase()
        .includes(nasirangBahayData.typhoonName?.toLowerCase() || "")
    ) || [];

  // ADDED: Function to close modal and reset form
  const closeModalAndReset = () => {
    setReportNasirangBahayModalVisible(false);
    resetForm();
  };

  // Handle TextInput focus and measure position
  const handleTextInputFocus = () => {
    fetchTyphoneName();
    
    // Use setTimeout to ensure the component is rendered before measuring
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.measure((x, y, width, height, pageX, pageY) => {
          setDropdownPosition({
            top: pageY + height + 8, // 8px below the TextInput
            left: pageX,
            width: width,
          });
          
          // Show dropdown if there are filtered typhoons
          if (filteredTyphoons.length > 0) {
            setShowDropdown(true);
          }
        });
      }
    }, 100);
  };

  // Handle TextInput change
  const handleTextInputChange = (text) => {
    setNasirangBahayData({
      ...nasirangBahayData,
      typhoonName: text,
    });
    
    if (text.length > 0) {
      fetchTyphoneName();
      
      // Recalculate position after text change
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.measure((x, y, width, height, pageX, pageY) => {
            setDropdownPosition({
              top: pageY + height + 8,
              left: pageX,
              width: width,
            });
          });
        }
      }, 100);
      
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  // Handle typhoon selection
  const handleSelectTyphoon = (item) => {
    const selectedId = item.id;

    if (item.statusPost === "before" && !item.isRepaired) {
      setOriginalReportData({
        reportId: item.reportId,
        damageType: item.damageType,
        severity: item.severity,
        address: item.address,
        location: item.location,
        typhoonName: item.typhoonName,
      });

      setNasirangBahayData({
        ...nasirangBahayData,
        id: selectedId,
        typhoonName: item.typhoonName,
        reportId: item.reportId,
        damageType: item.damageType,
        severity: item.severity,
        address: item.address,
      });

      setIsAfterMode(true);
      Alert.alert(
        "Update Mode",
        "Mag-submit ng repair report para sa damage na ito."
      );
    } else if (item.statusPost === "before" && item.isRepaired) {
      Alert.alert(
        "Na-repair na",
        "Ang damage report na ito ay may existing repair report na."
      );
      return;
    } else {
      setNasirangBahayData({
        ...nasirangBahayData,
        id: selectedId,
        typhoonName: item.typhoonName,
        reportId: item.reportId,
      });
      setIsAfterMode(false);
    }

    setShowDropdown(false);
    Keyboard.dismiss();
  };

  // Handle click outside dropdown
  const handleBackdropPress = () => {
    if (showDropdown) {
      setShowDropdown(false);
    }
  };

  // Close dropdown on scroll
  const handleScroll = () => {
    if (showDropdown) {
      setShowDropdown(false);
    }
  };

  // Media Picker Logic
  const handleMediaPick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Kailangan ng access sa gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.7,
    });

    if (!result.canceled) {
      const newMedia = result.assets.map((asset) => ({
        uri: asset.uri,
        type: "image",
        id: `${Date.now()}_${Math.random()}`,
        status: isAfterMode ? "after" : "before",
      }));
      setSelectedMedia([...selectedMedia, ...newMedia]);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Kailangan ng access sa camera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) {
      const newMedia = [
        {
          uri: result.assets[0].uri,
          type: "image",
          id: `${Date.now()}_${Math.random()}`,
          status: isAfterMode ? "after" : "before",
        },
      ];
      setSelectedMedia([...selectedMedia, ...newMedia]);
    }
  };

  // GPS Logic
  const handleLocationRequest = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Buksan ang GPS sa settings.");
      return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
    Alert.alert("Success", "Nakuha na ang iyong lokasyon.");
  };

  // Material Functions
  const addMaterialField = () => {
    setMaterials([
      ...materials,
      { name: "", quantity: "", unit: "pcs", cost: "" },
    ]);
  };

  const removeMaterialField = (index) => {
    if (materials.length > 1) {
      const newMaterials = [...materials];
      newMaterials.splice(index, 1);
      setMaterials(newMaterials);
    }
  };

  const updateMaterial = (index, field, value) => {
    const updatedMaterials = [...materials];
    updatedMaterials[index][field] = value;
    setMaterials(updatedMaterials);
  };

  const calculateTotalCost = () => {
    return materials.reduce((total, material) => {
      const cost = parseFloat(material.cost) || 0;
      return total + cost;
    }, 0);
  };

  // Validation Functions
  const validateBeforeReport = () => {
    if (!nasirangBahayData.typhoonName) {
      Alert.alert("Kulang na Datos", "Pangalan ng Bagyo ay kailangan.");
      return false;
    }
    if (selectedMedia.length === 0) {
      Alert.alert("Kulang na Datos", "Kailangan ng kahit isang larawan.");
      return false;
    }
    if (!location) {
      Alert.alert("Kulang na Datos", "Kailangan kunin ang GPS location.");
      return false;
    }
    if (!nasirangBahayData.address) {
      Alert.alert("Kulang na Datos", "Kailangan ang address.");
      return false;
    }
    return true;
  };

  const validateAfterReport = () => {
    if (!nasirangBahayData.typhoonName || !nasirangBahayData.reportId) {
      Alert.alert(
        "Kulang na Datos",
        "Kailangan pumili ng existing damage report."
      );
      return false;
    }
    if (selectedMedia.length === 0) {
      Alert.alert("Kulang na Datos", "Kailangan ng 'after' photos.");
      return false;
    }
    const hasValidMaterial = materials.some(
      (m) => m.name.trim() !== "" && m.cost
    );
    if (!hasValidMaterial) {
      Alert.alert("Kulang na Datos", "Magdagdag ng kahit isang material.");
      return false;
    }
    return true;
  };

  // Reset Form
  const resetForm = () => {
    // Reset parent state through props
    resetReportForms();

    // Reset local state
    setMaterials([{ name: "", quantity: "", unit: "pcs", cost: "" }]);
    setIsAfterMode(false);
    setOriginalReportData(null);
    setShowDropdown(false);
    setIsSubmitting(false);
  };

  // --- MAIN SUBMIT FUNCTION ---
  const handleSubmit = async () => {
    if (isAfterMode ? !validateAfterReport() : !validateBeforeReport()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("typhoonName", nasirangBahayData.typhoonName);
      formData.append("statusPost", isAfterMode ? "after" : "before");
      formData.append("submissionDate", new Date().toISOString());

      if (isAfterMode) {
        formData.append("reportId", nasirangBahayData.reportId);
        formData.append(
          "materialsUsed",
          JSON.stringify(materials.filter((m) => m.name.trim() !== ""))
        );
        formData.append("totalRepairCost", calculateTotalCost().toString());
        formData.append("repairDate", new Date().toISOString());

        selectedMedia.forEach((file, index) => {
          formData.append("afterMedia", {
            uri:
              Platform.OS === "android"
                ? file.uri
                : file.uri.replace("file://", ""),
            type: "image/jpeg",
            name: `after_${Date.now()}_${index}.jpg`,
          });
        });

        // After report submission
        const result = await sendAfterReport(nasirangBahayData.id, formData);
        if (result.success) {
          setStatusType("success");
          setStatusMessage("Successfully Sent Your Damage Report");
        } else {
          setStatusType("error");
          setStatusMessage(result.error || "Failed to Send Your Report.");
        }
        setStatusVisible(true);
      } else {
        formData.append("damageType", nasirangBahayData.damageType || "other");
        formData.append("severity", nasirangBahayData.severity || "low");
        formData.append("address", nasirangBahayData.address || "");
        formData.append("location", JSON.stringify(location));
        formData.append("reportType", "nasirang_bahay");

        selectedMedia.forEach((file, index) => {
          formData.append("beforeMedia", {
            uri:
              Platform.OS === "android"
                ? file.uri
                : file.uri.replace("file://", ""),
            type: "image/jpeg",
            name: `before_${Date.now()}_${index}.jpg`,
          });
        });

        // Before report submission
        const result = await addNasirangBahayReport(formData);
        if (result.success) {
          setStatusType("success");
          setStatusMessage("Successfully Sent Your Damage Report");
        } else {
          setStatusType("error");
          setStatusMessage(result.error || "Failed to Send Your Report.");
        }
        setStatusVisible(true);
      }
    } catch (error) {
      console.error("Submit Error:", error);
      setStatusType("error");
      setStatusMessage(`May problema sa pag-submit: ${error.message}`);
      setStatusVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle status modal close
  const handleStatusClose = () => {
    setStatusVisible(false);

    // If successful submission, reset form and close modal
    if (statusType === "success") {
      resetForm();
      setReportNasirangBahayModalVisible(false);
    }
  };

  const removeMedia = (id) => {
    setSelectedMedia(selectedMedia.filter((item) => item.id !== id));
  };

  // --- INAYOS NA USEEFFECT PARA SA ID ---
  useEffect(() => {
    if (nasirangBahayData.typhoonName && TyphoneName?.data) {
      const matchedTyphoon = TyphoneName.data.find(
        (item) =>
          item.typhoonName.toLowerCase() ===
          nasirangBahayData.typhoonName.toLowerCase()
      );
      if (
        matchedTyphoon &&
        matchedTyphoon.statusPost === "before" &&
        !matchedTyphoon.isRepaired
      ) {
        setIsAfterMode(true);
        setOriginalReportData(matchedTyphoon);
        setNasirangBahayData((prev) => ({
          ...prev,
          id: matchedTyphoon.id,
          reportId: matchedTyphoon.reportId,
          damageType: matchedTyphoon.damageType,
          severity: matchedTyphoon.severity,
          address: matchedTyphoon.address,
        }));
      }
    }
  }, [nasirangBahayData.typhoonName]);

  // Reset form when modal closes
  useEffect(() => {
    if (!reportNasirangBahayModalVisible) {
      setShowDropdown(false);
    }
  }, [reportNasirangBahayModalVisible]);

  return (
    <Modal
      visible={reportNasirangBahayModalVisible}
      animationType="slide"
      onRequestClose={() => {
        if (!isSubmitting) {
          closeModalAndReset();
        }
      }}
      statusBarTranslucent
    >
      {/* CHANGED: Full cyan background with curved white container */}
      <View className="flex-1 bg-cyan-700">
        <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
        
        {/* Header Section with cyan background */}
        <SafeAreaView edges={['top']} style={{ flex: 0 }}>
          <View className="flex-row items-center justify-between px-6 py-5">
            <View className="flex-1">
              <Text className="text-2xl font-black text-white">
                {isAfterMode ? "Repair Report (After)" : "Damage Report (Before)"}
              </Text>
              <Text className="text-white/70 text-sm mt-1">
                {isAfterMode ? "I-submit ang repair details" : "I-report ang damage"}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={closeModalAndReset}
              disabled={isSubmitting}
              className="bg-white/20 p-3 rounded-full active:bg-white/40"
            >
              <Ionicons 
                name="close" 
                size={24} 
                color={isSubmitting ? "rgba(255,255,255,0.5)" : "white"} 
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* CURVED WHITE CONTAINER */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-white rounded-t-[35px] overflow-hidden shadow-2xl"
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 28, paddingBottom: 60 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {/* --- PANGALAN NG BAGYO DROPDOWN SECTION --- */}
            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <Text className="text-gray-700 font-bold">
                  Pangalan ng Bagyo *
                </Text>
                {isAfterMode && (
                  <View className="ml-2 px-2 py-1 bg-blue-100 rounded">
                    <Text className="text-blue-700 text-xs font-bold">
                      UPDATE MODE
                    </Text>
                  </View>
                )}
              </View>
              <TextInput
                ref={textInputRef}
                className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                placeholder="I-type o pumili ng bagyo..."
                value={nasirangBahayData.typhoonName}
                onFocus={handleTextInputFocus}
                onChangeText={handleTextInputChange}
                editable={!isSubmitting}
              />
            </View>

            {/* --- AFTER MODE CONTENT --- */}
            {isAfterMode ? (
              <View className="mb-6">
                {originalReportData && (
                  <View className="mb-6 p-5 bg-gray-50 rounded-2xl border border-gray-200">
                    <Text className="font-bold text-gray-700 mb-3">
                      Original Damage Details
                    </Text>
                    <View className="space-y-2">
                      <Text className="text-gray-600">
                        <Text className="font-bold">Type:</Text>{" "}
                        {DAMAGE_TYPES.find(
                          (d) => d.value === originalReportData.damageType
                        )?.label || originalReportData.damageType}
                      </Text>
                      <Text className="text-gray-600">
                        <Text className="font-bold">Severity:</Text>{" "}
                        {SEVERITY_LEVELS.find(
                          (s) => s.value === originalReportData.severity
                        )?.label || originalReportData.severity}
                      </Text>
                      <Text className="text-gray-600">
                        <Text className="font-bold">Address:</Text>{" "}
                        {originalReportData.address}
                      </Text>
                    </View>
                  </View>
                )}

                {/* --- REPAIR MATERIALS SECTION --- */}
                <View className="mb-6">
                  <Text className="text-gray-700 font-bold mb-3">
                    Repair Materials *
                  </Text>
                  {materials.map((material, index) => (
                    <View
                      key={index}
                      className="bg-white p-4 rounded-xl border border-gray-200 mb-3 shadow-sm"
                    >
                      <View className="flex-row justify-between items-center mb-3">
                        <Text className="font-bold text-gray-600">
                          Material #{index + 1}
                        </Text>
                        {materials.length > 1 && (
                          <TouchableOpacity
                            onPress={() => removeMaterialField(index)}
                            disabled={isSubmitting}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={20}
                              color={isSubmitting ? "gray" : "red"}
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                      <TextInput
                        placeholder="Material Name"
                        value={material.name}
                        onChangeText={(text) =>
                          updateMaterial(index, "name", text)
                        }
                        className="border-b border-gray-100 py-2 mb-3"
                        editable={!isSubmitting}
                      />
                      <View className="flex-row justify-between mb-3">
                        <TextInput
                          placeholder="Qty"
                          value={material.quantity}
                          onChangeText={(text) =>
                            updateMaterial(index, "quantity", text)
                          }
                          keyboardType="numeric"
                          className="w-[48%] border-b border-gray-100 py-2"
                          editable={!isSubmitting}
                        />
                        <View className="w-[48%]">
                          <Text className="text-gray-500 text-xs mb-1">
                            Unit
                          </Text>
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                          >
                            {MATERIAL_UNITS.map((unit) => (
                              <TouchableOpacity
                                key={unit.value}
                                onPress={() =>
                                  updateMaterial(index, "unit", unit.value)
                                }
                                disabled={isSubmitting}
                                className={`mr-2 px-3 py-1 rounded ${
                                  material.unit === unit.value
                                    ? "bg-blue-100"
                                    : "bg-gray-100"
                                } ${isSubmitting ? "opacity-50" : ""}`}
                              >
                                <Text
                                  className={
                                    material.unit === unit.value
                                      ? "text-blue-700 font-bold"
                                      : "text-gray-600"
                                  }
                                >
                                  {unit.label}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      </View>
                      <TextInput
                        placeholder="Cost (₱)"
                        value={material.cost}
                        onChangeText={(text) =>
                          updateMaterial(index, "cost", text)
                        }
                        keyboardType="numeric"
                        className="border-b border-gray-100 py-2"
                        editable={!isSubmitting}
                      />
                    </View>
                  ))}
                  <TouchableOpacity
                    onPress={addMaterialField}
                    disabled={isSubmitting || materials.length >= 10}
                    className={`flex-row items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-xl ${
                      isSubmitting ? "opacity-50" : ""
                    }`}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={20}
                      color="#3b82f6"
                    />
                    <Text className="ml-2 text-blue-600 font-bold">
                      Add Another Material
                    </Text>
                  </TouchableOpacity>
                  {calculateTotalCost() > 0 && (
                    <View className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                      <Text className="text-green-800 font-bold text-center">
                        Total Repair Cost: ₱
                        {calculateTotalCost().toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              /* --- BEFORE MODE CONTENT --- */
              <View className="mb-6 space-y-6">
                <View>
                  <Text className="text-gray-700 font-bold mb-2">
                    Address *
                  </Text>
                  <TextInput
                    className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                    placeholder="Kompletong address..."
                    value={nasirangBahayData.address}
                    onChangeText={(text) =>
                      setNasirangBahayData({
                        ...nasirangBahayData,
                        address: text,
                      })
                    }
                    multiline
                    editable={!isSubmitting}
                  />
                </View>
                <TouchableOpacity
                  onPress={handleLocationRequest}
                  disabled={isSubmitting}
                  className={`flex-row items-center p-4 rounded-xl border ${
                    location
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  } ${isSubmitting ? "opacity-50" : ""}`}
                >
                  <Ionicons
                    name="location"
                    size={24}
                    color={location ? "green" : "gray"}
                  />
                  <View className="ml-3 flex-1">
                    <Text className="font-bold">
                      {location ? "Location Captured ✓" : "Get GPS Location *"}
                    </Text>
                  </View>
                </TouchableOpacity>
                <View>
                  <Text className="text-gray-700 font-bold mb-3">
                    Uri ng Pinsala *
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {DAMAGE_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type.value}
                        onPress={() =>
                          setNasirangBahayData({
                            ...nasirangBahayData,
                            damageType: type.value,
                          })
                        }
                        disabled={isSubmitting}
                        className={`m-1 p-3 rounded-xl border ${
                          nasirangBahayData.damageType === type.value
                            ? "bg-red-500 border-red-500"
                            : "bg-white border-gray-200"
                        } ${isSubmitting ? "opacity-50" : ""}`}
                      >
                        <Text
                          className={
                            nasirangBahayData.damageType === type.value
                              ? "text-white font-bold"
                              : "text-gray-700"
                          }
                        >
                          {type.icon} {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <View>
                  <Text className="text-gray-700 font-bold mb-3">
                    Antas ng Pinsala *
                  </Text>
                  <View className="flex-row justify-between">
                    {SEVERITY_LEVELS.map((level) => (
                      <TouchableOpacity
                        key={level.value}
                        onPress={() =>
                          setNasirangBahayData({
                            ...nasirangBahayData,
                            severity: level.value,
                          })
                        }
                        disabled={isSubmitting}
                        className={`flex-1 mx-1 p-4 rounded-lg border items-center ${
                          nasirangBahayData.severity === level.value
                            ? `bg-${level.color}-500 border-${level.color}-500`
                            : "bg-white border-gray-300"
                        } ${isSubmitting ? "opacity-50" : ""}`}
                      >
                        <Text
                          className={
                            nasirangBahayData.severity === level.value
                              ? "text-white font-bold"
                              : "text-gray-700"
                          }
                        >
                          {level.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* --- PHOTOS SECTION --- */}
            <View className="mb-8">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-700 font-bold">
                  {isAfterMode ? "After Repair Photos *" : "Damage Photos *"}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {selectedMedia.length} / 5 photos
                </Text>
              </View>
              <View className="flex-row space-x-2 mb-3">
                <TouchableOpacity
                  onPress={handleMediaPick}
                  disabled={isSubmitting || selectedMedia.length >= 5}
                  className={`flex-1 flex-row items-center justify-center p-3 bg-blue-50 rounded-xl border border-blue-200 ${
                    isSubmitting || selectedMedia.length >= 5
                      ? "opacity-50"
                      : ""
                  }`}
                >
                  <Text className="ml-2 text-blue-700 font-bold">Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleTakePhoto}
                  disabled={isSubmitting || selectedMedia.length >= 5}
                  className={`flex-1 flex-row items-center justify-center p-3 bg-green-50 rounded-xl border border-green-200 ${
                    isSubmitting || selectedMedia.length >= 5
                      ? "opacity-50"
                      : ""
                  }`}
                >
                  <Text className="ml-2 text-green-700 font-bold">Camera</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {selectedMedia.map((item) => (
                  <View key={item.id} className="mr-3 relative">
                    <Image
                      source={{ uri: item.uri }}
                      className="w-32 h-32 rounded-xl"
                    />
                    <TouchableOpacity
                      onPress={() => removeMedia(item.id)}
                      disabled={isSubmitting}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                    >
                      <Ionicons name="close" size={16} color="white" />
                    </TouchableOpacity>
                    <View className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded">
                      <Text className="text-white text-xs">
                        {item.status === "after" ? "AFTER" : "BEFORE"}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* --- SUBMIT BUTTON --- */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`p-5 rounded-2xl items-center justify-center mb-10 ${
                isSubmitting
                  ? "bg-gray-400"
                  : isAfterMode
                  ? "bg-cyan-600"
                  : "bg-cyan-600"
              }`}
            >
              <Text className="text-white font-bold text-lg">
                {isSubmitting
                  ? "Processing..."
                  : isAfterMode
                  ? "SUBMIT REPAIR REPORT"
                  : "SUBMIT DAMAGE REPORT"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* --- DROPDOWN OVERLAY --- */}
      {showDropdown && filteredTyphoons.length > 0 && (
        <>
          {/* Backdrop to close dropdown when clicking outside */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'transparent',
              zIndex: 999,
            }}
            activeOpacity={1}
            onPress={handleBackdropPress}
          />

          {/* Dropdown container */}
          <View
            style={{
              position: 'absolute',
              top: Math.min(dropdownPosition.top, screenHeight - 250), // Ensure dropdown doesn't go off screen
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              backgroundColor: 'white',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#e5e7eb',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              zIndex: 1000,
              maxHeight: 240,
              overflow: 'hidden',
            }}
          >
            <FlatList
              data={filteredTyphoons}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="p-4 border-b border-gray-50 flex-row justify-between items-center"
                  onPress={() => handleSelectTyphoon(item)}
                  disabled={isSubmitting}
                >
                  <View className="flex-1">
                    <Text className="font-medium">
                      {item.typhoonName}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {item.address}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    {item.statusPost === "before" && !item.isRepaired && (
                      <Text className="text-blue-500 text-xs font-bold mr-2">
                        FOR REPAIR
                      </Text>
                    )}
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="gray"
                    />
                  </View>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={true}
              style={{ maxHeight: 238 }}
              nestedScrollEnabled={true}
            />
          </View>
        </>
      )}

      <StatusModal
        visible={statusVisible}
        type={statusType}
        message={statusMessage}
        onClose={handleStatusClose}
      />
    </Modal>
  );
};

export default ReportNasirangBahayModal;