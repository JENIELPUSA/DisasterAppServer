import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import * as Location from 'expo-location';

const RegistrationWizard = ({
  onBackToLogin,
  // Registration props
  roleModalVisible,
  setRoleModalVisible,
  selectedRole,
  setSelectedRole,
  currentStep,
  setCurrentStep,
  registrationData,
  handleInputChange,
  roles,
  handleNextStep,
  prevStep,
  handleSubmitRegistration,
  isSignupLoading,
  // Dropdown handlers
  setShowBarangayDropdown,
  showFilteredHouseholdLeadDropdown,
  setShowRelationshipDropdown,
  showDatepicker,
  isLoadingHouseholdLeads,
  DropdowndataLead,
  filteredHouseholdLeads,
  calculateAge,
  setShowRegisterBarangayModal,
  isRegisteringNewBarangay,
  newBarangayName,
  setIsRegisteringNewBarangay,
  setNewBarangayName,
}) => {
  // Local state for location loading
  const [localIsGettingLocation, setLocalIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Function to get GPS location
  const handleGetGPSLocation = async () => {
    try {
      setLocalIsGettingLocation(true);
      setLocationError(null);
      
      console.log("Requesting location permissions...");

      // Request permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      console.log("Location permission status:", status);
      
      if (status !== 'granted') {
        setLocationError('Location permission denied. Please enable location services in settings.');
        setLocalIsGettingLocation(false);
        Alert.alert(
          "Location Permission Required",
          "Please enable location services to register as a household lead. This is required for emergency response.",
          [{ text: "OK" }]
        );
        return;
      }

      console.log("Getting current position...");
      
      // Get current location
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000, // 15 seconds timeout
      });

      console.log("Location received:", location.coords);
      
      const { latitude, longitude } = location.coords;
      
      // Update registration data with GPS coordinates
      // IMPORTANT: Save as strings for FormData, but ensure they are valid numbers
      handleInputChange("gpsCoordinates", `${latitude},${longitude}`);
      handleInputChange("latitude", latitude.toString());
      handleInputChange("longitude", longitude.toString());
      
      console.log("Updated registration data with GPS:", {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        gpsCoordinates: `${latitude},${longitude}`
      });

      // Get address from coordinates (reverse geocoding)
      try {
        let geocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (geocode && geocode.length > 0) {
          const address = geocode[0];
          const formattedAddress = [
            address.street,
            address.subregion || address.region,
            address.city,
            address.region,
            address.country,
            address.postalCode
          ].filter(Boolean).join(", ");
          
          console.log("Reverse geocode result:", formattedAddress);
          
          if (formattedAddress) {
            handleInputChange("address", formattedAddress);
          }
        }
      } catch (geocodeError) {
        console.warn("Reverse geocoding failed:", geocodeError);
        // Don't fail the whole process if reverse geocoding fails
      }

      setLocalIsGettingLocation(false);
      Alert.alert(
        "Location Captured",
        "Your GPS location has been successfully captured.",
        [{ text: "OK" }]
      );
      
    } catch (error) {
      console.error("Error getting location:", error);
      let errorMsg = 'Failed to get location. Please try again.';
      
      if (error.code === 'E_LOCATION_TIMEOUT') {
        errorMsg = 'Location request timeout. Please ensure location services are enabled and try again.';
      } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
        errorMsg = 'Location services are unavailable. Please check your device settings.';
      }
      
      setLocationError(errorMsg);
      setLocalIsGettingLocation(false);
      
      Alert.alert(
        "Location Error",
        errorMsg,
        [{ text: "OK" }]
      );
    }
  };

  // Clear location function
  const clearLocation = () => {
    handleInputChange("gpsCoordinates", "");
    handleInputChange("latitude", "");
    handleInputChange("longitude", "");
    setLocationError(null);
  };

  const renderStepIndicator = () => {
    return (
      <View className="flex-row justify-center items-center mb-8">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <View
              className={`w-10 h-10 rounded-full justify-center items-center ${
                step === currentStep
                  ? "bg-blue-400 border-2 border-blue-500"
                  : step < currentStep
                  ? "bg-green-400 border-2 border-green-500"
                  : "bg-gray-200 border-2 border-gray-300"
              }`}
            >
              <Text
                className={`font-bold ${
                  step === currentStep || step < currentStep
                    ? "text-white"
                    : "text-gray-500"
                }`}
              >
                {step}
              </Text>
            </View>
            {step < 3 && (
              <View
                className={`h-1 w-12 ${
                  step < currentStep ? "bg-green-400" : "bg-gray-300"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Personal Information";
      case 2:
        return "Account Information";
      case 3:
        return `${selectedRole?.title} Details`;
      default:
        return "Registration";
    }
  };

  const renderStepContent = () => {
    const availableLeads =
      filteredHouseholdLeads.length > 0
        ? filteredHouseholdLeads
        : Array.isArray(DropdowndataLead)
        ? DropdowndataLead
        : [];

    switch (currentStep) {
      case 1:
        return (
          <View className="space-y-4">
            <Text className="text-lg font-bold text-gray-800 mb-2">
              Personal Details
            </Text>

            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-1">
                Full Name *
              </Text>
              <TextInput
                placeholder="Enter your full name"
                value={registrationData.fullName}
                onChangeText={(value) => handleInputChange("fullName", value)}
                className="border border-gray-300 rounded-xl p-4 bg-gray-50"
              />
            </View>

            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-1">
                Contact Number *
              </Text>
              <TextInput
                placeholder="Enter your contact number"
                value={registrationData.contactNumber}
                onChangeText={(value) => handleInputChange("contactNumber", value)}
                keyboardType="phone-pad"
                className="border border-gray-300 rounded-xl p-4 bg-gray-50"
              />
            </View>

            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-1">
                Address (Optional)
              </Text>
              <TextInput
                placeholder="Enter your complete address (Optional)"
                value={registrationData.address}
                onChangeText={(value) => handleInputChange("address", value)}
                multiline
                numberOfLines={3}
                className="border border-gray-300 rounded-xl p-4 bg-gray-50 h-24"
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View className="space-y-4">
            <Text className="text-lg font-bold text-gray-800 mb-2">
              Account Information
            </Text>

            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-1">
                Email Address *
              </Text>
              <TextInput
                placeholder="Enter your email"
                value={registrationData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
                className="border border-gray-300 rounded-xl p-4 bg-gray-50"
              />
            </View>

            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-1">
                Password *
              </Text>
              <TextInput
                placeholder="Create a password (min. 6 characters)"
                value={registrationData.password}
                onChangeText={(value) => handleInputChange("password", value)}
                secureTextEntry
                className="border border-gray-300 rounded-xl p-4 bg-gray-50"
              />
              <Text className="text-xs text-gray-500 mt-1">
                Must be at least 6 characters long
              </Text>
            </View>

            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-1">
                Confirm Password *
              </Text>
              <TextInput
                placeholder="Confirm your password"
                value={registrationData.confirmPassword}
                onChangeText={(value) => handleInputChange("confirmPassword", value)}
                secureTextEntry
                className="border border-gray-300 rounded-xl p-4 bg-gray-50"
              />
            </View>
          </View>
        );

      case 3:
        if (!selectedRole) {
          return (
            <View className="items-center justify-center p-8">
              <Text className="text-lg font-bold text-gray-800 mb-4">
                Please select a role first
              </Text>
              <TouchableOpacity
                onPress={() => setRoleModalVisible(true)}
                className="h-14 rounded-2xl justify-center items-center bg-blue-400 px-8"
              >
                <Text className="text-base font-bold text-white">
                  Select Role
                </Text>
              </TouchableOpacity>
            </View>
          );
        }

        return (
          <View className="space-y-4">
            <View className="flex-row items-center mb-4 p-3 bg-blue-50 rounded-xl">
              <View className="w-12 h-12 rounded-full bg-white justify-center items-center mr-3">
                <Text className="text-2xl">{selectedRole?.icon}</Text>
              </View>
              <View>
                <Text className="text-lg font-bold text-gray-800">
                  {selectedRole?.title}
                </Text>
                <Text className="text-sm text-gray-600">
                  {selectedRole?.description}
                </Text>
              </View>
            </View>

            {/* Role-specific content */}
            {selectedRole?.value === "rescuer" && (
              <>
                <Text className="text-lg font-bold text-gray-800 mb-2">
                  Rescuer Details
                </Text>

                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-1">
                    Organization *
                  </Text>
                  <TextInput
                    placeholder="Enter your organization"
                    value={registrationData.organization}
                    onChangeText={(value) => handleInputChange("organization", value)}
                    className="border border-gray-300 rounded-xl p-4 bg-gray-50"
                  />
                </View>

                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-1">
                    ID Number *
                  </Text>
                  <TextInput
                    placeholder="Enter your ID number"
                    value={registrationData.idNumber}
                    onChangeText={(value) => handleInputChange("idNumber", value)}
                    className="border border-gray-300 rounded-xl p-4 bg-gray-50"
                  />
                </View>
              </>
            )}

            {selectedRole?.value === "household_lead" && (
              <>
                <Text className="text-lg font-bold text-gray-800 mb-2">
                  Household Details
                </Text>

                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-1">
                    Number of Family Members *
                  </Text>
                  <TextInput
                    placeholder="Enter number of family members"
                    value={registrationData.familyMembers}
                    onChangeText={(value) => handleInputChange("familyMembers", value)}
                    keyboardType="numeric"
                    className="border border-gray-300 rounded-xl p-4 bg-gray-50"
                  />
                </View>

                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-1">
                    Barangay (Optional)
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowBarangayDropdown(true)}
                    className="border border-gray-300 rounded-xl p-4 bg-gray-50 justify-center min-h-[60px]"
                  >
                    {registrationData.barangay ? (
                      <Text className="text-gray-800">{registrationData.barangay}</Text>
                    ) : (
                      <Text className="text-gray-500">Select barangay (Optional)</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* GPS Location Section */}
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-1">
                    Household Location (GPS) *
                    <Text className="text-red-500"> (Required)</Text>
                  </Text>
                  
                  <TouchableOpacity
                    onPress={handleGetGPSLocation}
                    disabled={localIsGettingLocation}
                    className={`border rounded-xl p-4 justify-center min-h-[60px] mb-2 ${
                      registrationData.latitude && registrationData.longitude 
                        ? "border-green-500 bg-green-50" 
                        : "border-gray-300 bg-blue-50"
                    }`}
                  >
                    {localIsGettingLocation ? (
                      <View className="flex-row items-center justify-center">
                        <ActivityIndicator size="small" color="#3b82f6" />
                        <Text className="ml-2 text-blue-600 font-medium">
                          Getting your location...
                        </Text>
                      </View>
                    ) : registrationData.latitude && registrationData.longitude ? (
                      <View>
                        <View className="flex-row items-center">
                          <Text className="text-green-600 text-lg mr-2">✓</Text>
                          <Text className="text-green-800 font-medium">
                            Location Captured Successfully
                          </Text>
                        </View>
                        <View className="mt-2">
                          <Text className="text-xs text-gray-600">
                            Latitude: {registrationData.latitude}
                          </Text>
                          <Text className="text-xs text-gray-600">
                            Longitude: {registrationData.longitude}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <View className="flex-row items-center justify-center">
                        <Text className="text-2xl mr-2">📍</Text>
                        <View>
                          <Text className="text-blue-600 font-medium">
                            Get Current Location
                          </Text>
                          <Text className="text-xs text-gray-500 mt-1">
                            Tap to get your GPS coordinates
                          </Text>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                  
                  {locationError && (
                    <View className="p-3 bg-red-50 rounded-lg border border-red-200 mt-2">
                      <Text className="text-red-600 text-sm">{locationError}</Text>
                    </View>
                  )}
                  
                  {registrationData.latitude && registrationData.longitude && (
                    <TouchableOpacity
                      onPress={clearLocation}
                      className="mt-2 self-start"
                    >
                      <Text className="text-red-500 text-sm font-medium">
                        Clear Location
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  <Text className="text-xs text-gray-500 mt-2">
                    <Text className="font-semibold">Important:</Text> GPS location is required for household leads to help rescuers locate your household during emergencies.
                  </Text>
                  
                  <View className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Text className="text-xs text-yellow-800">
                      <Text className="font-semibold">Note:</Text> Ensure your location services are enabled and you're in a place with good GPS signal.
                    </Text>
                  </View>
                </View>

                {/* Display GPS coordinates if available */}
                {registrationData.latitude && registrationData.longitude && (
                  <View className="p-4 bg-green-50 rounded-xl border border-green-300">
                    <Text className="text-sm font-semibold text-green-800 mb-2">
                      📍 Location Information
                    </Text>
                    <View className="space-y-1">
                      <View className="flex-row">
                        <Text className="text-xs font-medium text-gray-700 w-20">Latitude:</Text>
                        <Text className="text-xs text-gray-800 flex-1">{registrationData.latitude}</Text>
                      </View>
                      <View className="flex-row">
                        <Text className="text-xs font-medium text-gray-700 w-20">Longitude:</Text>
                        <Text className="text-xs text-gray-800 flex-1">{registrationData.longitude}</Text>
                      </View>
                      {registrationData.address && (
                        <View className="flex-row">
                          <Text className="text-xs font-medium text-gray-700 w-20">Address:</Text>
                          <Text className="text-xs text-gray-800 flex-1">{registrationData.address}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </>
            )}

            {selectedRole?.value === "brgy_captain" && (
              <>
                <Text className="text-lg font-bold text-gray-800 mb-2">
                  Barangay Official Details
                </Text>

                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-1">
                    Barangay (Optional)
                  </Text>

                  {isRegisteringNewBarangay ? (
                    <View className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <Text className="text-green-800 font-semibold">
                        New Barangay: {newBarangayName}
                      </Text>
                    </View>
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={() => setShowBarangayDropdown(true)}
                        className="border border-gray-300 rounded-xl p-4 bg-gray-50 justify-center min-h-[60px]"
                      >
                        {registrationData.barangay ? (
                          <Text className="text-gray-800">{registrationData.barangay}</Text>
                        ) : (
                          <Text className="text-gray-500">Select barangay (Optional)</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setShowRegisterBarangayModal(true)}
                        className="mt-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200"
                      >
                        <Text className="text-yellow-700">
                          Register New Barangay (Optional)
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-1">
                    Official ID Number *
                  </Text>
                  <TextInput
                    placeholder="Enter your official ID number"
                    value={registrationData.idNumber}
                    onChangeText={(value) => handleInputChange("idNumber", value)}
                    className="border border-gray-300 rounded-xl p-4 bg-gray-50"
                  />
                </View>
              </>
            )}

            {selectedRole?.value === "household_member" && (
              <>
                <Text className="text-lg font-bold text-gray-800 mb-2">
                  Household Membership Details
                </Text>

                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-1">
                    Barangay (Optional)
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowBarangayDropdown(true)}
                    className="border border-gray-300 rounded-xl p-4 bg-gray-50 justify-center min-h-[60px]"
                  >
                    {registrationData.barangay ? (
                      <Text className="text-gray-800">{registrationData.barangay}</Text>
                    ) : (
                      <Text className="text-gray-500">Select barangay (Optional)</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-1">
                    Household Lead (Optional)
                  </Text>
                  <TouchableOpacity
                    onPress={showFilteredHouseholdLeadDropdown}
                    className="border border-gray-300 rounded-xl p-4 bg-gray-50 justify-center min-h-[60px]"
                  >
                    {registrationData.householdLead ? (
                      <Text className="text-gray-800">{registrationData.householdLead}</Text>
                    ) : (
                      <Text className="text-gray-500">Select household lead (Optional)</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-1">
                    Relationship (Optional)
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowRelationshipDropdown(true)}
                    className="border border-gray-300 rounded-xl p-4 bg-gray-50 justify-center min-h-[60px]"
                  >
                    {registrationData.relationship ? (
                      <Text className="text-gray-800">{registrationData.relationship}</Text>
                    ) : (
                      <Text className="text-gray-500">Select relationship (Optional)</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-1">
                    Birth Date *
                  </Text>
                  <TouchableOpacity
                    onPress={showDatepicker}
                    className="border border-gray-300 rounded-xl p-4 bg-gray-50 justify-center min-h-[60px]"
                  >
                    {registrationData.birthDate ? (
                      <Text className="text-gray-800">{registrationData.birthDate}</Text>
                    ) : (
                      <Text className="text-gray-500">Select birth date</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-1">
                    Disability (Optional)
                  </Text>
                  <TextInput
                    placeholder="Enter disability if any"
                    value={registrationData.disability}
                    onChangeText={(value) => handleInputChange("disability", value)}
                    className="border border-gray-300 rounded-xl p-4 bg-gray-50"
                  />
                </View>
              </>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  // Check if household lead has required GPS
  const hasRequiredGPS = () => {
    if (selectedRole?.value !== "household_lead") return true;
    
    const hasLatLong = registrationData.latitude && registrationData.longitude;
    const hasGpsString = registrationData.gpsCoordinates;
    
    console.log("GPS Check:", {
      hasLatLong,
      hasGpsString,
      latitude: registrationData.latitude,
      longitude: registrationData.longitude
    });
    
    return hasLatLong || hasGpsString;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1 px-5 pt-10 pb-6" showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity
          onPress={onBackToLogin}
          className="mb-6 self-start"
          disabled={isSignupLoading || localIsGettingLocation}
        >
          <Text className="text-blue-400 font-semibold">← Back to Login</Text>
        </TouchableOpacity>

        {/* Step indicator */}
        {renderStepIndicator()}

        {/* Step title */}
        <Text className="text-2xl font-bold text-gray-800 mb-6">
          {getStepTitle()}
        </Text>

        {/* Role selection button (if not selected) */}
        {!selectedRole && currentStep >= 3 && (
          <View className="mb-6 p-4 bg-blue-50 rounded-xl">
            <Text className="text-sm text-gray-700 mb-3">
              Please select your role to continue with registration
            </Text>
            <TouchableOpacity
              onPress={() => setRoleModalVisible(true)}
              className="h-14 rounded-2xl justify-center items-center bg-blue-400"
              disabled={isSignupLoading || localIsGettingLocation}
            >
              <Text className="text-base font-bold text-white">
                Select Role
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step content */}
        {renderStepContent()}

        {/* Navigation buttons */}
        <View className="flex-row justify-between mt-8 mb-4">
          {currentStep > 1 ? (
            <TouchableOpacity
              onPress={prevStep}
              className="flex-1 h-14 rounded-2xl justify-center items-center border-2 border-gray-300 mr-2"
              disabled={isSignupLoading || localIsGettingLocation}
            >
              <Text className="text-base font-semibold text-gray-700">
                Previous
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={onBackToLogin}
              className="flex-1 h-14 rounded-2xl justify-center items-center border-2 border-gray-300 mr-2"
              disabled={isSignupLoading || localIsGettingLocation}
            >
              <Text className="text-base font-semibold text-gray-700">
                Cancel
              </Text>
            </TouchableOpacity>
          )}

          {currentStep < 3 ? (
            <TouchableOpacity
              onPress={handleNextStep}
              className="flex-1 h-14 rounded-2xl justify-center items-center bg-blue-400 ml-2"
              disabled={isSignupLoading || localIsGettingLocation}
            >
              <Text className="text-base font-bold text-white">
                Next
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSubmitRegistration}
              className="flex-1 h-14 rounded-2xl justify-center items-center bg-green-500 ml-2"
              disabled={
                isSignupLoading || 
                localIsGettingLocation || 
                (selectedRole?.value === "household_lead" && !hasRequiredGPS())
              }
              style={{
                opacity: (selectedRole?.value === "household_lead" && !hasRequiredGPS()) ? 0.5 : 1
              }}
            >
              {isSignupLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-bold text-white">
                  Complete Registration
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* GPS warning for household lead */}
        {selectedRole?.value === "household_lead" && !hasRequiredGPS() && (
          <View className="mt-4 p-3 bg-red-50 rounded-xl border border-red-200">
            <Text className="text-red-600 text-sm font-semibold">
              ⚠ GPS Location Required
            </Text>
            <Text className="text-red-500 text-xs mt-1">
              You must get your GPS location to complete registration as a household lead.
            </Text>
          </View>
        )}

        <View className="flex-row justify-center mt-4">
          <Text className="text-sm text-gray-500">
            Step {currentStep} of 3
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegistrationWizard;