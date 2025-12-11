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
  const [isBarangaysDropdown, setBarangaysDropdown] = useState([])
  const backendUrl = Constants.expoConfig.extra.apiUrl; // Expo environment variable

  const handleError = (error) => {
    console.error(error);
    // optionally show a modal or toast here
  };



  const fetchBarangays = useCallback(
    async (search = "", page = 1) => {
      if (!authToken) return;

      try {
        setLoading(true);

        const searchText =
          typeof search === "string" ? search.trim() : "";

        const params = {};
        if (searchText.length > 0) params.search = searchText;
        if (page) params.page = page;

        const res = await axios.get(`${backendUrl}/api/v1/Barangay`, {
          params,
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Cache-Control": "no-cache",
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
    [authToken]
  );


 const BarangayDropdown = useCallback(
    async (search = "", page = 1) => {
      if (!authToken) return;

      try {
        setLoading(true);

        const searchText = typeof search === "string" ? search.trim() : "";
        const params = {};
        if (searchText.length > 0) params.search = searchText;
        if (page) params.page = page;
        params.limit = 10; // optional limit

        const res = await axios.get(`${backendUrl}/api/v1/Barangay/BarangayDropdown`, {
          params,
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Cache-Control": "no-cache",
          },
        });

        const { data, totalItems, currentPage: resCurrentPage, totalPages: resTotalPages } = res.data;

        setBarangaysDropdown(data || []);
        setTotalBarangays(totalItems || 0);
        setCurrentPage(resCurrentPage || page);
        setTotalPages(resTotalPages || 1);
      } catch (error) {
        console.error("Error fetching barangays:", error);
      } finally {
        setLoading(false);
      }
    },
    [authToken, backendUrl]
  );


  function safeTrim(value) {
    return typeof value === "string" ? value.trim() : "";
  }


  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchBarangays(1);
      BarangayDropdown();
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, dateFrom, dateTo, fetchBarangays,BarangayDropdown]);

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
        getBarangay, isBarangaysDropdown
      }}
    >
      {children}
    </BarangayDisplayContext.Provider>
  );
};
