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

export const IncidentReportContext = createContext();

export const IncidentReportProvider = ({ children }) => {
  const { authToken } = useContext(AuthContext);
  const backendUrl = Constants.expoConfig.extra.apiUrl;

  const [reports, setReports] = useState([]);
  const [totalReports, setTotalReports] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportTypeFilter, setReportTypeFilter] = useState(""); // "flood" or "landslide"

  // Centralized error handler
  const handleError = (error) => {
    const message = error.response?.data?.message || error.message;
    console.error("API Error:", message);
  };

  // FETCH Reports with pagination and type filtering
  const fetchReports = useCallback(
    async (searchText = "", page = 1, type = "") => {
      if (!authToken) return;
      try {
        setLoading(true);
        const params = {
          page,
          limit: 10,
          status: "pending", // Default view for citizens
        };
        if (searchText) params.search = searchText;
        if (type) params.type = type;

        // Path matches the new generic route
        const res = await axios.get(`${backendUrl}/api/v1/IncidentReport`, {
          params,
          headers: { Authorization: `Bearer ${authToken}` },
        });

        // Mapping base sa iyong controller response
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
    [authToken, backendUrl]
  );

  const addIncidentReport = async (formData) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/v1/IncidentReport`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
          // Pinipigilan ang axios na i-convert ang FormData sa JSON string
          transformRequest: (data) => data,
        }
      );

      if (res.data.status === "success" || res.data.success) {
        return { success: true };
      }
      return { success: false, error: res.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  };

  // DELETE a report
  const deleteIncidentReport = async (id) => {
    try {
      const res = await axios.delete(
        `${backendUrl}/api/v1/IncidentReport/${id}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (res.data.status === "success") {
        fetchReports(search, currentPage, reportTypeFilter);
        return { success: true };
      }
      return { success: false, error: res.data.message };
    } catch (error) {
      handleError(error);
      return { success: false, error: error.message };
    }
  };

  // Auto-fetch reports when search, page, or type filter changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchReports(search, currentPage, reportTypeFilter);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, currentPage, reportTypeFilter, fetchReports]);

  return (
    <IncidentReportContext.Provider
      value={{
        reports,
        totalReports,
        currentPage,
        totalPages,
        loading,
        search,
        reportTypeFilter,
        setSearch,
        setCurrentPage,
        setReportTypeFilter,
        fetchReports,
        addIncidentReport,
        deleteIncidentReport,
      }}
    >
      {children}
    </IncidentReportContext.Provider>
  );
};
