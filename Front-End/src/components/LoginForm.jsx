import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Alert,
  Platform,
  View,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import LoginScreen from "../components/modals/Login/LoginScreen";
import RegistrationWizard from "../components/modals/Registration/RegistrationWizard";

export default function LoginForm({
  slide,
  email,
  setEmail,
  password,
  setPassword,
  handleLogin,
  isLoading,
  signup,
  navigation,
  DropdowndataLead = [],
  fetchHouseholdLeadsForDropdown,
  BarangaysDropdownData = [],
}) {
  const [showLogin, setShowLogin] = useState(true); // true = login, false = registration

  // Registration states
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showBarangayDropdown, setShowBarangayDropdown] = useState(false);
  const [showHouseholdLeadDropdown, setShowHouseholdLeadDropdown] = useState(false);
  const [showRelationshipDropdown, setShowRelationshipDropdown] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthDate, setBirthDate] = useState(new Date());
  const [filteredHouseholdLeads, setFilteredHouseholdLeads] = useState([]);
  const [filteredBarangays, setFilteredBarangays] = useState([]);
  const [barangaySearchText, setBarangaySearchText] = useState("");
  const [isRegisteringNewBarangay, setIsRegisteringNewBarangay] = useState(false);
  const [newBarangayName, setNewBarangayName] = useState("");
  const [showRegisterBarangayModal, setShowRegisterBarangayModal] = useState(false);
  const [isLoadingHouseholdLeads, setIsLoadingHouseholdLeads] = useState(false);

  const [registrationData, setRegistrationData] = useState({
    fullName: "",
    contactNumber: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
    organization: "",
    barangay: "",
    barangayId: "",
    familyMembers: "",
    idNumber: "",
    householdLead: "",
    householdLeadId: "",
    relationship: "",
    householdAddress: "",
    role: "",
    disability: "",
    birthDate: "",
  });

  // Refs
  const isInitialMount = useRef(true);
  const prevBarangayIdRef = useRef(null);
  const prevSelectedRoleRef = useRef(null);
  const shouldShowNoLeadsAlertRef = useRef(true);

  // Roles and relationships
  const roles = [
    {
      id: 1,
      title: "Rescuer",
      icon: "🚑",
      description: "Emergency response personnel",
      value: "rescuer",
    },
    {
      id: 2,
      title: "Household Lead",
      icon: "👨‍👩‍👧‍👦",
      description: "Head of a household",
      value: "household_lead",
    },
    {
      id: 3,
      title: "Brgy. Captain",
      icon: "👨‍⚖️",
      description: "Barangay official",
      value: "brgy_captain",
    },
    {
      id: 4,
      title: "Member of Household",
      icon: "👤",
      description: "Member of an existing household",
      value: "household_member",
    },
  ];

  const relationships = [
    "Spouse",
    "Child",
    "Son",
    "Daughter",
    "Parent",
    "Father",
    "Mother",
    "Sibling",
    "Brother",
    "Sister",
    "Grandchild",
    "Grandparent",
    "Relative",
    "Cousin",
    "Nephew/Niece",
    "Uncle/Aunt",
    "Other Family Member",
    "Other",
  ];

  // Utility functions
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = `0${d.getMonth() + 1}`.slice(-2);
    const day = `0${d.getDate()}`.slice(-2);
    return `${year}-${month}-${day}`;
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  const getFilteredBarangays = useCallback(() => {
    if (!Array.isArray(BarangaysDropdownData)) {
      return [];
    }

    const filtered = BarangaysDropdownData.filter(
      (item) =>
        item &&
        item.barangayName &&
        item.barangayName.trim() !== "" &&
        item.barangayName !== "fewfwffewfwf"
    );

    return filtered.sort((a, b) =>
      a.barangayName.localeCompare(b.barangayName)
    );
  }, [BarangaysDropdownData]);

  // Fetch household leads
  const fetchHouseholdLeads = useCallback(
    async (barangayId = null, showAlertOnNoResults = true) => {
      try {
        setIsLoadingHouseholdLeads(true);
        shouldShowNoLeadsAlertRef.current = showAlertOnNoResults;

        let leads = [];
        if (fetchHouseholdLeadsForDropdown) {
          leads = await fetchHouseholdLeadsForDropdown(barangayId);
        } else {
          if (Array.isArray(DropdowndataLead)) {
            if (barangayId) {
              leads = DropdowndataLead.filter(
                (lead) => lead.barangayId === barangayId || !lead.barangayId
              );
            } else {
              leads = DropdowndataLead;
            }
          }
        }
        setFilteredHouseholdLeads(leads || []);

        if (shouldShowNoLeadsAlertRef.current && (leads || []).length === 0 && barangayId) {
          const selectedBarangay = getFilteredBarangays().find(
            (b) => b._id === barangayId
          );
        }
      } catch (error) {
        console.error("Error fetching household leads:", error);
        if (Array.isArray(DropdowndataLead)) {
          setFilteredHouseholdLeads(DropdowndataLead);
        } else {
          setFilteredHouseholdLeads([]);
        }
        
        if (shouldShowNoLeadsAlertRef.current) {
          Alert.alert("Error", "Failed to fetch household leads");
        }
      } finally {
        setIsLoadingHouseholdLeads(false);
      }
    },
    [fetchHouseholdLeadsForDropdown, DropdowndataLead, getFilteredBarangays]
  );

  useEffect(() => {
    if (showBarangayDropdown) {
      const barangayData = getFilteredBarangays();
      setFilteredBarangays(barangayData);
      setBarangaySearchText("");
    }
  }, [showBarangayDropdown, getFilteredBarangays]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const shouldFetch =
      selectedRole?.value === "household_member" &&
      registrationData.barangayId &&
      !isLoadingHouseholdLeads &&
      registrationData.barangayId !== prevBarangayIdRef.current;

    if (shouldFetch) {
      prevBarangayIdRef.current = registrationData.barangayId;

      const fetchData = async () => {
        await fetchHouseholdLeads(registrationData.barangayId, true);
      };

      fetchData();
    }
  }, [
    registrationData.barangayId,
    selectedRole?.value,
    isLoadingHouseholdLeads,
    fetchHouseholdLeads,
  ]);

  useEffect(() => {
    if (selectedRole?.value !== prevSelectedRoleRef.current) {
      prevSelectedRoleRef.current = selectedRole?.value;
      prevBarangayIdRef.current = null;
      shouldShowNoLeadsAlertRef.current = true;
    }
  }, [selectedRole?.value]);

  // Handlers
  const handleRegisterPress = () => {
    setShowLogin(false);
  };

  const handleBackToLogin = () => {
    setShowLogin(true);
    resetRegistrationForm();
  };

  const handleInputChange = useCallback((field, value) => {
    setRegistrationData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      if (
        field === "barangayId" &&
        prev.householdLeadId &&
        value !== prev.barangayId
      ) {
        newData.householdLead = "";
        newData.householdLeadId = "";
        newData.householdAddress = "";
      }

      return newData;
    });
  }, []);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
      const formattedDate = formatDate(selectedDate);
      handleInputChange("birthDate", formattedDate);

      const age = calculateAge(selectedDate);
      if (age < 0 || age > 120) {
        Alert.alert("Invalid Date", "Please select a valid birth date");
      }
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const showFilteredHouseholdLeadDropdown = async () => {
    shouldShowNoLeadsAlertRef.current = false;

    if (!registrationData.barangayId) {
      if (Array.isArray(DropdowndataLead) && DropdowndataLead.length > 0) {
        setFilteredHouseholdLeads(DropdowndataLead);
      }
    } else if (filteredHouseholdLeads.length === 0) {
      await fetchHouseholdLeads(registrationData.barangayId, false);
    }

    setShowHouseholdLeadDropdown(true);
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!registrationData.fullName || !registrationData.contactNumber) {
          Alert.alert(
            "Validation Error",
            "Please fill in required personal information fields"
          );
          return false;
        }
        return true;

      case 2:
        if (
          !registrationData.email ||
          !registrationData.password ||
          !registrationData.confirmPassword
        ) {
          Alert.alert(
            "Validation Error",
            "Please fill in all account information fields"
          );
          return false;
        }

        if (registrationData.password !== registrationData.confirmPassword) {
          Alert.alert("Validation Error", "Passwords do not match");
          return false;
        }

        if (registrationData.password.length < 6) {
          Alert.alert(
            "Validation Error",
            "Password must be at least 6 characters long"
          );
          return false;
        }

        return true;

      case 3:
        if (selectedRole.value === "rescuer") {
          if (!registrationData.organization || !registrationData.idNumber) {
            Alert.alert(
              "Validation Error",
              "Please fill in all rescuer details"
            );
            return false;
          }
        } else if (selectedRole.value === "household_lead") {
          if (!registrationData.familyMembers) {
            Alert.alert(
              "Validation Error",
              "Please fill in number of family members"
            );
            return false;
          }
        } else if (selectedRole.value === "brgy_captain") {
          if (!registrationData.idNumber) {
            Alert.alert(
              "Validation Error",
              "Please enter your official ID number"
            );
            return false;
          }
        } else if (selectedRole.value === "household_member") {
          if (!registrationData.birthDate) {
            Alert.alert("Validation Error", "Please select your birth date");
            return false;
          }
          const birthDateObj = new Date(registrationData.birthDate);
          const age = calculateAge(birthDateObj);
          if (age < 0 || age > 120) {
            Alert.alert("Validation Error", "Please enter a valid birth date");
            return false;
          }
        }
        return true;

      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep()) {
      nextStep();
    }
  };

