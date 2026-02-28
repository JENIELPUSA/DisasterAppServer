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

export const NasirangBahayContext = createContext();

export const NasirangBahayProvider = ({ children }) => {
  const { authToken } = useContext(AuthContext);
  const backendUrl = Constants.expoConfig.extra.apiUrl;
  const [Uploadreports, setUploadReports] = useState([]);
  const [reports, setReports] = useState([]);
  const [totalReports, setTotalReports] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [severityFilter, setSeverityFilter] = useState(""); // low, medium, high
  const [TyphoneName, setTyphoneName] = useState([]);
  const [AllNasirangBahay, setAllNasirangBahay] = useState([]);
  const [error, setError] = useState(null);

  const [allTyphoons, setAllTyphoons] = useState([]);
  const [allMunicipalities, setAllMunicipalities] = useState([]);
  const [allBarangays, setAllBarangays] = useState([]);
  // Centralized error handler
  const handleError = (error) => {
    const message = error.response?.data?.message || error.message;
    console.error("Nasirang Bahay API Error:", message);
  };

  // --- FETCH REPORTS ---
  const fetchNasirangBahayReports = useCallback(
    async (searchText = "", page = 1, severity = "") => {
      if (!authToken) return;
      try {
        setLoading(true);
        const params = {
          page,
          limit: 10,
        };
        if (searchText) params.search = searchText;
        if (severity) params.severity = severity;

        const res = await axios.get(
          `${backendUrl}/api/v1/NasirangBahayReport`,
          {
            params,
            headers: { Authorization: `Bearer ${authToken}` },
          },
        );

        const { data, pagination } = res.data;

        setReports(data || []);
        setTotalReports(pagination?.totalItems || 0);
        setCurrentPage(pagination?.currentPage || page);
        setTotalPages(pagination?.totalPages || 1);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    },
    [authToken, backendUrl],
  );
const DisplayAllNasirangBahay = useCallback(
  async ({
    searchText = "",
    page = 1,
    severity = "",
    typhoonFilter = "",
    municipalityFilter = "",
    barangayFilter = "",
  } = {}) => {

    if (!authToken) return;

    try {
      setLoading(true);

      const params = {
        page,
        limit: 10,
      };

      if (searchText?.trim()) params.search = searchText;
      if (severity?.trim()) params.severity = severity;
      if (typhoonFilter?.trim()) params.typhoon = typhoonFilter;
      if (municipalityFilter?.trim()) params.municipality = municipalityFilter;
      if (barangayFilter?.trim()) params.barangay = barangayFilter;

      console.log("Final Params:", params);

      const res = await axios.get(
        `${backendUrl}/api/v1/NasirangBahayReport/DisplayAllNasirangBahay`,
        {
          params,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const responseData = res.data;

      setAllNasirangBahay(responseData.data || []);
      setTotalReports(responseData.total || 0);
      setAllTyphoons(responseData.typhoons || []);
      setAllMunicipalities(responseData.municipalities || []);
      setAllBarangays(responseData.barangays || []);
      setCurrentPage(page);
      setTotalPages(Math.ceil((responseData.total || 0) / 10));

    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  },
  [authToken, backendUrl]
);

  const fetchTyphoneName = useCallback(async () => {
    if (!authToken) return;
    try {
      setLoading(true);

      // Tinanggal ang params object at ang pagination destructuring
      const res = await axios.get(
        `${backendUrl}/api/v1/NasirangBahayReport/getTyphoneName`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );

      // Base sa iyong data: { success: true, count: 2, data: [...] }
      if (res.data && res.data.success) {
        // I-set ang buong response object para makuha ng Modal ang .data array
        setTyphoneName(res.data);
      }
    } catch (error) {
      // Mas detalyadong error logging para makita kung saan nagmula ang "Property doesn't exist"
      console.log("API Error Details:", error.response?.data || error.message);
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [authToken, backendUrl]); // Tinanggal na rin ang 'page' sa dependencies

  // --- ADD / CREATE REPORT ---
  const addNasirangBahayReport = async (formData) => {
    console.log("formData", formData);
    try {
      setLoading(true);
      const res = await axios.post(
        `${backendUrl}/api/v1/NasirangBahayReport`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
          transformRequest: (data) => data, // Essential for FormData
        },
      );

      if (res.data.success) {
        return { success: true };
      }
      return { success: false, error: res.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATE REPORT (e.g., Adding "After" Photos later) ---
  const updateNasirangBahayReport = async (id, formData) => {
    try {
      const res = await axios.patch(
        `${backendUrl}/api/v1/NasirangBahayReport/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
          transformRequest: (data) => data,
        },
      );
      if (res.data.success) {
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      handleError(error);
      return { success: false, error: error.message };
    }
  };

  // --- DELETE REPORT ---
  const deleteNasirangBahayReport = async (id) => {
    try {
      const res = await axios.delete(
        `${backendUrl}/api/v1/NasirangBahayReport/${id}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );
      if (res.data.success) {
        fetchNasirangBahayReports(search, currentPage, severityFilter);
        return { success: true };
      }
      return { success: false, error: res.data.message };
    } catch (error) {
      handleError(error);
      return { success: false, error: error.message };
    }
  };

  const sendAfterReport = async (id, formData) => {
    try {
      setLoading(true);

      // DITO ANG PAGBABAGO:
      // Ipadala ang formData nang direkta bilang body ng request.
      const res = await axios.patch(
        `${backendUrl}/api/v1/NasirangBahayReport/SendAfterReport/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            // Hayaan ang Axios na mag-set ng Content-Type at Boundary nang kusa.
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (res.data.success) {
        return { success: true };
      }
      return { success: false, error: res.data.message };
    } catch (error) {
      console.error("API Call Error:", error.response?.data || error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchMyUploads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `${backendUrl}/api/v1/NasirangBahayReport/getSpecificUserUploads`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch reports");
      }

      setUploadReports(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);
  // Debounced Effect for Search and Filters
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchNasirangBahayReports(search, currentPage, severityFilter);
      fetchTyphoneName();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, currentPage, severityFilter, fetchNasirangBahayReports]);

  return (
    <NasirangBahayContext.Provider
      value={{
        reports,
        totalReports,
        currentPage,
        totalPages,
        loading,
        search,
        severityFilter,
        setSearch,
        setCurrentPage,
        setSeverityFilter,
        fetchNasirangBahayReports,
        addNasirangBahayReport,
        updateNasirangBahayReport,
        deleteNasirangBahayReport,
        fetchTyphoneName,
        TyphoneName,
        sendAfterReport,
        Uploadreports,
        fetchMyUploads,
        setLoading,
        loading,
        AllNasirangBahay,
        DisplayAllNasirangBahay,
        allTyphoons,
        allMunicipalities,
        allBarangays,
      }}
    >
      {children}
    </NasirangBahayContext.Provider>
  );
};
