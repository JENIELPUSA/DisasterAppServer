import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

// Relationship options for the dropdown
const RELATIONSHIP_OPTIONS = [
  'Household Head',
  'Spouse', 
  'Child',
  'Parent',
  'Sibling',
  'Grandchild',
  'Grandparent',
  'Other Relative',
  'Non-Relative',
];

export default function EditMemberForm({
  visible,
  member,
  onSave,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    address: "",
    birthDate: new Date(),
    relationship: "",
    disability: "",
    gender: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRelationshipDropdown, setShowRelationshipDropdown] = useState(false);

  // Refs for scrolling
  const scrollViewRef = useRef(null);
  const dateFieldY = useRef(0);
  const formSheetRef = useRef(null);

  // Initialize form when member changes
  useEffect(() => {
    if (member) {
      const birthDate = member.birthDate 
        ? new Date(member.birthDate) 
        : new Date();
      
      setFormData({
        fullName: member.userId?.fullName || "",
        contactNumber: member.userId?.contactNumber || "",
        address: member.userId?.address || "",
        birthDate: birthDate,
        relationship: member.relationship || "",
        disability: member.disability || "",
        gender: member.gender || "",
      });
    }
  }, [member]);

  // Handle Date Change
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    
    if (showRelationshipDropdown) setShowRelationshipDropdown(false);
    
    if (selectedDate) {
      setFormData(prev => ({ ...prev, birthDate: selectedDate }));
    }
  };

  // Handle Date Picker Button Press
  const handleOpenDatePicker = () => {
    if (showRelationshipDropdown) setShowRelationshipDropdown(false);
    setShowDatePicker(true);
  };

  // Handle Save
  const handleSaveEdit = () => {
    if (!member) return;

    // Validate required fields
    if (!formData.fullName.trim()) {
      Alert.alert("Error", "Full Name is required");
      return;
    }

    if (!formData.relationship.trim()) {
      Alert.alert("Error", "Relationship is required");
      return;
    }

    Alert.alert(
      "Update Member",
      "Are you sure you want to update this member's information?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Update",
          style: "default",
          onPress: () => {
            // Prepare updated member data
            const updatedMember = {
              ...member,
              userId: {
                ...member.userId,
                fullName: formData.fullName.trim(),
                contactNumber: formData.contactNumber.trim(),
                address: formData.address.trim(),
              },
              birthDate: formData.birthDate.toISOString(),
              relationship: formData.relationship.trim(),
              disability: formData.disability.trim(),
              gender: formData.gender.trim(),
            };

            // Call the onSave prop with updated data
            onSave(updatedMember);
          },
        },
      ]
    );
  };

  // Get the position of the date field for scrolling
  const handleDateFieldLayout = (event) => {
    const { y } = event.nativeEvent.layout;
    dateFieldY.current = y;
  };

  // Custom Dropdown Component
  const RelationshipDropdown = () => {
    const handleSelectRelationship = (relationship) => {
      setFormData(prev => ({ ...prev, relationship }));
      setShowRelationshipDropdown(false);
    };

    return (
      <View className="relative">
        {/* Dropdown Button */}
        <TouchableOpacity
          onPress={() => {
            setShowRelationshipDropdown(!showRelationshipDropdown);
            if (showDatePicker) setShowDatePicker(false);
          }}
          className={`bg-gray-50 border ${formData.relationship ? 'border-gray-300' : 'border-red-300'} rounded-xl p-4 flex-row justify-between items-center`}
          activeOpacity={0.7}
        >
          <Text className={`${formData.relationship ? 'text-gray-900' : 'text-gray-500'}`}>
            {formData.relationship || "Select relationship"}
          </Text>
          <Ionicons 
            name={showRelationshipDropdown ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#6b7280" 
          />
        </TouchableOpacity>

        {/* Dropdown Options */}
        {showRelationshipDropdown && (
          <View className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-50 max-h-60">
            <ScrollView 
              showsVerticalScrollIndicator={true}
              className="max-h-60"
              nestedScrollEnabled={true}
            >
              {RELATIONSHIP_OPTIONS.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSelectRelationship(option)}
                  className={`px-4 py-3 ${index !== RELATIONSHIP_OPTIONS.length - 1 ? 'border-b border-gray-100' : ''} ${formData.relationship === option ? 'bg-blue-50' : ''}`}
                  activeOpacity={0.7}
                >
                  <Text className={`${formData.relationship === option ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Required field indicator */}
        {!formData.relationship && (
          <Text className="text-red-500 text-sm mt-1">
            Relationship is required
          </Text>
        )}
      </View>
    );
  };

  // Handle backdrop press
  const handleBackdropPress = () => {
    if (!showDatePicker && !showRelationshipDropdown) {
      onCancel();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View className="flex-1">
        {/* Backdrop */}
        <TouchableOpacity 
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={handleBackdropPress}
        />
        
        {/* Bottom Sheet Container */}
        <View 
          ref={formSheetRef}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[90%] flex"
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={() => {}}
          onResponderReject={() => {}}
        >
          {/* Drag Handle */}
          <View className="items-center py-3">
            <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </View>
          
          {/* Header */}
          <View className="px-6 pb-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-gray-900">
                Edit Member
              </Text>
              <TouchableOpacity
                onPress={onCancel}
                className="p-2"
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <Text className="text-gray-600 mt-1">
              Update member information
            </Text>
          </View>

          {/* Scrollable Form Content */}
          <ScrollView 
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false} 
            className="flex-grow px-6 pt-4"
            contentContainerStyle={{ paddingBottom: 30 }}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
          >
            {/* Personal Information */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-4">
                Personal Information
              </Text>
              
              <View className="space-y-4">
                {/* Full Name */}
                <View>
                  <Text className="text-gray-700 font-medium mb-1">
                    Full Name *
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-300 rounded-xl p-4 text-gray-900"
                    value={formData.fullName}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
                    placeholder="Enter full name"
                    onFocus={() => {
                      if (showDatePicker) setShowDatePicker(false);
                      if (showRelationshipDropdown) setShowRelationshipDropdown(false);
                    }}
                  />
                </View>

                {/* Contact Number */}
                <View>
                  <Text className="text-gray-700 font-medium mb-1">
                    Contact Number
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-300 rounded-xl p-4 text-gray-900"
                    value={formData.contactNumber}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, contactNumber: text }))}
                    placeholder="Enter contact number"
                    keyboardType="phone-pad"
                    onFocus={() => {
                      if (showDatePicker) setShowDatePicker(false);
                      if (showRelationshipDropdown) setShowRelationshipDropdown(false);
                    }}
                  />
                </View>

                {/* Address */}
                <View>
                  <Text className="text-gray-700 font-medium mb-1">
                    Address
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-300 rounded-xl p-4 text-gray-900"
                    value={formData.address}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                    placeholder="Enter address"
                    multiline
                    numberOfLines={3}
                    onFocus={() => {
                      if (showDatePicker) setShowDatePicker(false);
                      if (showRelationshipDropdown) setShowRelationshipDropdown(false);
                    }}
                  />
                </View>

                {/* Birth Date */}
                <View onLayout={handleDateFieldLayout}>
                  <Text className="text-gray-700 font-medium mb-1">
                    Birth Date
                  </Text>
                  <TouchableOpacity
                    onPress={handleOpenDatePicker}
                    className="bg-gray-50 border border-gray-300 rounded-xl p-4"
                    activeOpacity={0.7}
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className="text-gray-900">
                        {formData.birthDate.toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Text>
                      <Ionicons name="calendar" size={20} color="#6b7280" />
                    </View>
                  </TouchableOpacity>
                  
                  {/* Date Picker */}
                  {showDatePicker && (
                    Platform.OS === "android" ? (
                      <DateTimePicker
                        value={formData.birthDate}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                      />
                    ) : (
                      // iOS Date Picker
                      <View className="mt-4 border border-gray-300 rounded-xl overflow-hidden bg-white z-50">
                        <View className="bg-gray-50 p-4 border-b border-gray-300">
                          <Text className="text-gray-700 font-medium">Select Birth Date</Text>
                        </View>
                        <DateTimePicker
                          value={formData.birthDate}
                          mode="date"
                          display="inline"
                          onChange={handleDateChange}
                          maximumDate={new Date()}
                          style={{
                            backgroundColor: "white",
                            height: 350,
                          }}
                        />
                        <View className="flex-row justify-end p-4 bg-gray-50 border-t border-gray-300">
                          <TouchableOpacity
                            onPress={() => setShowDatePicker(false)}
                            className="bg-blue-600 px-6 py-2 rounded-lg"
                            activeOpacity={0.7}
                          >
                            <Text className="text-white font-medium">Done</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )
                  )}
                </View>

                {/* Gender */}
                <View>
                  <Text className="text-gray-700 font-medium mb-1">
                    Gender
                  </Text>
                  <View className="flex-row space-x-2">
                    {['Male', 'Female'].map((gender) => (
                      <TouchableOpacity
                        key={gender}
                        onPress={() => setFormData(prev => ({ ...prev, gender }))}
                        className={`flex-1 py-3 rounded-xl border ${
                          formData.gender === gender
                            ? 'bg-blue-100 border-blue-500'
                            : 'bg-gray-50 border-gray-300'
                        }`}
                        activeOpacity={0.7}
                      >
                        <Text className={`text-center ${
                          formData.gender === gender
                            ? 'text-blue-700 font-bold'
                            : 'text-gray-700'
                        }`}>
                          {gender}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* Household Information */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-4">
                Household Information
              </Text>
              
              <View className="space-y-4">
                {/* Relationship Dropdown */}
                <View>
                  <Text className="text-gray-700 font-medium mb-1">
                    Relationship to Household Head *
                  </Text>
                  <RelationshipDropdown />
                </View>

                {/* Disability */}
                <View>
                  <Text className="text-gray-700 font-medium mb-1">
                    Disability (if any)
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-300 rounded-xl p-4 text-gray-900"
                    value={formData.disability}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, disability: text }))}
                    placeholder="Type of disability or leave blank"
                    onFocus={() => {
                      if (showDatePicker) setShowDatePicker(false);
                      if (showRelationshipDropdown) setShowRelationshipDropdown(false);
                    }}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="px-6 py-4 border-t border-gray-200 bg-white">
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={onCancel}
                className="flex-1 bg-gray-100 rounded-xl p-4 flex-row items-center justify-center"
                activeOpacity={0.7}
              >
                <Text className="text-gray-700 font-bold">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSaveEdit}
                className="flex-1 bg-blue-600 rounded-xl p-4 flex-row items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="save-outline" size={20} color="white" />
                <Text className="text-white font-bold ml-2">Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}