const handleSubmitRegistration = async () => {
  if (!validateStep()) {
    return;
  }

  setIsSignupLoading(true);

  try {
    const formData = {
      fullName: registrationData.fullName,
      email: registrationData.email,
      password: registrationData.password,
      contactNumber: registrationData.contactNumber,
      address: registrationData.address || "",
      role: registrationData.role,
      ...(registrationData.organization && {
        organization: registrationData.organization,
      }),
      ...(registrationData.idNumber && {
        idNumber: registrationData.idNumber,
      }),
      ...(registrationData.role !== "brgy_captain" &&
        registrationData.barangay && {
          barangay: registrationData.barangayId,
        }),
      ...(registrationData.familyMembers && {
        familyMembers: registrationData.familyMembers,
      }),
      ...(registrationData.householdLeadId && {
        householdLeadId: registrationData.householdLeadId,
      }),
      ...(registrationData.relationship && {
        relationship: registrationData.relationship,
      }),
      ...(registrationData.householdLead && {
        householdLeadName: registrationData.householdLead,
      }),
      ...(registrationData.householdAddress && {
        householdAddress: registrationData.householdAddress,
      }),
      ...(registrationData.role === "household_member" && {
        disability: registrationData.disability || "",
        birthDate: registrationData.birthDate,
        age: calculateAge(new Date(registrationData.birthDate)),
      }),
      ...(selectedRole?.value === "brgy_captain" && {
        ...(registrationData.barangayId && {
          barangayName: registrationData.barangayId,
        }),
        ...(isRegisteringNewBarangay && {
          isNewBarangay: true,
          newBarangayName: newBarangayName,
        }),
      }),
      // Include GPS coordinates for household_lead
      ...(selectedRole?.value === "household_lead" && {
        ...(registrationData.latitude && {
          latitude: registrationData.latitude,
        }),
        ...(registrationData.longitude && {
          longitude: registrationData.longitude,
        }),
        ...(registrationData.gpsCoordinates && {
          gpsCoordinates: registrationData.gpsCoordinates,
        }),
        ...(registrationData.emergencyContact && {
          emergencyContact: registrationData.emergencyContact,
        }),
      }),
    };

    // For household_lead, ensure GPS coordinates are provided
    if (selectedRole?.value === "household_lead") {
      if (!registrationData.latitude || !registrationData.longitude) {
        Alert.alert(
          "GPS Required",
          "Please get your GPS location to register as a household lead. This is required for emergency response.",
          [{ text: "OK" }]
        );
        setIsSignupLoading(false);
        return;
      }
    }

    const result = await signup(formData);

    if (result.success) {
      if (
        selectedRole?.value === "brgy_captain" &&
        isRegisteringNewBarangay
      ) {
        Alert.alert(
          "Registration Successful!",
          `Your account has been created and "${newBarangayName}" will be added to the system after verification.\n\nPlease check your email for further instructions.`,
          [
            {
              text: "OK",
              onPress: () => {
                handleBackToLogin();
              },
            },
          ]
        );
      } else if (result.verificationRequired) {
        Alert.alert(
          "Registration Successful",
          result.message ||
            "Please wait for verification from your household lead.",
          [
            {
              text: "OK",
              onPress: () => {
                handleBackToLogin();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Registration Successful",
          result.message || "Your account has been created successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                handleBackToLogin();
              },
            },
          ]
        );
      }
    } else {
      Alert.alert(
        "Registration Failed",
        result.message || "Something went wrong. Please try again."
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    Alert.alert("Error", "An unexpected error occurred. Please try again.");
  } finally {
    setIsSignupLoading(false);
  }
};

  const resetRegistrationForm = () => {
    setRegistrationData({
      fullName: "",
      contactNumber: "",
      address: "",
      email: "",
      password: "",
      confirmPassword: "",
      organization: "",
      barangay: "",
      barangayId: "",
      familyMembers: "",
      idNumber: "",
      householdLead: "",
      householdLeadId: "",
      relationship: "",
      householdAddress: "",
      role: "",
      disability: "",
      birthDate: "",
    });
    setSelectedRole(null);
    setCurrentStep(1);
    setBirthDate(new Date());
    setShowBarangayDropdown(false);
    setShowHouseholdLeadDropdown(false);
    setShowRelationshipDropdown(false);
    setShowDatePicker(false);
    setFilteredHouseholdLeads([]);
    setIsRegisteringNewBarangay(false);
    setNewBarangayName("");
    setShowRegisterBarangayModal(false);
    setRoleModalVisible(false);

    // Reset refs
    isInitialMount.current = true;
    prevBarangayIdRef.current = null;
    prevSelectedRoleRef.current = null;
    shouldShowNoLeadsAlertRef.current = true;
  };

  // Render functions
  const renderBarangayDropdown = () => {
    const barangayData = getFilteredBarangays();
    const totalBarangays = barangayData.length;

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={showBarangayDropdown}
        onRequestClose={() => setShowBarangayDropdown(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setShowBarangayDropdown(false)}
        >
          <View className="flex-1 justify-center items-center">
            <View className="w-4/5 bg-white rounded-2xl max-h-3/4">
              {/* Modal content */}
              <View className="p-4 border-b border-gray-200">
                <Text className="text-lg font-bold text-gray-800">
                  Select Barangay (Optional)
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Choose your barangay from the list (Optional)
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Total: {totalBarangays} barangay(s) available
                </Text>
              </View>

              <View className="px-4 py-2">
                <TextInput
                  placeholder="Search barangay..."
                  value={barangaySearchText}
                  onChangeText={(text) => {
                    setBarangaySearchText(text);
                    if (text.trim() === "") {
                      setFilteredBarangays(barangayData);
                    } else {
                      const filtered = barangayData.filter((item) =>
                        item.barangayName
                          .toLowerCase()
                          .includes(text.toLowerCase())
                      );
                      setFilteredBarangays(filtered);
                    }
                  }}
                  className="border border-gray-300 rounded-xl p-3 bg-gray-50 mb-2"
                />
              </View>

              <FlatList
                data={filteredBarangays}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="px-4 py-3 border-b border-gray-100 active:bg-gray-50"
                    onPress={() => {
                      handleInputChange("barangay", item.barangayName);
                      handleInputChange("barangayId", item._id);
                      setShowBarangayDropdown(false);
                      if (selectedRole?.value === "household_member" && item._id) {
                        fetchHouseholdLeads(item._id, true);
                      }
                    }}
                  >
                    <Text className="text-base text-gray-800">
                      {item.barangayName}
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View className="p-8 items-center justify-center">
                    <Text className="text-gray-500 text-center">
                      {barangaySearchText
                        ? "No barangays found matching your search"
                        : "No barangays available"}
                    </Text>
                  </View>
                }
                showsVerticalScrollIndicator={false}
                className="max-h-72"
              />

              <TouchableOpacity
                className="p-4 items-center border-t border-gray-200"
                onPress={() => {
                  handleInputChange("barangay", "");
                  handleInputChange("barangayId", "");
                  setShowBarangayDropdown(false);
                }}
              >
                <Text className="text-gray-600 font-semibold">
                  Skip - No Barangay Selected
                </Text>
              </TouchableOpacity>

              {selectedRole?.value === "brgy_captain" && (
                <View className="p-4 border-t border-gray-200">
                  <Text className="text-sm font-semibold text-yellow-700 mb-1">
                    Can't find your barangay?
                  </Text>
                  <TouchableOpacity
                    className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 items-center"
                    onPress={() => {
                      setShowBarangayDropdown(false);
                      setTimeout(() => {
                        setShowRegisterBarangayModal(true);
                      }, 300);
                    }}
                  >
                    <Text className="text-yellow-700 font-semibold">
                      Register Your Barangay
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                className="p-4 items-center border-t border-gray-200"
                onPress={() => setShowBarangayDropdown(false)}
              >
                <Text className="text-blue-400 font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const renderHouseholdLeadDropdown = () => {
    const leadsToShow =
      filteredHouseholdLeads.length > 0
        ? filteredHouseholdLeads
        : Array.isArray(DropdowndataLead)
        ? DropdowndataLead
        : [];

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={showHouseholdLeadDropdown}
        onRequestClose={() => setShowHouseholdLeadDropdown(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setShowHouseholdLeadDropdown(false)}
        >
          <View className="flex-1 justify-center items-center">
            <View className="w-4/5 bg-white rounded-2xl max-h-4/5">
              <View className="p-4 border-b border-gray-200">
                <Text className="text-lg font-bold text-gray-800">
                  Select Household Lead (Optional)
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  {registrationData.barangay
                    ? `Available household leads in ${registrationData.barangay}`
                    : "Available household leads from all barangays"}
                </Text>
              </View>

              {isLoadingHouseholdLeads ? (
                <View className="p-8 items-center justify-center">
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text className="text-gray-500 mt-4">
                    Loading household leads...
                  </Text>
                </View>
              ) : (
                <>
                  {leadsToShow.length === 0 ? (
                    <View className="p-8 items-center justify-center">
                      <Text className="text-gray-500 text-center">
                        No household leads found.
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      data={leadsToShow}
                      keyExtractor={(item) =>
                        item._id ||
                        item.id?.toString() ||
                        Math.random().toString()
                      }
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          className="px-4 py-3 border-b border-gray-100 active:bg-gray-50"
                          onPress={() => {
                            handleInputChange("householdLead", item.name);
                            handleInputChange("householdLeadId", item._id || item.id);
                            handleInputChange("householdAddress", item.address || "");
                            setShowHouseholdLeadDropdown(false);
                          }}
                        >
                          <Text className="text-base font-semibold text-gray-800">
                            {item.name || "Unnamed Lead"}
                          </Text>
                          {item.address && (
                            <Text className="text-sm text-gray-500 mt-1">
                              {item.address}
                            </Text>
                          )}
                        </TouchableOpacity>
                      )}
                      showsVerticalScrollIndicator={false}
                      className="max-h-80"
                    />
                  )}
                </>
              )}

              <TouchableOpacity
                className="p-4 items-center border-t border-gray-200"
                onPress={() => {
                  handleInputChange("householdLead", "");
                  handleInputChange("householdLeadId", "");
                  handleInputChange("householdAddress", "");
                  setShowHouseholdLeadDropdown(false);
                }}
              >
                <Text className="text-gray-600 font-semibold">
                  Skip - No Household Lead
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="p-4 items-center border-t border-gray-200"
                onPress={() => setShowHouseholdLeadDropdown(false)}
              >
                <Text className="text-blue-400 font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const renderRelationshipDropdown = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={showRelationshipDropdown}
        onRequestClose={() => setShowRelationshipDropdown(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setShowRelationshipDropdown(false)}
        >
          <View className="flex-1 justify-center items-center">
            <View className="w-4/5 bg-white rounded-2xl max-h-2/3">
              <View className="p-4 border-b border-gray-200">
                <Text className="text-lg font-bold text-gray-800">
                  Select Relationship (Optional)
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Choose your relationship to the household lead (Optional)
                </Text>
              </View>

              <FlatList
                data={relationships}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="px-4 py-3 border-b border-gray-100 active:bg-gray-50"
                    onPress={() => {
                      handleInputChange("relationship", item);
                      setShowRelationshipDropdown(false);
                    }}
                  >
                    <Text className="text-base text-gray-800">{item}</Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                className="max-h-64"
              />

              <TouchableOpacity
                className="p-4 items-center border-t border-gray-200"
                onPress={() => {
                  handleInputChange("relationship", "");
                  setShowRelationshipDropdown(false);
                }}
              >
                <Text className="text-gray-600 font-semibold">
                  Skip - No Relationship
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="p-4 items-center border-t border-gray-200"
                onPress={() => setShowRelationshipDropdown(false)}
              >
                <Text className="text-blue-400 font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const renderRegisterBarangayModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRegisterBarangayModal}
        onRequestClose={() => setShowRegisterBarangayModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl max-h-3/4">
              <View className="p-5 border-b border-gray-200">
                <View className="flex-row justify-between items-center mb-4">
                  <View>
                    <Text className="text-xl font-bold text-gray-800">
                      Register New Barangay (Optional)
                    </Text>
                    <Text className="text-sm text-gray-600">
                      For Barangay Captain: {selectedRole?.title}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setShowRegisterBarangayModal(false);
                      setIsRegisteringNewBarangay(false);
                      setNewBarangayName("");
                    }}
                    className="p-2"
                  >
                    <Text className="text-2xl text-gray-500">×</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView
                className="px-5 pt-4 pb-6"
                showsVerticalScrollIndicator={false}
              >
                <View className="space-y-4">
                  <View>
                    <Text className="text-sm font-semibold text-gray-700 mb-1">
                      Barangay Name (Optional)
                    </Text>
                    <TextInput
                      placeholder="Enter your barangay name (Optional)"
                      value={newBarangayName}
                      onChangeText={setNewBarangayName}
                      className="border border-gray-300 rounded-xl p-4 bg-gray-50"
                    />
                  </View>
                </View>

                <View className="flex-row justify-between mt-8 mb-4">
                  <TouchableOpacity
                    onPress={() => {
                      setShowRegisterBarangayModal(false);
                      setIsRegisteringNewBarangay(false);
                      setNewBarangayName("");
                    }}
                    className="flex-1 h-14 rounded-2xl justify-center items-center border-2 border-gray-300 mr-2"
                  >
                    <Text className="text-base font-semibold text-gray-700">
                      Skip - No Barangay
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      if (!newBarangayName.trim()) {
                        Alert.alert(
                          "Note",
                          "You can skip barangay registration if you prefer"
                        );
                        return;
                      }

                      handleInputChange("barangay", newBarangayName);
                      handleInputChange("barangayId", "");
                      setIsRegisteringNewBarangay(true);

                      Alert.alert(
                        "Barangay Registered",
                        `"${newBarangayName}" will be added to the system after your account is created.`,
                        [
                          {
                            text: "Continue Registration",
                            onPress: () => {
                              setShowRegisterBarangayModal(false);
                            },
                          },
                        ]
                      );
                    }}
                    className="flex-1 h-14 rounded-2xl justify-center items-center bg-green-500 ml-2"
                  >
                    <Text className="text-base font-bold text-white">
                      Register Barangay
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {showLogin ? (
        <LoginScreen
          slide={slide}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          handleLogin={handleLogin}
          isLoading={isLoading}
          onRegisterPress={handleRegisterPress}
        />
      ) : (
        <RegistrationWizard
          onBackToLogin={handleBackToLogin}
          // Props for registration
          roleModalVisible={roleModalVisible}
          setRoleModalVisible={setRoleModalVisible}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          registrationData={registrationData}
          handleInputChange={handleInputChange}
          roles={roles}
          handleNextStep={handleNextStep}
          prevStep={prevStep}
          handleSubmitRegistration={handleSubmitRegistration}
          isSignupLoading={isSignupLoading}
          // Dropdown handlers
          setShowBarangayDropdown={setShowBarangayDropdown}
          showFilteredHouseholdLeadDropdown={showFilteredHouseholdLeadDropdown}
          setShowRelationshipDropdown={setShowRelationshipDropdown}
          showDatepicker={showDatepicker}
          isLoadingHouseholdLeads={isLoadingHouseholdLeads}
          DropdowndataLead={DropdowndataLead}
          filteredHouseholdLeads={filteredHouseholdLeads}
          calculateAge={calculateAge}
          setShowRegisterBarangayModal={setShowRegisterBarangayModal}
          isRegisteringNewBarangay={isRegisteringNewBarangay}
          newBarangayName={newBarangayName}
          setIsRegisteringNewBarangay={setIsRegisteringNewBarangay}
          setNewBarangayName={setNewBarangayName}
        />
      )}

      {/* Dropdown Modals */}
      {renderBarangayDropdown()}
      {renderHouseholdLeadDropdown()}
      {renderRelationshipDropdown()}
      {renderRegisterBarangayModal()}

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={birthDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}

      {/* Role Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={roleModalVisible}
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl max-h-4/5 px-5 pt-6 pb-8">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-6">
                <Text className="text-2xl font-extrabold text-gray-800 mb-2 text-center">
                  Select Your Role
                </Text>
                <Text className="text-sm text-gray-500 text-center leading-5">
                  Choose your role to proceed with registration
                </Text>
              </View>

              {roles.map((role) => (
                <TouchableOpacity
                  key={role.id}
                  className={`flex-row items-center bg-gray-50 rounded-2xl p-4 mb-3 border-2 ${
                    selectedRole?.id === role.id
                      ? "border-blue-400 bg-blue-50"
                      : "border-transparent"
                  }`}
                  onPress={() => {
                    setSelectedRole(role);
                    handleInputChange("role", role.value);
                    setRoleModalVisible(false);
                    setCurrentStep(1);
                  }}
                >
                  <View className="w-12 h-12 rounded-full bg-white justify-center items-center mr-4 shadow">
                    <Text className="text-2xl">{role.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-800 mb-1">
                      {role.title}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {role.description}
                    </Text>
                  </View>
                  {selectedRole?.id === role.id && (
                    <View className="w-6 h-6 rounded-full bg-blue-400 justify-center items-center">
                      <Text className="text-white font-bold text-sm">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                className="h-14 rounded-3xl justify-center items-center border-2 border-gray-300 mt-4"
                onPress={() => setRoleModalVisible(false)}
              >
                <Text className="text-base font-semibold text-gray-500">
                  Cancel
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}