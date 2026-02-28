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
  const [dropdownhousehold, setdropdownhousehold] = useState();
  const [isBarangaysDropdown, setBarangaysDropdown] = useState([]);
  const backendUrl = Constants.expoConfig.extra.apiUrl;
  const [SpecificMunicipalitiesBarangay, setSpecificMunicipalities] = useState(
    []
  );

  // Centralized error handler
  const handleError = (error) => {
    console.error(error);
    // optionally show a modal or toast here
  };

  const fetchBarangays = useCallback(
    async (search = "", page = 1) => {
      if (!authToken) return;
      try {
        setLoading(true);
        const searchText = typeof search === "string" ? search.trim() : "";
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

  const displayBarangaysForUser = useCallback(
    async (search = "", page = 1, MunicipalityId) => {
      if (!authToken) return;

      try {
        setLoading(true);

        const searchText = typeof search === "string" ? search.trim() : "";
        const params = {};

        if (searchText.length > 0) params.search = searchText;
        if (page) params.page = page;
        if (MunicipalityId) params.MunicipalityId = MunicipalityId;

        const res = await axios.get(
          `${backendUrl}/api/v1/Barangay/displayBarangaysForUser`,
          {
            params,
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Cache-Control": "no-cache",
            },
          }
        );

        const {
          data,
          totalItems,
          currentPage: resCurrentPage,
          totalPages: resTotalPages,
        } = res.data;

        setSpecificMunicipalities(data || []);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    },
    [authToken]
  );

  const displayDropdownInMaps = useCallback(
    async (search = "", page = "") => {
      if (!authToken) return;

      try {
        setLoading(true);

        const params = new URLSearchParams();

        const searchText = typeof search === "string" ? search.trim() : "";
        const pageText =
          typeof page === "string" ? page.trim() : page.toString().trim();

        if (searchText.length > 0) params.append("search", searchText);
        if (pageText.length > 0) params.append("page", pageText);

        const queryString = params.toString();

        const url = `${backendUrl}/api/v1/Barangay/dropdownbarangayformaps${
          queryString ? `?${queryString}` : ""
        }`;

        const res = await axios.get(url, {
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

        setdropdownhousehold(data || []);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    },
    [authToken]
  );

  const fetchBarangayDropdown = useCallback(
    async (search = "", page = 1) => {
      if (!authToken) return;
      try {
        setLoading(true);
        const searchText = typeof search === "string" ? search.trim() : "";
        const params = {};
        if (searchText.length > 0) params.search = searchText;
        if (page) params.page = page;
        params.limit = 10;

        const res = await axios.get(
          `${backendUrl}/api/v1/Barangay/BarangayDropdown`,
          {
            params,
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Cache-Control": "no-cache",
            },
          }
        );

        const {
          data,
          totalItems,
          currentPage: resCurrentPage,
          totalPages: resTotalPages,
        } = res.data;

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

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchBarangays(1);
      fetchBarangayDropdown();
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, dateFrom, dateTo, fetchBarangays, fetchBarangayDropdown]);

  // Add / Delete / Update / Toggle / Get functions
  const addBarangay = async (values) => {
    try {
      const res = await axios.post(`${backendUrl}/api/v1/Barangay`, values, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.data?.status === "success") {
        return { success: true };
      } else {
        // Kunin ang message mula sa server response kung meron
        const message =
          res.data?.message ||
          res.data?.error ||
          "Unexpected response from server.";

        setCustomError(message);
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: message };
      }
    } catch (error) {
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

      if (res.data?.status === "success") {
        return { success: true, data: res.data.data };
      } else {
        // Kunin ang message mula sa server response kung meron
        const message =
          res.data?.message ||
          res.data?.error ||
          "Unexpected response from server.";

        setCustomError(message);
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: message };
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

      if (res.data?.status === "success") {
        return { success: true };
      } else {
        // Kunin ang message mula sa server response kung meron
        const message =
          res.data?.message ||
          res.data?.error ||
          "Unexpected response from server.";

        setCustomError(message);
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: message };
      }
    } catch (error) {
      handleError(error);
      return { success: false, error: error.message };
    }
  };

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
        getBarangay,
        isBarangaysDropdown,
        SpecificMunicipalitiesBarangay,
        displayBarangaysForUser,
        dropdownhousehold,
        displayDropdownInMaps,
      }}
    >
      {children}
    </BarangayDisplayContext.Provider>
  );
};
