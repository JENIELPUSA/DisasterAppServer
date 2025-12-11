import React, { createContext, useState, useEffect, useContext,useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import axiosInstance from "../../ReusableFolder/axioxInstance";
export const LogsDisplayContext = createContext();

export const LogsDisplayProvider = ({ children }) => {
    const [isLogs, setLogs] = useState([]);
    const { authToken } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isTotalPages, setTotalPages] = useState();
    const [isTotalLogs, setTotalLogs] = useState();
    useEffect(() => {
        if (!authToken) {
            console.log("NO token");
            setLogs([]);
            setLoading(false);
            return;
        }

        fetchLogsData();
    }, [authToken]);


const fetchLogsData = useCallback(
  async (queryParams = {}) => {
    if (!authToken) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/LogsAudit`,
        {
          withCredentials: true,
          params: queryParams,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      let fetchedData = res?.data?.data;
      if (fetchedData && !Array.isArray(fetchedData)) {
        fetchedData = [fetchedData];
      } else if (!fetchedData) {
        fetchedData = [];
      }

      setLogs(fetchedData);
      setTotalPages(res?.data.totalPages);
      setCurrentPage(res?.data.currentPage);
      setTotalLogs(res?.data.totalLogs);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  },
  [authToken] 
);

    return (
        <LogsDisplayContext.Provider value={{ isLogs, isTotalPages, currentPage,setCurrentPage, isTotalLogs, loading, fetchLogsData }}>
            {children}
        </LogsDisplayContext.Provider>
    );
};