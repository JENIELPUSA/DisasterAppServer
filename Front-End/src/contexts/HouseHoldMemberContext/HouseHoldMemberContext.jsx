import { createContext, useState, useContext, useCallback } from "react";
import axios from "axios";
import Constants from "expo-constants";
import { AuthContext } from "../AuthContext";

export const HouseHoldMemberContext = createContext();

export const HouseHoldMemberProvider = ({ children }) => {
  const { authToken } = useContext(AuthContext);

  const [householdMembers, setHouseholdMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [customError, setCustomError] = useState("");

  const backendUrl = Constants.expoConfig.extra.apiUrl;

  const fetchHouseholdMembers = useCallback(
    async (filters = {}) => {
      if (!authToken) return;

      try {
        setLoading(true);

        const params = {};

        // search filter
        const searchQuery = filters.search ?? search;
        if (typeof searchQuery === "string" && searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        // barangay filter
        if (
          typeof filters.selectedBarangayId === "string" &&
          filters.selectedBarangayId.trim()
        ) {
          params.barangayId = filters.selectedBarangayId.trim();
        }
        if (
          typeof filters.householdLeadId === "string" &&
          filters.householdLeadId.trim()
        ) {
          params.householdLeadId = filters.householdLeadId.trim();
        }

        const res = await axios.get(`${backendUrl}/api/v1/HouseholdMember`, {
          params,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        setHouseholdMembers(res.data?.data || []);
      } catch (error) {
        console.error("Fetch Household Members Error:", error);
      } finally {
        setLoading(false);
      }
    },
    [authToken, backendUrl, search]
  );

  const updateHouseholdMemberStatus = useCallback(
    async (memberId, payload) => {
      if (!authToken) return;

      try {
        setLoading(true);
        setCustomError(null);

        const res = await axios.patch(
          `${backendUrl}/api/v1/HouseholdMember/${memberId}/status`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        return res.data;
      } catch (err) {
        console.error("Update Household Member Status Error:", err);
        setCustomError(
          err.response?.data?.message ||
            "Failed to update household member status"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [authToken, backendUrl]
  );

  const updateHouseholdMember = useCallback(
    async (memberId, payload) => {
      if (!authToken) return;
      try {
        setLoading(true);

        const res = await axios.patch(
          `${backendUrl}/api/v1/HouseholdMember/${memberId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (res.data.status === "success") {
          fetchHouseholdMembers();
        } else {
          return { success: false, error: "Unexpected response from server." };
        }
      } catch (error) {
        console.error("Update household member failed:", error.response?.data);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [authToken, backendUrl]
  );

  return (
    <HouseHoldMemberContext.Provider
      value={{
        householdMembers,
        loading,
        setLoading,
        search,
        setSearch,
        fetchHouseholdMembers,
        updateHouseholdMemberStatus,
        updateHouseholdMember,
      }}
    >
      {children}
    </HouseHoldMemberContext.Provider>
  );
};
