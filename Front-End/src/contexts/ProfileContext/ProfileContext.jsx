import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import Constants from "expo-constants";
import { AuthContext } from "../AuthContext";

export const ProfileDisplayContext = createContext();

export const ProfileProvider = ({ children }) => {
  const { authToken, logout, user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const backendUrl = Constants.expoConfig.extra.apiUrl;

  const handleError = (error) => {
    console.error(error);
    if (error.response?.status === 401) logout();
  };

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    if (!authToken) return null;

    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${backendUrl}/api/v1/Admin/Profile`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Cache-Control": "no-cache",
        },
      });

      const profileData = res.data.data || null;
      setProfile(profileData);
      return profileData;
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authToken, backendUrl]);

  // Update user profile
  const updateProfile = useCallback(async (values) => {
    if (!authToken) return null;

    try {
      setLoading(true);
      setError(null);

      const res = await axios.put(
        `${backendUrl}/api/v1/Admin/Profile`,
        values,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const updatedProfile = res.data.data || null;
      setProfile(updatedProfile);
      return { success: true, data: updatedProfile };
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || err.message);
      return {
        success: false,
        error: err.response?.data?.message || err.message,
      };
    } finally {
      setLoading(false);
    }
  }, [authToken, backendUrl]);

  // Change password
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!authToken) return null;

    try {
      setLoading(true);
      setError(null);

      const res = await axios.post(
        `${backendUrl}/api/v1/Admin/ChangePassword`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      return { success: true, message: res.data.message };
    } catch (err) {
      console.error("Error changing password:", err);
      setError(err.response?.data?.message || err.message);
      return {
        success: false,
        error: err.response?.data?.message || err.message,
      };
    } finally {
      setLoading(false);
    }
  }, [authToken, backendUrl]);

  // Upload profile picture
  const uploadProfilePicture = useCallback(async (imageUri) => {
    if (!authToken) return null;

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("profilePicture", {
        uri: imageUri,
        type: "image/jpeg",
        name: "profile.jpg",
      });

      const res = await axios.post(
        `${backendUrl}/api/v1/Admin/UploadProfilePicture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedProfile = res.data.data || null;
      setProfile(updatedProfile);
      return { success: true, data: updatedProfile };
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      setError(err.response?.data?.message || err.message);
      return {
        success: false,
        error: err.response?.data?.message || err.message,
      };
    } finally {
      setLoading(false);
    }
  }, [authToken, backendUrl]);

  // Get profile statistics (if needed)
  const getProfileStatistics = useCallback(async () => {
    if (!authToken) return null;

    try {
      const res = await axios.get(`${backendUrl}/api/v1/Admin/Profile/Stats`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      return res.data.data || null;
    } catch (err) {
      console.error("Error fetching profile statistics:", err);
      return null;
    }
  }, [authToken, backendUrl]);

  // Clear profile data (for logout)
  const clearProfile = useCallback(() => {
    setProfile(null);
    setError(null);
  }, []);

  // Load profile on mount if token exists
  useEffect(() => {
    const loadInitialProfile = async () => {
      if (authToken) {
        await fetchProfile();
      }
    };

    loadInitialProfile();
  }, [authToken, fetchProfile]);

  return (
    <ProfileDisplayContext.Provider
      value={{
        profile,
        loading,
        error,
        fetchProfile,
        updateProfile,
        changePassword,
        uploadProfilePicture,
        getProfileStatistics,
        clearProfile,
      }}
    >
      {children}
    </ProfileDisplayContext.Provider>
  );
};