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
import { io } from "socket.io-client";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { authToken, logout, user } = useContext(AuthContext);

  const [Notification, setNotification] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  const backendUrl = Constants.expoConfig.extra.apiUrl;

  // --- Handle errors centrally ---
  const handleError = (err) => {
    console.error(err);
    if (err.response?.status === 401) logout();
  };

  // --- Initialize socket connection ---
  useEffect(() => {
    const newSocket = io(backendUrl, {
      transports: ["websocket"],
    });
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [backendUrl]);

  // --- Listen for real-time Notification ---
  useEffect(() => {
    if (!socket) return;

    socket.on("notification:new", (notif) => {
      setNotification((prev) => [notif, ...prev]);
    });

    return () => {
      socket.off("notification:new");
    };
  }, [socket]);

  // --- Fetch Notification from backend ---
  const fetchNotification = useCallback(
    async (municipalityId = "") => {
      if (!authToken) return;

      try {
        setLoading(true);
        const params = {};
        if (municipalityId) params.municipalityId = municipalityId;

        const res = await axios.get(`${backendUrl}/api/v1/Notification`, {
          headers: { Authorization: `Bearer ${authToken}` },
          params,
        });

        setNotification(res.data.data || []);
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    },
    [authToken, backendUrl]
  );

  // --- Create a new notification ---
  const createNotification = useCallback(
    async (values) => {
      if (!authToken) return { success: false, error: "No auth" };

      try {
        const res = await axios.post(`${backendUrl}/api/v1/Notification`, values, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (res.data.data) {
          // Add locally immediately (optimistic update)
          setNotification((prev) => [res.data.data, ...prev]);
          return { success: true, data: res.data.data };
        }

        return { success: false, error: res.data.message };
      } catch (err) {
        handleError(err);
        return { success: false, error: err.response?.data?.message || err.message };
      }
    },
    [authToken, backendUrl]
  );

  // --- Delete notification ---
  const deleteNotification = useCallback(
    async (id) => {
      if (!authToken) return { success: false, error: "No auth" };

      try {
        const res = await axios.delete(`${backendUrl}/api/v1/Notification/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (res.data.success) {
          setNotification((prev) => prev.filter((n) => n._id !== id));
          return { success: true };
        }

        return { success: false, error: res.data.message };
      } catch (err) {
        handleError(err);
        return { success: false, error: err.response?.data?.message || err.message };
      }
    },
    [authToken, backendUrl]
  );

  // --- Clear all Notification locally ---
  const clearNotification = () => setNotification([]);

  return (
    <NotificationContext.Provider
      value={{
        Notification,
        loading,
        error,
        fetchNotification,
        createNotification,
        deleteNotification,
        clearNotification,
        socket,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
