import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert,
  ActivityIndicator
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function LoginForm({ 
  slide, 
  email, 
  setEmail, 
  password, 
  setPassword, 
  handleLogin, 
  isLoading,
  signup, // NEW PROP
  checkEmailAvailability, // NEW PROP
  navigation // NEW PROP FOR NAVIGATION
}) {
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [registrationFormVisible, setRegistrationFormVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showBarangayDropdown, setShowBarangayDropdown] = useState(false);
  const [showHouseholdLeadDropdown, setShowHouseholdLeadDropdown] = useState(false);
  const [showRelationshipDropdown, setShowRelationshipDropdown] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthDate, setBirthDate] = useState(new Date());
  const [filteredHouseholdLeads, setFilteredHouseholdLeads] = useState([]);
  
  const [registrationData, setRegistrationData] = useState({
    fullName: '',
    contactNumber: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Role-specific fields
    organization: '',
    barangay: '',
    familyMembers: '',
    idNumber: '',
    householdLead: '',
    householdLeadId: '',
    relationship: '',
    householdAddress: '',
    role: '',
    // New fields for household member
    disability: '',
    birthDate: ''
  });

  const roles = [
    { id: 1, title: "Rescuer", icon: "🚑", description: "Emergency response personnel", value: "rescuer" },
    { id: 2, title: "Household Lead", icon: "👨‍👩‍👧‍👦", description: "Head of a household", value: "household_lead" },
    { id: 3, title: "Brgy. Captain", icon: "👨‍⚖️", description: "Barangay official", value: "brgy_captain" },
    { id: 4, title: "Member of Household", icon: "👤", description: "Member of an existing household", value: "household_member" },
  ];

  // List of barangays
  const barangays = [
    "BinalayanWest", "Caibiran", "Tabunan", "Tabunan North", "Barangay 5",
    "Barangay 6", "Barangay 7", "Barangay 8", "Barangay 9", "Barangay 10",
    "Barangay 11", "Barangay 12", "Barangay 13", "Barangay 14", "Barangay 15"
  ];

  // Sample household leads data with barangay assignment
  const [householdLeads, setHouseholdLeads] = useState([
    { id: 1, name: "Juan Dela Cruz", address: "123 Main St, BinalayanWest", contact: "09123456789", members: 4, barangay: "BinalayanWest" },
    { id: 2, name: "Maria Santos", address: "456 Oak St, Caibiran", contact: "09123456788", members: 5, barangay: "Caibiran" },
    { id: 3, name: "Pedro Reyes", address: "789 Pine St, Tabunan", contact: "09123456787", members: 3, barangay: "Tabunan" },
    { id: 4, name: "Ana Torres", address: "101 Maple St, Tabunan North", contact: "09123456786", members: 6, barangay: "Tabunan North" },
    { id: 5, name: "Luis Garcia", address: "202 Elm St, Barangay 5", contact: "09123456785", members: 4, barangay: "Barangay 5" },
    { id: 6, name: "Carmen Rivera", address: "303 Cedar St, Barangay 6", contact: "09123456784", members: 2, barangay: "Barangay 6" },
    { id: 7, name: "Roberto Cruz", address: "404 Birch St, Barangay 7", contact: "09123456783", members: 5, barangay: "Barangay 7" },
    { id: 8, name: "Sofia Mendoza", address: "505 Walnut St, Barangay 8", contact: "09123456782", members: 3, barangay: "Barangay 8" },
    { id: 9, name: "Carlos Lim", address: "606 Cherry St, Barangay 9", contact: "09123456781", members: 4, barangay: "Barangay 9" },
    { id: 10, name: "Elena Tan", address: "707 Palm St, Barangay 10", contact: "09123456780", members: 5, barangay: "Barangay 10" },
  ]);

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
    "Other"
  ];

  // Function to format date to YYYY-MM-DD
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = `0${d.getMonth() + 1}`.slice(-2);
    const day = `0${d.getDate()}`.slice(-2);
    return `${year}-${month}-${day}`;
  };

  // Function to calculate age from birth date
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Function to filter household leads by barangay
  const filterHouseholdLeadsByBarangay = (barangay) => {
    if (!barangay) return householdLeads;
    return householdLeads.filter(lead => lead.barangay === barangay);
  };

  const handleRegisterPress = () => {
    setRoleModalVisible(true);
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setRegistrationData(prev => ({
      ...prev,
      role: role.value
    }));
    setRoleModalVisible(false);
    setTimeout(() => {
      setRegistrationFormVisible(true);
      setCurrentStep(1);
    }, 300);
  };

  const handleInputChange = (field, value) => {
    setRegistrationData(prev => ({
      ...prev,
      [field]: value
    }));

    // If barangay is changed and role is household_member, update filtered household leads
    if (field === 'barangay' && selectedRole?.value === 'household_member') {
      const filtered = filterHouseholdLeadsByBarangay(value);
      setFilteredHouseholdLeads(filtered);
      
      // Clear household lead selection if barangay changes
      if (registrationData.householdLeadId) {
        setRegistrationData(prev => ({
          ...prev,
          householdLead: '',
          householdLeadId: '',
          householdAddress: ''
        }));
      }
    }
  };

  const handleBarangaySelect = (barangay) => {
    handleInputChange('barangay', barangay);
    setShowBarangayDropdown(false);
    
    // Filter household leads for household member role
    if (selectedRole?.value === 'household_member') {
      const filtered = filterHouseholdLeadsByBarangay(barangay);
      setFilteredHouseholdLeads(filtered);
    }
  };

  const handleHouseholdLeadSelect = (lead) => {
    handleInputChange('householdLead', lead.name);
    handleInputChange('householdLeadId', lead.id.toString());
    handleInputChange('householdAddress', lead.address);
    setShowHouseholdLeadDropdown(false);
  };

  const handleRelationshipSelect = (relationship) => {
    handleInputChange('relationship', relationship);
    setShowRelationshipDropdown(false);
  };

  // Function to handle date picker
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
      const formattedDate = formatDate(selectedDate);
      handleInputChange('birthDate', formattedDate);
      
      // Calculate and display age
      const age = calculateAge(selectedDate);
      if (age < 0 || age > 120) {
        Alert.alert('Invalid Date', 'Please select a valid birth date');
      }
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  // Function to show household lead dropdown with filtered leads
  const showFilteredHouseholdLeadDropdown = () => {
    if (!registrationData.barangay) {
      Alert.alert('Select Barangay First', 'Please select your barangay first to see available household leads in your area.');
      return;
    }
    
    const filtered = filterHouseholdLeadsByBarangay(registrationData.barangay);
    setFilteredHouseholdLeads(filtered);
    
    if (filtered.length === 0) {
      Alert.alert(
        'No Household Leads Found', 
        `No registered household leads found in ${registrationData.barangay}. Please ask a household lead in your barangay to register first.`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    setShowHouseholdLeadDropdown(true);
  };

  const nextStep = () => {
    if (currentStep < getTotalSteps()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getTotalSteps = () => {
    return 3;
  };

  const getStepTitle = () => {
    switch(currentStep) {
      case 1: return "Personal Information";
      case 2: return "Account Information";
      case 3: return `${selectedRole?.title} Details`;
      default: return "Registration";
    }
  };

  const validateStep = () => {
    switch(currentStep) {
      case 1:
        if (!registrationData.fullName || !registrationData.contactNumber || !registrationData.address) {
          Alert.alert('Validation Error', 'Please fill in all personal information fields');
          return false;
        }
        return true;
      
      case 2:
        if (!registrationData.email || !registrationData.password || !registrationData.confirmPassword) {
          Alert.alert('Validation Error', 'Please fill in all account information fields');
          return false;
        }
        
        if (registrationData.password !== registrationData.confirmPassword) {
          Alert.alert('Validation Error', 'Passwords do not match');
          return false;
        }
        
        if (registrationData.password.length < 6) {
          Alert.alert('Validation Error', 'Password must be at least 6 characters long');
          return false;
        }
        
        return true;
      
      case 3:
        // Role-specific validation
        if (selectedRole.value === 'rescuer') {
          if (!registrationData.organization || !registrationData.idNumber) {
            Alert.alert('Validation Error', 'Please fill in all rescuer details');
            return false;
          }
        } else if (selectedRole.value === 'household_lead') {
          if (!registrationData.familyMembers || !registrationData.barangay) {
            Alert.alert('Validation Error', 'Please fill in all household lead details');
            return false;
          }
        } else if (selectedRole.value === 'brgy_captain') {
          if (!registrationData.barangay || !registrationData.idNumber) {
            Alert.alert('Validation Error', 'Please fill in all barangay captain details');
            return false;
          }
        } else if (selectedRole.value === 'household_member') {
          if (!registrationData.barangay) {
            Alert.alert('Validation Error', 'Please select your barangay first');
            return false;
          }
          if (!registrationData.householdLeadId || !registrationData.relationship) {
            Alert.alert('Validation Error', 'Please select household lead and relationship');
            return false;
          }
          // Validation for birth date (required)
          if (!registrationData.birthDate) {
            Alert.alert('Validation Error', 'Please select your birth date');
            return false;
          }
          // Validation for age from birth date
          const birthDateObj = new Date(registrationData.birthDate);
          const age = calculateAge(birthDateObj);
          if (age < 0 || age > 120) {
            Alert.alert('Validation Error', 'Please enter a valid birth date');
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
    // Final validation
    if (!validateStep()) {
      return;
    }

    setIsSignupLoading(true);

    try {
      // Prepare form data for API
      const formData = {
        fullName: registrationData.fullName,
        email: registrationData.email,
        password: registrationData.password,
        contactNumber: registrationData.contactNumber,
        address: registrationData.address,
        role: registrationData.role,
        ...(registrationData.organization && { organization: registrationData.organization }),
        ...(registrationData.idNumber && { idNumber: registrationData.idNumber }),
        ...(registrationData.barangay && { barangay: registrationData.barangay }),
        ...(registrationData.familyMembers && { familyMembers: registrationData.familyMembers }),
        ...(registrationData.householdLeadId && { householdLeadId: registrationData.householdLeadId }),
        ...(registrationData.relationship && { relationship: registrationData.relationship }),
        ...(registrationData.householdLead && { householdLeadName: registrationData.householdLead }),
        ...(registrationData.householdAddress && { householdAddress: registrationData.householdAddress }),
        // Include disability and birth date for household members
        ...(registrationData.role === 'household_member' && { 
          disability: registrationData.disability || '',
          birthDate: registrationData.birthDate,
          age: calculateAge(new Date(registrationData.birthDate)) // Calculate age for backend
        })
      };

      console.log('Submitting registration data:', formData);

      const result = await signup(formData);
      
      if (result.success) {
        if (result.verificationRequired) {
          Alert.alert(
            'Registration Successful', 
            result.message || 'Please wait for verification from your household lead.',
            [{ text: 'OK', onPress: () => {
              setRegistrationFormVisible(false);
              resetForm();
            }}]
          );
        } else {
          Alert.alert(
            'Registration Successful', 
            result.message || 'Your account has been created successfully!',
            [{ text: 'OK', onPress: () => {
              setRegistrationFormVisible(false);
            }}]
          );
        }
      } else {
        Alert.alert('Registration Failed', result.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSignupLoading(false);
    }
  };

  const resetForm = () => {
    setRegistrationData({
      fullName: '',
      contactNumber: '',
      address: '',
      email: '',
      password: '',
      confirmPassword: '',
      organization: '',
      barangay: '',
      familyMembers: '',
      idNumber: '',
      householdLead: '',
      householdLeadId: '',
      relationship: '',
      householdAddress: '',
      role: '',
      disability: '',
      birthDate: ''
    });
    setSelectedRole(null);
    setCurrentStep(1);
    setBirthDate(new Date());
    setShowBarangayDropdown(false);
    setShowHouseholdLeadDropdown(false);
    setShowRelationshipDropdown(false);
    setShowDatePicker(false);
    setFilteredHouseholdLeads([]);
  };

  const renderStepIndicator = () => {
    return (
      <View className="flex-row justify-center items-center mb-8">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <View className={`w-10 h-10 rounded-full justify-center items-center ${
              step === currentStep 
                ? 'bg-blue-400 border-2 border-blue-500' 
                : step < currentStep 
                ? 'bg-green-400 border-2 border-green-500' 
                : 'bg-gray-200 border-2 border-gray-300'
            }`}>
              <Text className={`font-bold ${
                step === currentStep || step < currentStep 
                  ? 'text-white' 
                  : 'text-gray-500'
              }`}>
                {step}
              </Text>
            </View>
            {step < 3 && (
              <View className={`h-1 w-12 ${
                step < currentStep ? 'bg-green-400' : 'bg-gray-300'
              }`} />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  const renderBarangayDropdown = () => {
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
            <View className="w-4/5 bg-white rounded-2xl max-h-2/3">
              <View className="p-4 border-b border-gray-200">
                <Text className="text-lg font-bold text-gray-800">Select Barangay</Text>
                <Text className="text-sm text-gray-500 mt-1">Choose your barangay from the list</Text>
              </View>
              
              <View className="px-4 py-2">
                <TextInput
                  placeholder="Search barangay..."
                  className="border border-gray-300 rounded-xl p-3 bg-gray-50 mb-2"
                  onChangeText={(text) => {
                    // Search functionality would go here
                    console.log("Search barangay:", text);
                  }}
                />
              </View>
              
              <FlatList
                data={barangays}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="px-4 py-3 border-b border-gray-100 active:bg-gray-50"
                    onPress={() => handleBarangaySelect(item)}
                  >
                    <Text className="text-base text-gray-800">{item}</Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                className="max-h-64"
              />
              
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
                <Text className="text-lg font-bold text-gray-800">Select Household Lead</Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Available household leads in {registrationData.barangay}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Total: {filteredHouseholdLeads.length} household lead(s) found
                </Text>
              </View>
              
              <View className="px-4 py-2">
                <TextInput
                  placeholder="Search household lead..."
                  className="border border-gray-300 rounded-xl p-3 bg-gray-50 mb-2"
                  onChangeText={(text) => {
                    // Filter household leads by search text
                    if (text.trim() === '') {
                      setFilteredHouseholdLeads(filterHouseholdLeadsByBarangay(registrationData.barangay));
                    } else {
                      const filtered = filterHouseholdLeadsByBarangay(registrationData.barangay)
                        .filter(lead => 
                          lead.name.toLowerCase().includes(text.toLowerCase()) ||
                          lead.address.toLowerCase().includes(text.toLowerCase())
                        );
                      setFilteredHouseholdLeads(filtered);
                    }
                  }}
                />
              </View>
              
              {filteredHouseholdLeads.length === 0 ? (
                <View className="p-8 items-center justify-center">
                  <Text className="text-gray-500 text-center">
                    No household leads found in {registrationData.barangay}.
                    Please ask a household lead in your barangay to register first.
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={filteredHouseholdLeads}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className="px-4 py-3 border-b border-gray-100 active:bg-gray-50"
                      onPress={() => handleHouseholdLeadSelect(item)}
                    >
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-gray-800">{item.name}</Text>
                          <Text className="text-sm text-gray-500 mt-1">{item.address}</Text>
                          <View className="flex-row items-center mt-1">
                            <Text className="text-xs text-gray-500">Contact: {item.contact}</Text>
                            <Text className="text-xs text-gray-500 mx-2">•</Text>
                            <Text className="text-xs text-gray-500">Members: {item.members}</Text>
                            <Text className="text-xs text-gray-500 mx-2">•</Text>
                            <Text className="text-xs text-blue-500">Barangay: {item.barangay}</Text>
                          </View>
                        </View>
                        <View className="w-6 h-6 rounded-full border border-blue-400 justify-center items-center ml-2">
                          <Text className="text-blue-400 text-xs">→</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                  className="max-h-80"
                />
              )}
              
              <View className="p-4 border-t border-gray-200">
                <Text className="text-sm font-semibold text-gray-700 mb-1">Can't find your household lead?</Text>
                <Text className="text-sm text-gray-500">
                  Make sure the household lead is already registered in the system in your barangay ({registrationData.barangay}). 
                  If not, ask them to register first as a Household Lead.
                </Text>
              </View>
              
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
                <Text className="text-lg font-bold text-gray-800">Select Relationship</Text>
                <Text className="text-sm text-gray-500 mt-1">Choose your relationship to the household lead</Text>
              </View>
              
              <FlatList
                data={relationships}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="px-4 py-3 border-b border-gray-100 active:bg-gray-50"
                    onPress={() => handleRelationshipSelect(item)}
                  >
                    <Text className="text-base text-gray-800">{item}</Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                className="max-h-64"
              />
              
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

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <View className="space-y-4">
            <Text className="text-lg font-bold text-gray-800 mb-2">Personal Details</Text>
            
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-1">Full Name *</Text>
              <TextInput
                placeholder="Enter your full name"
                value={registrationData.fullName}
                onChangeText={(value) => handleInputChange('fullName', value)}
                className="border border-gray-300 rounded-xl p-4 bg-gray-50"
              />
            </View>

            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-1">Contact Number *</Text>
              <TextInput
                placeholder="Enter your contact number"
                value={registrationData.contactNumber}
                onChangeText={(value) => handleInputChange('contactNumber', value)}
                keyboardType="phone-pad"
                className="border border-gray-300 rounded-xl p-4 bg-gray-50"
              />
            </View>

            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-1">Address *</Text>
              <TextInput
                placeholder="Enter your complete address"
                value={registrationData.address}
                onChangeText={(value) => handleInputChange('address', value)}
                multiline
                numberOfLines={3}
                className="border border-gray-300 rounded-xl p-4 bg-gray-50 h-24"
              />
            </View>

            {/* Barangay Field (Added to Step 1) */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-1">Barangay *</Text>
              <TouchableOpacity
                onPress={() => setShowBarangayDropdown(true)}
                className="border border-gray-300 rounded-xl p-4 bg-gray-50 justify-center min-h-[60px]"
              >
                {registrationData.barangay ? (
                  <Text className="text-gray-800">{registrationData.barangay}</Text>
                ) : (
                  <Text className="text-gray-500">Select your barangay</Text>
                )}
              </TouchableOpacity>
              <Text className="text-xs text-gray-500 mt-1">Tap to select barangay</Text>
            </View>
          </View>
        );

      case 2:
        return (
          <View className="space-y-4">
            <Text className="text-lg font-bold text-gray-800 mb-2">Account Information</Text>
            
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-1">Email Address *</Text>
              <TextInput
                placeholder="Enter your email"
                value={registrationData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                className="border border-gray-300 rounded-xl p-4 bg-gray-50"
              />
            </View>

            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-1">Password *</Text>
              <TextInput
                placeholder="Create a password (min. 6 characters)"
                value={registrationData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry
                className="border border-gray-300 rounded-xl p-4 bg-gray-50"
              />
              <Text className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</Text>
            </View>

            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-1">Confirm Password *</Text>
              <TextInput
                placeholder="Confirm your password"
                value={registrationData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry
                className="border border-gray-300 rounded-xl p-4 bg-gray-50"
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View className="space-y-4">
            <View className="flex-row items-center mb-4 p-3 bg-blue-50 rounded-xl">
              <View className="w-12 h-12 rounded-full bg-white justify-center items-center mr-3">
                <Text className="text-2xl">{selectedRole?.icon}</Text>
              </View>
              <View>
                <Text className="text-lg font-bold text-gray-800">{selectedRole?.title}</Text>
                <Text className="text-sm text-gray-600">{selectedRole?.description}</Text>
              </View>
            </View>

            {selectedRole?.value === "rescuer" && (
              <>
                <Text className="text-lg font-bold text-gray-800 mb-2">Rescuer Details</Text>
                
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-1">Organization *</Text>
                  <TextInput
                    placeholder="Enter your organization"
                    value={registrationData.organization}
                    onChangeText={(value) => handleInputChange('organization', value)}
                    className="border border-gray-300 rounded-xl p-4 bg-gray-50"
                  />
                </View>

                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-1">ID Number *</Text>
                  <TextInput
                    placeholder="Enter your ID number"
                    value={registrationData.idNumber}
                    onChangeText={(value) => handleInputChange('idNumber', value)}
                    className="border border-gray-300 rounded-xl p-4 bg-gray-50"
                  />
                </View>
              </>
            )}

            {selectedRole?.value === "household_lead" && (
              <>
                <Text className="text-lg font-bold text-gray-800 mb-2">Household Details</Text>
                
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-1">Number of Family Members *</Text>
                  <TextInput
                    placeholder="Enter number of family members (including yourself)"
                    value={registrationData.familyMembers}
                    onChangeText={(value) => handleInputChange('familyMembers', value)}
                    keyboardType="numeric"
                    className="border border-gray-300 rounded-xl p-4 bg-gray-50"
                  />
                </View>

                <View className="p-3 bg-green-50 rounded-xl border border-green-200">
                  <Text className="text-sm font-semibold text-green-800 mb-1">Selected Barangay:</Text>
                  <Text className="text-gray-800">{registrationData.barangay}</Text>
                  <Text className="text-xs text-green-600 mt-1">
                    ✓ Barangay already selected in Step 1
                  </Text>
                </View>
              </>
            )}

            {selectedRole?.value === "brgy_captain" && (
              <>
                <Text className="text-lg font-bold text-gray-800 mb-2">Barangay Official Details</Text>
                
                <View className="p-3 bg-green-50 rounded-xl border border-green-200">
                  <Text className="text-sm font-semibold text-green-800 mb-1">Selected Barangay:</Text>
                  <Text className="text-gray-800">{registrationData.barangay}</Text>
                  <Text className="text-xs text-green-600 mt-1">
                    ✓ Barangay already selected in Step 1
                  </Text>
                </View>

                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-1">Official ID Number *</Text>
                  <TextInput
                    placeholder="Enter your official ID number"
                    value={registrationData.idNumber}
                    onChangeText={(value) => handleInputChange('idNumber', value)}
                    className="border border-gray-300 rounded-xl p-4 bg-gray-50"
                  />
                </View>

                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-1">Contact Person for Emergency</Text>
                  <TextInput
                    placeholder="Enter contact person details"
                    value={registrationData.organization}
                    onChangeText={(value) => handleInputChange('organization', value)}
                    className="border border-gray-300 rounded-xl p-4 bg-gray-50"
                  />
                </View>
              </>
            )}

            {selectedRole?.value === "household_member" && (
              <>
                <Text className="text-lg font-bold text-gray-800 mb-2">Household Membership Details</Text>
                
                {/* Barangay Display (Already selected in Step 1) */}
                <View className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <Text className="text-sm font-semibold text-blue-800 mb-1">Selected Barangay:</Text>
                  <View className="flex-row items-center">
                    <Text className="text-gray-800 font-semibold text-lg">{registrationData.barangay}</Text>
                    <TouchableOpacity 
                      onPress={() => setShowBarangayDropdown(true)}
                      className="ml-2 px-3 py-1 bg-blue-100 rounded-full"
                    >
                      <Text className="text-blue-600 text-xs">Change</Text>
                    </TouchableOpacity>
                  </View>
                  <Text className="text-xs text-blue-600 mt-1">
                    ✓ Household leads will be filtered by this barangay
                  </Text>
                </View>

                {/* Household Lead Selection */}
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-1">Household Lead Name *</Text>
                  <TouchableOpacity
                    onPress={showFilteredHouseholdLeadDropdown}
                    className="border border-gray-300 rounded-xl p-4 bg-gray-50 justify-center min-h-[60px]"
                  >
                    {registrationData.householdLead ? (
                      <View>
                        <Text className="text-gray-800 font-semibold">{registrationData.householdLead}</Text>
                        <Text className="text-sm text-gray-500 mt-1">{registrationData.householdAddress}</Text>
                      </View>
                    ) : (
                      <Text className="text-gray-500">
                        {registrationData.barangay 
                          ? `Select household lead in ${registrationData.barangay}` 
                          : 'Select barangay first'}
                      </Text>
                    )}
                  </TouchableOpacity>
                  <Text className="text-xs text-gray-500 mt-1">
                    {registrationData.barangay 
                      ? `Tap to select household lead from ${registrationData.barangay}`
                      : 'Please select barangay first'}
                  </Text>
                </View>

                {/* Relationship Selection */}
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-1">Relationship to Household Lead *</Text>
                  <TouchableOpacity
                    onPress={() => setShowRelationshipDropdown(true)}
                    className="border border-gray-300 rounded-xl p-4 bg-gray-50 justify-center min-h-[60px]"
                  >
                    {registrationData.relationship ? (
                      <Text className="text-gray-800">{registrationData.relationship}</Text>
                    ) : (
                      <Text className="text-gray-500">Select relationship</Text>
                    )}
                  </TouchableOpacity>
                  <Text className="text-xs text-gray-500 mt-1">Tap to select your relationship to the household lead</Text>
                </View>

                {/* Birth Date Field */}
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-1">Birth Date *</Text>
                  <TouchableOpacity
                    onPress={showDatepicker}
                    className="border border-gray-300 rounded-xl p-4 bg-gray-50 justify-center min-h-[60px]"
                  >
                    {registrationData.birthDate ? (
                      <View>
                        <Text className="text-gray-800">{registrationData.birthDate}</Text>
                        <Text className="text-sm text-gray-500 mt-1">
                          Age: {calculateAge(new Date(registrationData.birthDate))} years old
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-gray-500">Select your birth date</Text>
                    )}
                  </TouchableOpacity>
                  <Text className="text-xs text-gray-500 mt-1">Tap to select birth date</Text>
                </View>

                {/* Disability Field */}
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-1">Disability (Optional)</Text>
                  <TextInput
                    placeholder="Enter any disability (if applicable)"
                    value={registrationData.disability}
                    onChangeText={(value) => handleInputChange('disability', value)}
                    className="border border-gray-300 rounded-xl p-4 bg-gray-50"
                  />
                  <Text className="text-xs text-gray-500 mt-1">Leave blank if no disability</Text>
                </View>

                {/* Selected Household Info Display */}
                {registrationData.householdLead && (
                  <View className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                    <Text className="text-sm font-semibold text-green-800 mb-2">Selected Household Lead:</Text>
                    <View className="flex-row items-start">
                      <View className="w-8 h-8 rounded-full bg-green-100 justify-center items-center mr-3">
                        <Text className="text-green-600">👤</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-800">{registrationData.householdLead}</Text>
                        <Text className="text-sm text-gray-600 mt-1">{registrationData.householdAddress}</Text>
                        <View className="flex-row items-center mt-2">
                          <Text className="text-xs text-green-600 mr-4">✓ Barangay: {registrationData.barangay}</Text>
                          <Text className="text-xs text-green-600">✓ Ready to register</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                {/* Important Note */}
                <View className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <Text className="text-sm font-semibold text-yellow-800 mb-2">Important Note:</Text>
                  <Text className="text-sm text-yellow-700">
                    You must be associated with an existing household lead who is already registered in the system in your barangay. 
                    If you cannot find your household lead, please ask them to register first as a Household Lead in {registrationData.barangay}.
                  </Text>
                </View>
              </>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <View className="flex-1 justify-center px-6 pb-6 bg-white">
        <View className="items-center mb-6">
          <LinearGradient 
            colors={["#4facfe", "#FC563C"]} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }} 
            className="w-40 h-40 rounded-full justify-center items-center"
          >
            <Image source={slide.image} className="w-full h-full" resizeMode="contain" />
          </LinearGradient>

          <Text className="text-2xl font-extrabold text-center my-2 text-gray-800">
            {slide.title}
          </Text>
          <Text className="text-base text-center mb-6 text-gray-600">
            {slide.description}
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold mb-1 text-gray-700">Email Address</Text>
          <TextInput 
            placeholder="Enter your email" 
            placeholderTextColor="rgba(0,0,0,0.5)" 
            value={email} 
            onChangeText={setEmail} 
            className="border-2 border-gray-300 rounded-2xl p-4 bg-gray-50" 
            keyboardType="email-address" 
            autoCapitalize="none" 
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold mb-1 text-gray-700">Password</Text>
          <TextInput 
            placeholder="Enter your password" 
            placeholderTextColor="rgba(0,0,0,0.5)" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
            className="border-2 border-gray-300 rounded-2xl p-4 bg-gray-50" 
          />
        </View>

        {/* Sign In Button */}
        <TouchableOpacity 
          onPress={handleLogin} 
          className="h-14 rounded-3xl justify-center items-center bg-blue-400 mb-3"
          disabled={isLoading}
        >
          <Text className="text-base font-bold text-white">
            {isLoading ? "Signing In..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        {/* Register Link */}
        <TouchableOpacity 
          onPress={handleRegisterPress}
          className="p-4 items-center"
        >
          <Text className="text-sm text-blue-400 font-semibold">
            Don't have an account? <Text className="font-bold underline">Register here</Text>
          </Text>
        </TouchableOpacity>
      </View>

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
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-transparent'
                  }`}
                  onPress={() => handleRoleSelect(role)}
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

      {/* Registration Form Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={registrationFormVisible}
        onRequestClose={() => setRegistrationFormVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl max-h-5/6">
              <View className="p-5 border-b border-gray-200">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-xl font-bold text-gray-800">
                    {getStepTitle()}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setRegistrationFormVisible(false)}
                    className="p-2"
                  >
                    <Text className="text-2xl text-gray-500">×</Text>
                  </TouchableOpacity>
                </View>
                
                {renderStepIndicator()}
              </View>

              <ScrollView 
                className="px-5 pt-4 pb-6"
                showsVerticalScrollIndicator={false}
              >
                {renderStepContent()}
                
                <View className="flex-row justify-between mt-8 mb-4">
                  {currentStep > 1 ? (
                    <TouchableOpacity
                      onPress={prevStep}
                      className="flex-1 h-14 rounded-2xl justify-center items-center border-2 border-gray-300 mr-2"
                      disabled={isSignupLoading}
                    >
                      <Text className="text-base font-semibold text-gray-700">
                        Previous
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => setRegistrationFormVisible(false)}
                      className="flex-1 h-14 rounded-2xl justify-center items-center border-2 border-gray-300 mr-2"
                      disabled={isSignupLoading}
                    >
                      <Text className="text-base font-semibold text-gray-700">
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  )}

                  {currentStep < getTotalSteps() ? (
                    <TouchableOpacity
                      onPress={handleNextStep}
                      className="flex-1 h-14 rounded-2xl justify-center items-center bg-blue-400 ml-2"
                      disabled={isSignupLoading}
                    >
                      <Text className="text-base font-bold text-white">
                        Next
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={handleSubmitRegistration}
                      className="flex-1 h-14 rounded-2xl justify-center items-center bg-green-500 ml-2"
                      disabled={isSignupLoading}
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

                <View className="flex-row justify-center mt-4 mb-2">
                  <Text className="text-sm text-gray-500">
                    Step {currentStep} of {getTotalSteps()}
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={birthDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}

      {/* Barangay Dropdown Modal */}
      {renderBarangayDropdown()}
      
      {/* Household Lead Dropdown Modal */}
      {renderHouseholdLeadDropdown()}
      
      {/* Relationship Dropdown Modal */}
      {renderRelationshipDropdown()}
    </>
  );
}