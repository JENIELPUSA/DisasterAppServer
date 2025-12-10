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
  const backendUrl = Constants.expoConfig.extra.apiUrl;

  const handleError = (error) => {
    console.error(error);
    if (error.response?.status === 401) logout();
  };

  // Fetch household leads for dropdown (public)
  const fetchHouseholdLeadsForDropdown = useCallback(async (barangay = "") => {
    try {
      const params = {};
      if (barangay) params.barangay = barangay;

      const res = await axios.get(`${backendUrl}/api/household-leads/dropdown`, { params });
      return res.data.data || [];
    } catch (error) {
      handleError(error);
      return [];
    }
  }, [backendUrl]);

  // Fetch household leads (admin/brgy captain)
  const fetchHouseholdLeads = useCallback(async (page = 1, filters = {}) => {
    if (!authToken) return;

    try {
      setLoading(true);
      const params = { 
        page, 
        search: search || filters.search,
        barangay: barangayFilter || filters.barangay || (user?.role === 'brgy_captain' ? user?.barangay : '')
      };

      const res = await axios.get(`${backendUrl}/api/household-leads`, {
        params,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const { data, totalItems, currentPage: resPage, totalPages: resTotalPages } = res.data;

      setHouseholdLeads(data || []);
      setTotalHouseholdLeads(totalItems || 0);
      setCurrentPage(resPage || page);
      setTotalPages(resTotalPages || 1);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [authToken, backendUrl, search, barangayFilter, user]);

  // Get household lead profile (current user)
  const getHouseholdLeadProfile = useCallback(async () => {
    if (!authToken || user?.role !== 'household_lead') return null;

    try {
      const res = await axios.get(`${backendUrl}/api/household-lead/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      return res.data.data;
    } catch (error) {
      handleError(error);
      return null;
    }
  }, [authToken, backendUrl, user]);

  // Create household lead profile
  const createHouseholdLeadProfile = async (values) => {
    try {
      const res = await axios.post(`${backendUrl}/api/household-lead/profile`, values, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.data.success) {
        return { success: true, data: res.data.data };
      }
      return { success: false, error: res.data.message };
    } catch (error) {
      handleError(error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  // Update household lead profile
  const updateHouseholdLeadProfile = async (values) => {
    try {
      const res = await axios.patch(`${backendUrl}/api/household-lead/profile`, values, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.data.success) {
        return { success: true, data: res.data.data };
      }
      return { success: false, error: res.data.message };
    } catch (error) {
      handleError(error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  // Get household members
  const fetchHouseholdMembers = useCallback(async (householdLeadId = null) => {
    if (!authToken) return;

    try {
      const id = householdLeadId || user?.linkedId;
      if (!id) return;

      const res = await axios.get(`${backendUrl}/api/household-members/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setHouseholdMembers(res.data.data?.members || []);
      return res.data.data;
    } catch (error) {
      handleError(error);
      return null;
    }
  }, [authToken, backendUrl, user]);

  // Get household member profile (current user)
  const getHouseholdMemberProfile = useCallback(async () => {
    if (!authToken || user?.role !== 'household_member') return null;

    try {
      const res = await axios.get(`${backendUrl}/api/household-member/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      return res.data.data;
    } catch (error) {
      handleError(error);
      return null;
    }
  }, [authToken, backendUrl, user]);

  // Create household member profile
  const createHouseholdMemberProfile = async (values) => {
    try {
      const res = await axios.post(`${backendUrl}/api/household-member/profile`, values, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.data.success) {
        return { success: true, data: res.data.data };
      }
      return { success: false, error: res.data.message };
    } catch (error) {
      handleError(error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  // Verify household member
  const verifyHouseholdMember = async (memberId, verificationCode) => {
    try {
      const res = await axios.post(`${backendUrl}/api/household-member/verify`, {
        memberId,
        verificationCode
      }, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.data.success) {
        fetchHouseholdMembers();
        return { success: true, data: res.data.data };
      }
      return { success: false, error: res.data.message };
    } catch (error) {
      handleError(error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  // Remove household member
  const removeHouseholdMember = async (memberId) => {
    try {
      const res = await axios.delete(`${backendUrl}/api/household-member/${memberId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.data.success) {
        fetchHouseholdMembers();
        return { success: true };
      }
      return { success: false, error: res.data.message };
    } catch (error) {
      handleError(error);
      return { success: false, error: error.response?.data?.message || error.message };
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

  useEffect(() => {
    if (authToken) {
      if (user?.role === 'household_lead') {
        fetchHouseholdMembers();
        getHouseholdLeadProfile();
      } else if (user?.role === 'household_member') {
        getHouseholdMemberProfile();
      } else if (user?.role === 'brgy_captain' || user?.role === 'admin') {
        fetchHouseholdLeads(1);
      }
    }
  }, [authToken, user]);

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
        getHouseholdLeadProfile,
        createHouseholdLeadProfile,
        updateHouseholdLeadProfile,
        fetchHouseholdMembers,
        getHouseholdMemberProfile,
        createHouseholdMemberProfile,
        verifyHouseholdMember,
        removeHouseholdMember,
        getHouseholdStatistics,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
};