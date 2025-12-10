import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";

const EvacuationForm = ({
  visible,
  onClose,
  onSubmit,
  selectedBarangay,
  selectedMunicipality,
  editingEvacuation,
  initialData = null,
}) => {
  const [formData, setFormData] = useState({
    evacuationName: "",
    location: {
      address: "",
      latitude: "",
      longitude: "",
    },
    evacuationCapacity: "",
    totalHouseholds: "",
    contactPerson: {
      name: "",
      contactNumber: "",
      email: "",
    },
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState({});
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Effect to populate form when editingEvacuation changes
  useEffect(() => {
    if (editingEvacuation) {
      console.log("Editing evacuation data:", editingEvacuation);
      setFormData({
        evacuationName: editingEvacuation.evacuationName || "",
        location: {
          address: editingEvacuation.location?.address || "",
          latitude: editingEvacuation.location?.latitude?.toString() || "",
          longitude: editingEvacuation.location?.longitude?.toString() || "",
        },
        evacuationCapacity: editingEvacuation.evacuationCapacity?.toString() || "",
        totalHouseholds: editingEvacuation.totalHouseholds?.toString() || "",
        contactPerson: {
          name: editingEvacuation.contactPerson?.name || "",
          contactNumber: editingEvacuation.contactPerson?.contactNumber || "",
          email: editingEvacuation.contactPerson?.email || "",
        },
        isActive: editingEvacuation.isActive !== undefined ? editingEvacuation.isActive : true,
      });
    } else if (initialData) {
      // Fallback to initialData if editingEvacuation is not provided
      setFormData(initialData);
    } else {
      // Reset to empty form for adding new evacuation
      setFormData({
        evacuationName: "",
        location: {
          address: "",
          latitude: "",
          longitude: "",
        },
        evacuationCapacity: "",
        totalHouseholds: "",
        contactPerson: {
          name: "",
          contactNumber: "",
          email: "",
        },
        isActive: true,
      });
    }
    setFormErrors({});
  }, [editingEvacuation, initialData, visible]);

  // Input filtering functions
  const filterNumericInput = (text) => {
    return text.replace(/[^0-9]/g, "");
  };

  const filterDecimalInput = (text) => {
    // Allow numbers and one decimal point
    const cleaned = text.replace(/[^0-9.]/g, "");
    // Ensure only one decimal point
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }
    return cleaned;
  };

  const filterNameInput = (text) => {
    // Allow letters, spaces, hyphens, apostrophes, and Filipino characters
    return text.replace(/[^a-zA-Z\s\-'ñÑáéíóúÁÉÍÓÚüÜ]/g, "");
  };

  const filterEvacuationName = (text) => {
    // Allow letters, numbers, spaces, and common punctuation
    return text.replace(/[^a-zA-Z0-9\s\-.,()&ñÑáéíóúÁÉÍÓÚüÜ]/g, "");
  };

  const filterPhoneNumber = (text) => {
    // Allow numbers, plus sign, parentheses, hyphens, and spaces
    return text.replace(/[^0-9+()\-\s]/g, "");
  };

  const filterEmail = (text) => {
    // Basic email characters filter
    return text.replace(/[^a-zA-Z0-9@._+\-]/g, "");
  };

  const handleFormChange = (field, value) => {
    let filteredValue = value;

    // Apply filters based on field type
    switch (field) {
      case "evacuationName":
        filteredValue = filterEvacuationName(value);
        break;
      case "evacuationCapacity":
      case "totalHouseholds":
        filteredValue = filterNumericInput(value);
        break;
      case "contactPerson.name":
        filteredValue = filterNameInput(value);
        break;
      case "contactPerson.contactNumber":
        filteredValue = filterPhoneNumber(value);
        break;
      case "contactPerson.email":
        filteredValue = filterEmail(value);
        break;
      case "location.latitude":
      case "location.longitude":
        filteredValue = filterDecimalInput(value);
        break;
      case "location.address":
        // Address can have any characters
        filteredValue = value;
        break;
      default:
        filteredValue = value;
    }

    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: filteredValue,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: filteredValue,
      }));
    }

    // Clear error for this field if it exists
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to get GPS coordinates.",
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

      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        },
      }));

      setFormErrors((prev) => ({
        ...prev,
        latitude: undefined,
        longitude: undefined,
      }));

      Alert.alert(
        "Location Acquired",
        `GPS coordinates successfully captured:\nLatitude: ${latitude.toFixed(
          6
        )}\nLongitude: ${longitude.toFixed(6)}`,
        [{ text: "OK" }]
      );

      try {
        let geocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (geocode && geocode[0]) {
          const address = geocode[0];
          const addressParts = [];

          if (address.name) addressParts.push(address.name);
          if (address.street) addressParts.push(address.street);
          if (address.city) addressParts.push(address.city);
          if (address.region) addressParts.push(address.region);
          if (address.country) addressParts.push(address.country);

          const fullAddress = addressParts.join(", ");

          if (fullAddress) {
            setFormData((prev) => ({
              ...prev,
              location: {
                ...prev.location,
                address: fullAddress,
              },
            }));
          }
        }
      } catch (geocodeError) {
        console.log("Geocoding error:", geocodeError);
      }
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert(
        "Location Error",
        "Unable to get current location. Please make sure GPS is enabled and try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.evacuationName.trim()) {
      errors.evacuationName = "Evacuation center name is required";
    } else if (formData.evacuationName.trim().length < 3) {
      errors.evacuationName = "Name must be at least 3 characters";
    }

    if (!formData.location.address.trim()) {
      errors.locationAddress = "Address is required";
    }

    if (!formData.location.latitude) {
      errors.latitude = "Latitude is required";
    } else if (isNaN(parseFloat(formData.location.latitude))) {
      errors.latitude = "Latitude must be a valid number";
    } else {
      const lat = parseFloat(formData.location.latitude);
      if (lat < -90 || lat > 90) {
        errors.latitude = "Latitude must be between -90 and 90";
      }
    }

    if (!formData.location.longitude) {
      errors.longitude = "Longitude is required";
    } else if (isNaN(parseFloat(formData.location.longitude))) {
      errors.longitude = "Longitude must be a valid number";
    } else {
      const lng = parseFloat(formData.location.longitude);
      if (lng < -180 || lng > 180) {
        errors.longitude = "Longitude must be between -180 and 180";
      }
    }

    if (!formData.evacuationCapacity) {
      errors.evacuationCapacity = "Capacity is required";
    } else if (
      isNaN(formData.evacuationCapacity) ||
      parseInt(formData.evacuationCapacity) <= 0
    ) {
      errors.evacuationCapacity = "Capacity must be a positive number";
    } else if (parseInt(formData.evacuationCapacity) > 999999) {
      errors.evacuationCapacity = "Capacity is too large";
    }

    if (
      formData.totalHouseholds &&
      (isNaN(formData.totalHouseholds) ||
        parseInt(formData.totalHouseholds) < 0)
    ) {
      errors.totalHouseholds = "Households must be a non-negative number";
    } else if (parseInt(formData.totalHouseholds) > 999999) {
      errors.totalHouseholds = "Household count is too large";
    }

    if (!formData.contactPerson.name.trim()) {
      errors.contactName = "Contact person name is required";
    } else if (formData.contactPerson.name.trim().length < 2) {
      errors.contactName = "Name must be at least 2 characters";
    }

    if (!formData.contactPerson.contactNumber.trim()) {
      errors.contactNumber = "Contact number is required";
    } else {
      const phone = formData.contactPerson.contactNumber.replace(/[^0-9]/g, "");
      if (phone.length < 10) {
        errors.contactNumber = "Contact number must be at least 10 digits";
      }
    }

    if (
      formData.contactPerson.email &&
      !/\S+@\S+\.\S+/.test(formData.contactPerson.email)
    ) {
      errors.contactEmail = "Email is invalid";
    }

    if (!selectedBarangay) {
      errors.barangay = "Barangay is required";
    } else if (!selectedBarangay._id) {
      errors.barangay = "Barangay ID is missing";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!selectedBarangay || !selectedBarangay._id) {
      Alert.alert(
        "Error",
        "Cannot save evacuation center without a valid barangay reference."
      );
      return;
    }

    if (!validateForm()) {
      Alert.alert(
        "Validation Error",
        "Please fill in all required fields correctly."
      );
      return;
    }

    const processedData = {
      ...formData,
      evacuationName: formData.evacuationName.trim(),
      evacuationCapacity: parseInt(formData.evacuationCapacity),
      totalHouseholds: parseInt(formData.totalHouseholds) || 0,
      location: {
        ...formData.location,
        latitude: parseFloat(formData.location.latitude),
        longitude: parseFloat(formData.location.longitude),
        address: formData.location.address.trim(),
      },
      contactPerson: {
        ...formData.contactPerson,
        name: formData.contactPerson.name.trim(),
        contactNumber: formData.contactPerson.contactNumber.trim(),
        email: formData.contactPerson.email.trim(),
      },
      barangay: selectedBarangay._id,
      barangayReference: {
        _id: selectedBarangay._id,
        name:
          selectedBarangay?.barangayName ||
          selectedBarangay?.fullAddress?.split(",")[0] ||
          "Unknown Barangay",
        municipality: selectedMunicipality?.name || "Unknown Municipality",
      },
      savedAt: new Date().toISOString(),
    };

    // If editing, preserve the original _id
    if (editingEvacuation && editingEvacuation._id) {
      processedData._id = editingEvacuation._id;
    }

    Alert.alert(
      "Success",
      `Evacuation center "${processedData.evacuationName}" has been ${
        editingEvacuation ? "updated" : "saved"
      } successfully!\n\nBarangay: ${
        processedData.barangayReference.name
      }\nMunicipality: ${processedData.barangayReference.municipality}`,
      [
        {
          text: "OK",
          onPress: () => {
            resetForm();
            onSubmit(processedData);
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      evacuationName: "",
      location: {
        address: "",
        latitude: "",
        longitude: "",
      },
      evacuationCapacity: "",
      totalHouseholds: "",
      contactPerson: {
        name: "",
        contactNumber: "",
        email: "",
      },
      isActive: true,
    });
    setFormErrors({});
    setIsGettingLocation(false);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => {
        onClose();
        resetForm();
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[90%]">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="p-6 border-b border-gray-200 ">
                <View className="flex-row items-center justify-between mb-4 ">
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-gray-800">
                      {editingEvacuation ? "Edit" : "Add"} Evacuation Center
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      {selectedBarangay?.barangayName ||
                        selectedBarangay?.fullAddress?.split(",")[0]}
                      , {selectedMunicipality?.name}
                    </Text>
                    <View className="mt-1">
                      <Text className="text-xs text-cyan-600">
                        Barangay ID: {selectedBarangay?._id || "N/A"}
                        {editingEvacuation && editingEvacuation._id && (
                          <Text> | Evacuation ID: {editingEvacuation._id}</Text>
                        )}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      onClose();
                      resetForm();
                    }}
                    className="p-2 rounded-lg bg-gray-50 ml-4"
                  >
                    <MaterialIcons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-cyan-100 items-center justify-center mr-3">
                    <MaterialIcons
                      name="safety-divider"
                      size={22}
                      color="#0891B2"
                    />
                  </View>
                  <Text className="text-cyan-700 font-medium">
                    Fill in the details below to{" "}
                    {editingEvacuation ? "update" : "add a new"} evacuation center
                  </Text>
                </View>
              </View>

              <View className="p-6">
                {(!selectedBarangay || !selectedBarangay._id) && (
                  <View className="mb-4 p-3 bg-red-50 rounded-xl border border-red-200">
                    <View className="flex-row items-center">
                      <MaterialIcons name="error" size={18} color="#DC2626" />
                      <Text className="text-red-700 font-medium ml-2">
                        Barangay Reference Missing
                      </Text>
                    </View>
                    <Text className="text-red-600 text-sm mt-1">
                      Cannot save evacuation center without a valid barangay
                      reference.
                    </Text>
                  </View>
                )}

                <View className="mb-6">
                  <View className="flex-row items-center mb-4">
                    <View className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center mr-3">
                      <MaterialIcons name="info" size={18} color="#4F46E5" />
                    </View>
                    <Text className="text-lg font-semibold text-gray-800">
                      Basic Information
                    </Text>
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">
                      Evacuation Center Name{" "}
                      <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                      className={`bg-white p-4 rounded-xl border ${
                        formErrors.evacuationName
                          ? "border-red-300"
                          : "border-gray-200"
                      } text-base`}
                      placeholder="e.g., Poblacion Central Elementary School"
                      placeholderTextColor="#9ca3af"
                      value={formData.evacuationName}
                      onChangeText={(value) =>
                        handleFormChange("evacuationName", value)
                      }
                      maxLength={100}
                    />
                    {formErrors.evacuationName && (
                      <Text className="text-red-500 text-sm mt-1 ml-2">
                        {formErrors.evacuationName}
                      </Text>
                    )}
                    <Text className="text-gray-500 text-xs mt-2 ml-2">
                      Enter a descriptive name for the evacuation center
                    </Text>
                  </View>
                </View>

                <View className="mb-6">
                  <View className="flex-row items-center mb-4">
                    <View className="w-8 h-8 rounded-full bg-cyan-100 items-center justify-center mr-3">
                      <MaterialIcons
                        name="location-on"
                        size={18}
                        color="#0891B2"
                      />
                    </View>
                    <Text className="text-lg font-semibold text-gray-800">
                      Location Details
                    </Text>
                  </View>

                  <View className="mb-4">
                    <TouchableOpacity
                      className={`flex-row items-center justify-center px-4 py-3 rounded-xl ${
                        isGettingLocation ? "bg-cyan-400" : "bg-cyan-600"
                      }`}
                      onPress={getCurrentLocation}
                      disabled={isGettingLocation}
                    >
                      {isGettingLocation ? (
                        <>
                          <MaterialIcons
                            name="gps-fixed"
                            size={20}
                            color="white"
                          />
                          <Text className="text-white font-medium ml-2">
                            Getting Location...
                          </Text>
                        </>
                      ) : (
                        <>
                          <MaterialIcons
                            name="gps-fixed"
                            size={20}
                            color="white"
                          />
                          <Text className="text-white font-medium ml-2">
                            Get Current GPS Location
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <Text className="text-gray-500 text-xs mt-2 ml-2">
                      Tap the button above to automatically get your current GPS
                      coordinates
                    </Text>
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">
                      Address <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                      className={`bg-white p-4 rounded-xl border ${
                        formErrors.locationAddress
                          ? "border-red-300"
                          : "border-gray-200"
                      } text-base`}
                      placeholder="Full address of the evacuation center"
                      placeholderTextColor="#9ca3af"
                      value={formData.location.address}
                      onChangeText={(value) =>
                        handleFormChange("location.address", value)
                      }
                      multiline
                      numberOfLines={3}
                      maxLength={200}
                    />
                    {formErrors.locationAddress && (
                      <Text className="text-red-500 text-sm mt-1 ml-2">
                        {formErrors.locationAddress}
                      </Text>
                    )}
                  </View>

                  <View className="flex-row mb-4">
                    <View className="flex-1 mr-2">
                      <Text className="text-gray-700 font-medium mb-2">
                        Latitude <Text className="text-red-500">*</Text>
                      </Text>
                      <TextInput
                        className={`bg-white p-4 rounded-xl border ${
                          formErrors.latitude
                            ? "border-red-300"
                            : "border-gray-200"
                        } text-base`}
                        placeholder="e.g., 14.5995"
                        placeholderTextColor="#9ca3af"
                        value={formData.location.latitude}
                        onChangeText={(value) =>
                          handleFormChange("location.latitude", value)
                        }
                        keyboardType="decimal-pad"
                        maxLength={15}
                      />
                      {formErrors.latitude && (
                        <Text className="text-red-500 text-sm mt-1 ml-2">
                          {formErrors.latitude}
                        </Text>
                      )}
                    </View>
                    <View className="flex-1 ml-2">
                      <Text className="text-gray-700 font-medium mb-2">
                        Longitude <Text className="text-red-500">*</Text>
                      </Text>
                      <TextInput
                        className={`bg-white p-4 rounded-xl border ${
                          formErrors.longitude
                            ? "border-red-300"
                            : "border-gray-200"
                        } text-base`}
                        placeholder="e.g., 120.9842"
                        placeholderTextColor="#9ca3af"
                        value={formData.location.longitude}
                        onChangeText={(value) =>
                          handleFormChange("location.longitude", value)
                        }
                        keyboardType="decimal-pad"
                        maxLength={15}
                      />
                      {formErrors.longitude && (
                        <Text className="text-red-500 text-sm mt-1 ml-2">
                          {formErrors.longitude}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View className="bg-cyan-50 p-4 rounded-xl mb-4">
                    <View className="flex-row items-start">
                      <MaterialIcons
                        name="gps-not-fixed"
                        size={18}
                        color="#0891B2"
                      />
                      <View className="ml-2 flex-1">
                        <Text className="text-cyan-700 font-medium mb-1">
                          GPS Tips:
                        </Text>
                        <Text className="text-cyan-600 text-xs">
                          1. Make sure your device's GPS is turned on
                        </Text>
                        <Text className="text-cyan-600 text-xs">
                          2. Stand at the location of the evacuation center
                        </Text>
                        <Text className="text-cyan-600 text-xs">
                          3. Wait for the location to stabilize for better
                          accuracy
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View className="mb-6">
                  <View className="flex-row items-center mb-4">
                    <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
                      <MaterialIcons name="people" size={18} color="#059669" />
                    </View>
                    <Text className="text-lg font-semibold text-gray-800">
                      Capacity Details
                    </Text>
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">
                      Maximum Capacity <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                      className={`bg-white p-4 rounded-xl border ${
                        formErrors.evacuationCapacity
                          ? "border-red-300"
                          : "border-gray-200"
                      } text-base`}
                      placeholder="Number of people the center can accommodate"
                      placeholderTextColor="#9ca3af"
                      value={formData.evacuationCapacity}
                      onChangeText={(value) =>
                        handleFormChange("evacuationCapacity", value)
                      }
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                    {formErrors.evacuationCapacity && (
                      <Text className="text-red-500 text-sm mt-1 ml-2">
                        {formErrors.evacuationCapacity}
                      </Text>
                    )}
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">
                      Total Households
                    </Text>
                    <TextInput
                      className={`bg-white p-4 rounded-xl border ${
                        formErrors.totalHouseholds
                          ? "border-red-300"
                          : "border-gray-200"
                      } text-base`}
                      placeholder="Number of households in the area (optional)"
                      placeholderTextColor="#9ca3af"
                      value={formData.totalHouseholds}
                      onChangeText={(value) =>
                        handleFormChange("totalHouseholds", value)
                      }
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                    {formErrors.totalHouseholds && (
                      <Text className="text-red-500 text-sm mt-1 ml-2">
                        {formErrors.totalHouseholds}
                      </Text>
                    )}
                  </View>
                </View>

                <View className="mb-6">
                  <View className="flex-row items-center mb-4">
                    <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center mr-3">
                      <MaterialIcons name="person" size={18} color="#8B5CF6" />
                    </View>
                    <Text className="text-lg font-semibold text-gray-800">
                      Contact Person
                    </Text>
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">
                      Name <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                      className={`bg-white p-4 rounded-xl border ${
                        formErrors.contactName
                          ? "border-red-300"
                          : "border-gray-200"
                      } text-base`}
                      placeholder="Full name of contact person"
                      placeholderTextColor="#9ca3af"
                      value={formData.contactPerson.name}
                      onChangeText={(value) =>
                        handleFormChange("contactPerson.name", value)
                      }
                      maxLength={50}
                    />
                    {formErrors.contactName && (
                      <Text className="text-red-500 text-sm mt-1 ml-2">
                        {formErrors.contactName}
                      </Text>
                    )}
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">
                      Contact Number <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                      className={`bg-white p-4 rounded-xl border ${
                        formErrors.contactNumber
                          ? "border-red-300"
                          : "border-gray-200"
                      } text-base`}
                      placeholder="e.g., 09123456789 or +63 912 345 6789"
                      placeholderTextColor="#9ca3af"
                      value={formData.contactPerson.contactNumber}
                      onChangeText={(value) =>
                        handleFormChange("contactPerson.contactNumber", value)
                      }
                      keyboardType="phone-pad"
                      maxLength={20}
                    />
                    {formErrors.contactNumber && (
                      <Text className="text-red-500 text-sm mt-1 ml-2">
                        {formErrors.contactNumber}
                      </Text>
                    )}
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">
                      Email Address
                    </Text>
                    <TextInput
                      className={`bg-white p-4 rounded-xl border ${
                        formErrors.contactEmail
                          ? "border-red-300"
                          : "border-gray-200"
                      } text-base`}
                      placeholder="email@example.com (optional)"
                      placeholderTextColor="#9ca3af"
                      value={formData.contactPerson.email}
                      onChangeText={(value) =>
                        handleFormChange("contactPerson.email", value)
                      }
                      keyboardType="email-address"
                      autoCapitalize="none"
                      maxLength={50}
                    />
                    {formErrors.contactEmail && (
                      <Text className="text-red-500 text-sm mt-1 ml-2">
                        {formErrors.contactEmail}
                      </Text>
                    )}
                  </View>
                </View>

                <View className="mb-8">
                  <View className="flex-row items-center mb-4">
                    <View className="w-8 h-8 rounded-full bg-yellow-100 items-center justify-center mr-3">
                      <MaterialIcons
                        name="toggle-on"
                        size={18}
                        color="#D97706"
                      />
                    </View>
                    <Text className="text-lg font-semibold text-gray-800">
                      Status
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl">
                    <View>
                      <Text className="text-gray-700 font-medium">
                        Active Status
                      </Text>
                      <Text className="text-gray-500 text-sm mt-1">
                        Set whether this evacuation center is currently
                        operational
                      </Text>
                    </View>
                    <Switch
                      value={formData.isActive}
                      onValueChange={(value) =>
                        handleFormChange("isActive", value)
                      }
                      trackColor={{ false: "#D1D5DB", true: "#10B981" }}
                      thumbColor={formData.isActive ? "#FFFFFF" : "#FFFFFF"}
                    />
                  </View>
                </View>

                <View className="flex-row space-x-3 mb-6">
                  <TouchableOpacity
                    className="flex-1 px-4 py-3.5 bg-gray-100 rounded-xl border border-gray-300 flex-row items-center justify-center"
                    onPress={() => {
                      onClose();
                      resetForm();
                    }}
                  >
                    <MaterialIcons name="cancel" size={20} color="#6B7280" />
                    <Text className="text-gray-700 font-medium ml-2">
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`flex-1 px-4 py-3.5 ${
                      selectedBarangay?._id ? "bg-cyan-600" : "bg-gray-400"
                    } rounded-xl flex-row items-center justify-center`}
                    onPress={handleSubmit}
                    disabled={!selectedBarangay?._id}
                  >
                    <MaterialIcons name="save" size={20} color="white" />
                    <Text className="text-white font-medium ml-2">
                      {editingEvacuation ? "Update" : "Save"} Evacuation Center
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="bg-cyan-50 p-4 rounded-xl">
                  <View className="flex-row items-start">
                    <MaterialIcons name="info" size={18} color="#0891B2" />
                    <Text className="text-cyan-700 text-sm ml-2 flex-1">
                      <Text className="font-medium">Note: </Text>
                      Fields marked with <Text className="text-red-500">
                        *
                      </Text>{" "}
                      are required. The evacuation center will be linked to
                      Barangay:{" "}
                      {selectedBarangay?.barangayName ||
                        selectedBarangay?.fullAddress?.split(",")[0] ||
                        "Unknown Barangay"}
                      {!selectedBarangay?._id &&
                        " (Barangay ID missing - cannot save)"}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EvacuationForm;