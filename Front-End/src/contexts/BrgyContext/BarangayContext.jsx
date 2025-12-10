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
  const backendUrl = Constants.expoConfig.extra.apiUrl; // Expo environment variable

  // -----------------------------
  // Centralized error handler
  // -----------------------------
  const handleError = (error) => {
    console.error(error);
    // optionally show a modal or toast here
  };

  // -----------------------------
  // Fetch barangays with filters
  // -----------------------------
  const fetchBarangays = useCallback(
    async (search = "", page = 1) => {
      if (!authToken) return;

      try {
        setLoading(true);

       const searchText = (search ?? "").toString().trim();


        const params = {};
        if (searchText) params.search = searchText;
        if (page) params.page = page;

        const res = await axios.get(`${backendUrl}/api/v1/Barangay`, {
          params,
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Cache-Control": "no-cache", // prevent 304
          },
        });

        const {
          data,
          totalItems,
          currentPage: resCurrentPage,
          totalPages: resTotalPages,
        } = res.data;

        setBarangays(data || []);
        setTotalBarangays(totalItems || 0);
        setCurrentPage(resCurrentPage || page);
        setTotalPages(resTotalPages || 1);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    },
    [authToken] // only depend on authToken
  );

  // -----------------------------
  // Debounce search/filter changes
  // -----------------------------
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchBarangays(1);
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, dateFrom, dateTo, fetchBarangays]);

  const addBarangay = async (values) => {
    try {
      const res = await axios.post(`${backendUrl}/api/v1/Barangay`, values, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.data.status === "success") {
        fetchBarangays(currentPage); // refresh list
        return { success: true, data: res.data.data };
      } else {
        return {
          success: false,
          error: res.data.message || "Failed to add barangay",
        };
      }
    } catch (error) {
      // Axios error handling
      const serverMessage = error.response?.data?.message;
      const statusCode = error.response?.status;

      console.error("Axios Error:", statusCode, serverMessage || error.message);

      return {
        success: false,
        error: serverMessage || error.message || "Something went wrong",
      };
    }
  };

  // -----------------------------
  // Delete barangay
  // -----------------------------
  const deleteBarangay = async (id) => {
    try {
      const res = await axios.delete(`${backendUrl}/api/v1/Barangay/${id}`, {
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
        `${backendUrl}/api/v1/Barangay/${id}`,
        values,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
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
        `${backendUrl}/api/v1/Barangay/toggle/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
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
      const res = await axios.get(`${backendUrl}/api/v1/Barangay/${id}`, {
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
