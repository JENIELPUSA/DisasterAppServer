import React, { createContext, useState, useEffect } from "react";
import Constants from "expo-constants";
import axios from "axios";

// Create Context
export const MunicipalityContext = createContext();

// Provider Component
export const MunicipalityProvider = ({ children }) => {
  const [municipalities, setMunicipalities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const backendUrl = Constants.expoConfig.extra.apiUrl;
  const fetchMunicipalities = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/v1/Municipality`);
      setMunicipalities(res.data.data || []);
    } catch (err) {
      console.error("Fetch Municipalities Error:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const createMunicipality = async (municipalityName, code) => {
    setLoading(true);
    try {
      const res = await axios.post(`${backendUrl}/municipalities`, {
        municipalityName,
        code,
      });
      setMunicipalities((prev) => [...prev, res.data.data]);
      return res.data.data;
    } catch (err) {
      console.error("Create Municipality Error:", err);
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // UPDATE municipality
  // -----------------------------
  const updateMunicipality = async (id, municipalityName, code) => {
    setLoading(true);
    try {
      const res = await axios.put(`${backendUrl}/municipalities/${id}`, {
        municipalityName,
        code,
      });
      setMunicipalities((prev) =>
        prev.map((m) => (m._id === id ? res.data.data : m))
      );
      return res.data.data;
    } catch (err) {
      console.error("Update Municipality Error:", err);
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMunicipality = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${backendUrl}/municipalities/${id}`);
      setMunicipalities((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error("Delete Municipality Error:", err);
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Load municipalities on mount
  // -----------------------------
  useEffect(() => {
    fetchMunicipalities();
  }, []);

  return (
    <MunicipalityContext.Provider
      value={{
        municipalities,
        loading,
        error,
        fetchMunicipalities,
        createMunicipality,
        updateMunicipality,
        deleteMunicipality,
      }}
    >
      {children}
    </MunicipalityContext.Provider>
  );
};
