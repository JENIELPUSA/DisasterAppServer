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

export const HouseholdContext = createContext();

export const HouseholdProvider = ({ children }) => {
  const { authToken, logout, user } = useContext(AuthContext);
  const [householdLeads, setHouseholdLeads] = useState([]);
  const [totalHouseholdLeads, setTotalHouseholdLeads] = useState(0);
  const [householdMembers, setHouseholdMembers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [barangayFilter, setBarangayFilter] = useState("");
  const [DropdowndataLead, setDropdownLead] = useState("");
  const backendUrl = Constants.expoConfig.extra.apiUrl;

  const handleError = (error) => {
    console.error(error);
    if (error.response?.status === 401) logout();
  };

  // Fetch household leads for dropdown (public)
  const fetchHouseholdLeadsForDropdown = useCallback(
    async (barangay = "") => {
      try {
        const params = {};
        if (barangay) params.barangay = barangay;

        const res = await axios.get(
          `${backendUrl}/api/v1/HouseholdLead/DropdownAllHouseHold`,
          { params }
        );
        return res.data.data || [];
      } catch (error) {
        handleError(error);
        return [];
      }
    },
    [backendUrl]
  );

const fetchHouseholdLeads = useCallback(
  async (filters = {}) => {
    if (!authToken) return;

    try {
      setLoading(true);

      const params = {};

      // Only include search if not empty
      const searchQuery = filters.search ?? search;
      if (searchQuery && searchQuery.trim() !== "") {
        params.search = searchQuery.trim();
      }

      // Only include barangayId if provided
      const barangayId = filters.selectedBarangayId;
      if (barangayId && barangayId.trim() !== "") {
        params.barangayId = barangayId.trim();
      }

      const res = await axios.get(`${backendUrl}/api/v1/HouseholdLead`, {
        params,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const { data = [], totalItems = 0, currentPage = 1, totalPages = 1 } = res.data;

      setHouseholdLeads(data);
      setTotalHouseholdLeads(totalItems);
      setCurrentPage(currentPage);
      setTotalPages(totalPages);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  },
  [authToken, backendUrl, search]
);

  // Create household lead profile
  const createHouseholdLeadProfile = async (values) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/household-lead/profile`,
        values,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (res.data.success) {
        return { success: true, data: res.data.data };
      }
      return { success: false, error: res.data.message };
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  };

  // Update household lead profile
  const updateHouseholdLeadProfile = async (values) => {
    try {
      const res = await axios.patch(
        `${backendUrl}/api/household-lead/profile`,
        values,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (res.data.success) {
        return { success: true, data: res.data.data };
      }
      return { success: false, error: res.data.message };
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  };

 
  // Get household member profile (current user)
  const getHouseholdMemberProfile = useCallback(async () => {
    if (!authToken || user?.role !== "household_member") return null;

    try {
      const res = await axios.get(
        `${backendUrl}/api/household-member/profile`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      return res.data.data;
    } catch (error) {
      handleError(error);
      return null;
    }
  }, [authToken, backendUrl, user]);

  // Create household member profile
  const createHouseholdMemberProfile = async (values) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/household-member/profile`,
        values,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (res.data.success) {
        return { success: true, data: res.data.data };
      }
      return { success: false, error: res.data.message };
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  };

  // Verify household member
  const verifyHouseholdMember = async (memberId, verificationCode) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/household-member/verify`,
        {
          memberId,
          verificationCode,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (res.data.success) {
        fetchHouseholdMembers();
        return { success: true, data: res.data.data };
      }
      return { success: false, error: res.data.message };
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  };

  // Remove household member
  const removeHouseholdMember = async (memberId) => {
    try {
      const res = await axios.delete(
        `${backendUrl}/api/household-member/${memberId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (res.data.success) {
        fetchHouseholdMembers();
        return { success: true };
      }
      return { success: false, error: res.data.message };
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  };

  // Get household statistics
  const getHouseholdStatistics = useCallback(async () => {
    if (!authToken) return null;

    try {
      const res = await axios.get(`${backendUrl}/api/household/statistics`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      return res.data.data;
    } catch (error) {
      handleError(error);
      return null;
    }
  }, [authToken, backendUrl]);

  const fetchDropdownAllLead = useCallback(
    async (barangayId) => {
      if (!barangayId) return; // Require barangay ID
      try {
        setLoading(true);

        const res = await axios.get(
          `${backendUrl}/api/v1/HouseholdLead/DropdownAllHouseHold`,
          {
            params: { barangay: barangayId },
          }
        );

        setDropdownLead(res.data.data || []);
      } catch (error) {
        console.error("Fetch household leads error:", error);
      } finally {
        setLoading(false);
      }
    },
    [backendUrl]
  );
  useEffect(() => {
    const loadData = async () => {
      try {
        await getHouseholdMemberProfile();
        await fetchHouseholdLeadsForDropdown();
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []); // Empty dependency array, tatakbo lang once on mount

  return (
    <HouseholdContext.Provider
      value={{
        householdLeads,
        totalHouseholdLeads,
        householdMembers,
        currentPage,
        totalPages,
        loading,
        search,
        setSearch,
        barangayFilter,
        setBarangayFilter,
        fetchHouseholdLeadsForDropdown,
        fetchHouseholdLeads,
        createHouseholdLeadProfile,
        updateHouseholdLeadProfile,
        getHouseholdMemberProfile,
        createHouseholdMemberProfile,
        verifyHouseholdMember,
        removeHouseholdMember,
        getHouseholdStatistics,
        DropdowndataLead,
        fetchDropdownAllLead,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
};
