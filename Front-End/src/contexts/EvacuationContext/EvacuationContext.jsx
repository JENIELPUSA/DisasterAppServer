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

export const EvacuationDisplayContext = createContext();

export const EvacuationDisplayProvider = ({ children }) => {
  const { authToken } = useContext(AuthContext);

  // STATE
  const [evacuations, setEvacuations] = useState([]);
  const [totalEvacuations, setTotalEvacuations] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);

  const backendUrl = Constants.expoConfig.extra.apiUrl;

  // ==============================
  // CENTRALIZED ERROR HANDLER
  // ==============================
  const handleError = (error) => {
    const msg = error.response?.data?.message || error.message;
    console.log("❌ ERROR:", msg);
  };

  // ==============================
  // FETCH EVACUATIONS
  // ==============================
  const fetchEvacuation = useCallback(
    async (page = 1) => {
      if (!authToken) return;

      try {
        setLoading(true);

        const params = { page };
        if (search.trim()) params.search = search.trim();
        if (dateFrom.trim()) params.dateFrom = dateFrom.trim();
        if (dateTo.trim()) params.dateTo = dateTo.trim();

        const res = await axios.get(`${backendUrl}/api/v1/Evacuation`, {
          params,
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const {
          data,
          totalItems,
          currentPage: responsePage,
          totalPages: responseTotalPages,
        } = res.data;

        setEvacuations(data || []);
        setTotalEvacuations(totalItems || 0);
        setCurrentPage(responsePage || page);
        setTotalPages(responseTotalPages || 1);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    },
    [authToken, search, dateFrom, dateTo]
  );

  // ==============================
  // TRIGGER FETCH ON FILTERS
  // ==============================
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchEvacuation(1);
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, dateFrom, dateTo, fetchEvacuation]);

  // ==============================
  // ADD EVACUATION
  // ==============================
  const AddEvacuation = async (values) => {
    try {
      const res = await axios.post(`${backendUrl}/api/v1/Evacuation`, values, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.data.status === "success") {
        fetchEvacuation(currentPage);
        return { success: true, data: res.data.data };
      }

      return {
        success: false,
        error: res.data.message || "Failed to add evacuation center",
      };
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      console.log("POST ERROR:", msg);

      return { success: false, error: msg };
    }
  };

  // ==============================
  // DELETE EVACUATION
  // ==============================
  const deleteEvacuation = async (id) => {
    try {
      const res = await axios.delete(`${backendUrl}/api/v1/Evacuation/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.data.status === "success") {
        fetchEvacuation(currentPage);
        return { success: true };
      }

      throw new Error(res.data.message || "Failed to delete evacuation");
    } catch (error) {
      handleError(error);
      return { success: false, error: error.message };
    }
  };

  // ==============================
  // UPDATE EVACUATION
  // ==============================
  const updateEvacuation = async (id, values) => {
    try {
      const res = await axios.patch(
        `${backendUrl}/api/v1/Evacuation/${id}`,
        values,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (res.data.status === "success") {
        fetchEvacuation(currentPage);
        return { success: true, data: res.data.data };
      }

      throw new Error(res.data.message || "Failed to update evacuation");
    } catch (error) {
      handleError(error);
      return { success: false, error: error.message };
    }
  };

  // ==============================
  // TOGGLE EVACUATION STATUS
  // ==============================
  const toggleEvacuationStatus = async (id) => {
    try {
      const res = await axios.patch(
        `${backendUrl}/api/v1/Evacuation/toggle/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (res.data.status === "success") {
        fetchEvacuation(currentPage);
        return { success: true, data: res.data.data };
      }

      throw new Error(res.data.message || "Failed to toggle status");
    } catch (error) {
      handleError(error);
      return { success: false, error: error.message };
    }
  };

  // ==============================
  // GET SINGLE EVACUATION
  // ==============================
  const getEvacuation = async (id) => {
    try {
      const res = await axios.get(`${backendUrl}/api/v1/Evacuation/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      return res.data.data;
    } catch (error) {
      handleError(error);
      return null;
    }
  };

  // ==============================
  // EXPORT CONTEXT VALUES
  // ==============================
  return (
    <EvacuationDisplayContext.Provider
      value={{
        evacuations,
        totalEvacuations,
        currentPage,
        totalPages,
        loading,
        search,
        setSearch,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        fetchEvacuation,
        AddEvacuation,
        deleteEvacuation,
        updateEvacuation,
        toggleEvacuationStatus,
        getEvacuation,
      }}
    >
      {children}
    </EvacuationDisplayContext.Provider>
  );
};
