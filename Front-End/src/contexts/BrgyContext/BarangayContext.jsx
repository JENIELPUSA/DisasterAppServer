import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";

export const BarangayDisplayContext = createContext();

export const BarangayDisplayProvider = ({ children }) => {
  const { authToken, logout } = useContext(AuthContext);
  const [barangays, setBarangays] = useState([]);
  const [totalBarangays, setTotalBarangays] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);

  const limit = 10;

  // -----------------------------
  // Centralized error handler
  // -----------------------------
  const handleError = (error) => {
    setCustomError(error.response?.data?.message || error.message || "Something went wrong.");
    setModalStatus("failed");
    setShowModal(true);
  };

  // -----------------------------
  // Fetch barangays with filters
  // -----------------------------
  const fetchBarangays = useCallback(async (page = 1) => {
    if (!authToken) return;
    try {
      setLoading(true);

      const params = { page, limit };
      if (search.trim()) params.search = search.trim();
      if (dateFrom.trim()) params.dateFrom = dateFrom.trim();
      if (dateTo.trim()) params.dateTo = dateTo.trim();

      const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Barangay`, {
        params,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const { data, totalItems, currentPage: resCurrentPage, totalPages: resTotalPages } = res.data;

      setBarangays(data || []);
      setTotalBarangays(totalItems || 0);
      setCurrentPage(resCurrentPage || page);
      setTotalPages(resTotalPages || 1);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [authToken, search, dateFrom, dateTo]);

  // -----------------------------
  // Debounce search/filter changes
  // -----------------------------
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchBarangays(1);
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, dateFrom, dateTo, fetchBarangays]);

  // -----------------------------
  // Add barangay
  // -----------------------------
  const addBarangay = async (values) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Barangay`,
        values,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (res.data.status === "success") {
        fetchBarangays(currentPage);
        return { success: true, data: res.data.data };
      } else {
        throw new Error(res.data.message || "Failed to add barangay");
      }
    } catch (error) {
      handleError(error);
      return { success: false, error: error.message };
    }
  };

  // -----------------------------
  // Delete barangay
  // -----------------------------
  const deleteBarangay = async (id) => {
    try {
      const res = await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Barangay/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.data.status === "success") {
        fetchBarangays(currentPage);
        return { success: true };
      } else {
        throw new Error(res.data.message || "Failed to delete barangay");
      }
    } catch (error) {
      handleError(error);
      return { success: false, error: error.message };
    }
  };

  // -----------------------------
  // Update barangay
  // -----------------------------
  const updateBarangay = async (id, values) => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Barangay/${id}`,
        values,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (res.data.status === "success") {
        fetchBarangays(currentPage);
        return { success: true, data: res.data.data };
      } else {
        throw new Error(res.data.message || "Failed to update barangay");
      }
    } catch (error) {
      handleError(error);
      return { success: false, error: error.message };
    }
  };

  // -----------------------------
  // Toggle active status
  // -----------------------------
  const toggleBarangayStatus = async (id) => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Barangay/toggle/${id}`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (res.data.status === "success") {
        fetchBarangays(currentPage);
        return { success: true, data: res.data.data };
      } else {
        throw new Error(res.data.message || "Failed to toggle status");
      }
    } catch (error) {
      handleError(error);
      return { success: false, error: error.message };
    }
  };

  // -----------------------------
  // Fetch single barangay
  // -----------------------------
  const getBarangay = async (id) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Barangay/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      return res.data.data;
    } catch (error) {
      handleError(error);
      return null;
    }
  };

  return (
    <BarangayDisplayContext.Provider
      value={{
        barangays,
        totalBarangays,
        currentPage,
        totalPages,
        loading,
        search,
        setSearch,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        fetchBarangays,
        addBarangay,
        deleteBarangay,
        updateBarangay,
        toggleBarangayStatus,
        getBarangay,
      }}
    >
      {children}

    </BarangayDisplayContext.Provider>
  );
};
