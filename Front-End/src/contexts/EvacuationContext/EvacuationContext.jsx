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

  // ==============================
  // STATE
  // ==============================
  const [evacuations, setEvacuations] = useState([]);
  const [totalEvacuations, setTotalEvacuations] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // ✅ Added error state
  const [nearEvacuations, setNearEvacuations] = useState([]);

  const backendUrl = Constants.expoConfig.extra.apiUrl;

  // ==============================
  // CENTRALIZED ERROR HANDLER
  // ==============================
  const handleError = (err) => {
    const msg = err.response?.data?.message || err.message;
    console.log("❌ ERROR:", msg);
    setError(msg); // store in state
  };

  // ==============================
  // FETCH ALL EVACUATIONS
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
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    },
    [authToken, search, dateFrom, dateTo]
  );

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
      return { success: false, error: msg };
    }
  };

  // ==============================
  // FETCH NEARBY EVACUATIONS
  // ==============================
  const fetchNearbyEvacuations = async ({
    latitude,
    longitude,
    maxDistance = 1000,
  }) => {
    if (!authToken) return;
    if (!latitude || !longitude) {
      setError("Latitude and longitude are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(
        `${backendUrl}/api/v1/Evacuation/DisplayNearbyEvacuations`,
        { latitude, longitude, maxDistance },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (res.data.status === "success") {
        setNearEvacuations(res.data.data || []);
      } else {
        handleError(
          new Error(res.data.message || "Failed to fetch nearby evacuations")
        );
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchEvacuation(1);
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, dateFrom, dateTo, fetchEvacuation]);

  return (
    <EvacuationDisplayContext.Provider
      value={{
        evacuations,
        totalEvacuations,
        currentPage,
        totalPages,
        loading,
        error,
        search,
        setSearch,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        fetchEvacuation,
        fetchNearbyEvacuations,
        nearEvacuations,
        AddEvacuation,
      }}
    >
      {children}
    </EvacuationDisplayContext.Provider>
  );
};
