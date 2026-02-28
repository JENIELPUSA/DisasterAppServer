import React, { createContext, useState, useContext, useCallback } from "react";
import axios from "axios";
import Constants from "expo-constants";
import { AuthContext } from "../AuthContext";

export const TrackingEvacuatesContext = createContext();

export const TrackingEvacuatesProvider = ({ children }) => {
  const { authToken } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const backendUrl = Constants.expoConfig.extra.apiUrl;

  // ==============================
  // CENTRALIZED ERROR HANDLER
  // ==============================
  const handleError = (err) => {
    const msg = err.response?.data?.message || err.message;
    console.log("❌ TrackingEvacuates ERROR:", msg);
    setError(msg);
  };

  // ==============================
  // ADD TrackingEvacuates (check-in / check-out)
  // ==============================
  const addTrackingEvacuates = async (values) => {
    if (!authToken) return { success: false, error: "No auth token" };

    try {
      setLoading(true);
      setError(null);

      const res = await axios.post(
        `${backendUrl}/api/v1/TrackingEvacuates`,
        values,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );

      if (res.data.status === "success") {
        return {
          success: true,
          data: res.data.data,
        };
      }

      return {
        success: false,
        error: res.data.message || "Failed to add TrackingEvacuates",
      };
    } catch (err) {
      handleError(err);
      return {
        success: false,
        error: err.response?.data?.message || err.message,
      };
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // DELETE TrackingEvacuates
  // ==============================
  const deleteTrackingEvacuates = async (TrackingEvacuatesId) => {
    if (!authToken) return { success: false, error: "No auth token" };

    try {
      setLoading(true);
      setError(null);

      const res = await axios.delete(
        `${backendUrl}/api/v1/TrackingEvacuates/${TrackingEvacuatesId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );

      if (res.data.status === "success") {
        return { success: true };
      }

      return {
        success: false,
        error: res.data.message || "Failed to delete TrackingEvacuates",
      };
    } catch (err) {
      handleError(err);
      return {
        success: false,
        error: err.response?.data?.message || err.message,
      };
    } finally {
      setLoading(false);
    }
  };

  return (
    <TrackingEvacuatesContext.Provider
      value={{
        loading,
        error,
        addTrackingEvacuates,
        deleteTrackingEvacuates,
        setError,
      }}
    >
      {children}
    </TrackingEvacuatesContext.Provider>
  );
};
