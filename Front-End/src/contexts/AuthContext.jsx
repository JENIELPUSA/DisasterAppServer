import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as ImagePicker from 'expo-image-picker';
import { Alert } from "react-native";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const apiUrl = Constants.expoConfig.extra.apiUrl;
  const [authToken, setAuthToken] = useState(null);
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState(null);
  const [first_name, setFirstName] = useState(null);
  const [last_name, setLastName] = useState(null);
  const [contact_number, setContactNumber] = useState(null);
  const [userId, setUserID] = useState(null);
  const [linkId, setLinkId] = useState(null);
  const [Designatedzone, setDesignatedzone] = useState(null);
  const [theme, setTheme] = useState("light");
  const [isLoading, setIsLoading] = useState(true);
  const [avatar, setAvatar] = useState(null);

  // Helper function to safely handle undefined/null values
  const safeValue = (value) => {
    return value !== null && value !== undefined ? value.toString() : "";
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const keys = [
          "token", "role", "email", "first_name", "last_name", 
          "contact_number", "userId", "linkId", "Designatedzone", 
          "theme", "avatar"
        ];
        const values = await AsyncStorage.multiGet(keys);
        
        console.log('Loaded values:', values);

        values.forEach(([key, value]) => {
          if (value !== null && value !== 'null' && value !== '') {
            console.log(`Setting ${key}:`, value);
            
            switch (key) {
              case "token":
                setAuthToken(value);
                break;
              case "role":
                setRole(value);
                break;
              case "email":
                setEmail(value);
                break;
              case "first_name":
                setFirstName(value);
                break;
              case "last_name":
                setLastName(value);
                break;
              case "contact_number":
                setContactNumber(value);
                break;
              case "userId":
                setUserID(value);
                break;
              case "linkId":
                setLinkId(value);
                break;
              case "Designatedzone":
                setDesignatedzone(value);
                break;
              case "theme":
                setTheme(value || "light");
                break;
              case "avatar":
                setAvatar(value);
                break;
              default:
                break;
            }

            // Set axios header if token
            if (key === "token" && value) {
              axios.defaults.headers.common["Authorization"] = `Bearer ${value}`;
            }
          }
        });
      } catch (error) {
        console.error('Error loading data from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Update axios header when authToken changes
  useEffect(() => {
    if (authToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [authToken]);

  // Function to pick image for avatar
  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to select an image.');
        return null;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        return {
          uri: result.assets[0].uri,
          base64: result.assets[0].base64,
          type: result.assets[0].mimeType || 'image/jpeg',
          fileName: result.assets[0].fileName || 'avatar.jpg'
        };
      }
      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
      return null;
    }
  };

  // Signup function
  const signup = async (formData) => {
    try {
      console.log('Starting signup process...');

      console.log("formData",formData)
      
      // Create FormData object for multipart/form-data
      const data = new FormData();
      
      // Append common fields
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('contactNumber', formData.contactNumber);
      data.append('address', formData.address);
      data.append('role', formData.role);
      
      // Append role-specific fields
      switch(formData.role) {
        case 'rescuer':
          data.append('organization', formData.organization);
          data.append('idNumber', formData.idNumber);
          break;
          
        case 'household_lead':
          data.append('barangay', formData.barangay);
          data.append('familyMembers', formData.familyMembers.toString());
          break;
          
        case 'brgy_captain':
          data.append('barangay', formData.barangay);
          data.append('idNumber', formData.idNumber);
          data.append('organization', formData.organization || 'Barangay');
          break;
          
        case 'household_member':
          data.append('householdLeadId', formData.householdLeadId);
          data.append('relationship', formData.relationship);
          data.append('householdLeadName', formData.householdLeadName);
          data.append('householdAddress', formData.householdAddress);
          break;
          
        default:
          return {
            success: false,
            message: 'Invalid role selected'
          };
      }
      
      // Append avatar if exists
      if (formData.avatar) {
        data.append('avatar', {
          uri: formData.avatar.uri,
          type: formData.avatar.type || 'image/jpeg',
          name: formData.avatar.fileName || 'avatar.jpg'
        });
      }
      
      // Make the signup request
      const res = await axios.post(
        `${apiUrl}/api/v1/authentication/signup`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true
        }
      );
      
      console.log('Signup response:', res.data);
      
      if (res.data.success) {
        const { 
          token, 
          user, 
          roleProfile, 
          verificationRequired 
        } = res.data.data;
        
        // Split fullName into first and last name
        const nameParts = user.fullName.split(' ');
        const first_name = nameParts[0];
        const last_name = nameParts.slice(1).join(' ');
        
        // Prepare data for AsyncStorage
        const storageData = [
          ["token", safeValue(token)],
          ["role", safeValue(user.role)],
          ["email", safeValue(user.email)],
          ["first_name", safeValue(first_name)],
          ["last_name", safeValue(last_name)],
          ["contact_number", safeValue(formData.contactNumber)],
          ["userId", safeValue(user._id)],
          ["linkId", safeValue(user.linkedId)],
          ["Designatedzone", safeValue(formData.barangay || "")],
          ["theme", safeValue("light")],
          ["avatar", safeValue(user.avatar || "")],
        ];
        
        await AsyncStorage.multiSet(storageData);
        
        setRole(user.role || "");
        setEmail(user.email || "");
        setFirstName(first_name || "");
        setLastName(last_name || "");
        setContactNumber(formData.contactNumber || "");
        setUserID(user._id || "");
        setLinkId(user.linkedId || "");
        setDesignatedzone(formData.barangay || "");
        setAvatar(user.avatar || null);
        
        // Set axios header
        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
        
        return {
          success: true,
          message: res.data.message,
          verificationRequired: verificationRequired || false,
          data: {
            user,
            roleProfile,
            token
          }
        };
      } else {
        return {
          success: false,
          message: res.data.message || "Signup failed",
        };
      }
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message);
      
      let errorMessage = "Network error";
      if (error.response?.data) {
        errorMessage = error.response.data.message || error.response.data.error;
      }
      
      return {
        success: false,
        message: errorMessage,
        errorDetails: error.response?.data
      };
    }
  };

  // Check email availability
  const checkEmailAvailability = async (email) => {
    try {
      const res = await axios.get(
        `${apiUrl}/api/v1/authentication/check-email?email=${encodeURIComponent(email)}`
      );
      
      return {
        success: true,
        available: res.data.available,
        message: res.data.message
      };
    } catch (error) {
      console.error('Check email error:', error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to check email"
      };
    }
  };

  const login = async (inputEmail, password) => {
    try {

      const res = await axios.post(
        `${apiUrl}/api/v1/authentication/login`,
        { email: inputEmail, password },
        { withCredentials: true }
      );

      console.log('Login response:', res.data);

      if (res.data.status === "Success") {
        const {
          token,
          role,
          email: serverEmail,
          first_name,
          last_name,
          contact_number,
          userId,
          linkId,
          Designatedzone,
          theme,
        } = res.data;

        // Prepare data for AsyncStorage - ensure no undefined values
        const storageData = [
          ["token", safeValue(token)],
          ["role", safeValue(role)],
          ["email", safeValue(serverEmail)],
          ["first_name", safeValue(first_name)],
          ["last_name", safeValue(last_name)],
          ["contact_number", safeValue(contact_number)], // This was causing the error
          ["userId", safeValue(userId)],
          ["linkId", safeValue(linkId)],
          ["Designatedzone", safeValue(Designatedzone)],
          ["theme", safeValue(theme || "light")],
        ];
        await AsyncStorage.multiSet(storageData);

        // Update state
        setAuthToken(token || "");
        setRole(role || "");
        setEmail(serverEmail || "");
        setFirstName(first_name || "");
        setLastName(last_name || "");
        setContactNumber(contact_number || ""); // Handle undefined contact_number
        setUserID(userId || "");
        setLinkId(linkId || "");
        setDesignatedzone(Designatedzone || "");
        setTheme(theme || "light");

        // Set axios header
        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }

        return { success: true, role, userId };
      } else {
        return {
          success: false,
          message: res.data.message || "Login failed",
        };
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Network error",
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const keys = [
        "token", "role", "email", "first_name", "last_name", 
        "contact_number", "userId", "linkId", "Designatedzone", 
        "theme", "avatar"
      ];
      await AsyncStorage.multiRemove(keys);

      // Reset all states
      setAuthToken(null);
      setRole(null);
      setEmail(null);
      setFirstName(null);
      setLastName(null);
      setContactNumber(null);
      setUserID(null);
      setLinkId(null);
      setDesignatedzone(null);
      setTheme("light");
      setAvatar(null);
      
      delete axios.defaults.headers.common["Authorization"];
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const data = new FormData();
      
      if (profileData.fullName) data.append('fullName', profileData.fullName);
      if (profileData.contactNumber) data.append('contactNumber', profileData.contactNumber);
      if (profileData.address) data.append('address', profileData.address);
      
      // Append avatar if exists
      if (profileData.avatar) {
        data.append('avatar', {
          uri: profileData.avatar.uri,
          type: profileData.avatar.type || 'image/jpeg',
          name: profileData.avatar.fileName || 'avatar.jpg'
        });
      }
      
      const res = await axios.put(
        `${apiUrl}/api/v1/authentication/update-profile`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true
        }
      );
      
      if (res.data.success) {
        // Update local storage and state with new data
        if (profileData.fullName) {
          const nameParts = profileData.fullName.split(' ');
          const first_name = nameParts[0];
          const last_name = nameParts.slice(1).join(' ');
          
          await AsyncStorage.multiSet([
            ["first_name", safeValue(first_name)],
            ["last_name", safeValue(last_name)]
          ]);
          
          setFirstName(first_name);
          setLastName(last_name);
        }
        
        if (profileData.contactNumber) {
          await AsyncStorage.setItem("contact_number", safeValue(profileData.contactNumber));
          setContactNumber(profileData.contactNumber);
        }
        
        if (res.data.data.avatar) {
          await AsyncStorage.setItem("avatar", safeValue(res.data.data.avatar.url || res.data.data.avatar));
          setAvatar(res.data.data.avatar.url || res.data.data.avatar);
        }
        
        return {
          success: true,
          message: res.data.message,
          data: res.data.data
        };
      }
      
      return {
        success: false,
        message: res.data.message || "Update failed"
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || "Network error"
      };
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      const res = await axios.post(
        `${apiUrl}/api/v1/authentication/forgot-password`,
        { email }
      );
      
      return {
        success: true,
        message: res.data.message
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || "Network error"
      };
    }
  };

  // Reset password function
  const resetPassword = async (token, newPassword) => {
    try {
      const res = await axios.patch(
        `${apiUrl}/api/v1/authentication/reset-password/${token}`,
        { password: newPassword }
      );
      
      return {
        success: true,
        message: res.data.message
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || "Network error"
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authToken,
        role,
        email,
        first_name,
        last_name,
        contact_number,
        userId,
        linkId,
        Designatedzone,
        theme,
        avatar,
        isLoading,
        login,
        logout,
        signup,
        pickImage,
        checkEmailAvailability,
        updateProfile,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};