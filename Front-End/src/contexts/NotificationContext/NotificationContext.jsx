import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import axiosInstance from "../../ReusableFolder/axioxInstance";
export const NotificationDisplayContext = createContext();

export const NotificationDisplayProvider = ({ children }) => {
    const { authToken, linkId } = useAuth();
    const [notify, setNotify] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isunread, setunread] = useState(0);
    const fetchNotifications = async (showAllFlag = false) => {
        if (!linkId || !authToken) return;

        setLoading(true);
        try {
            const queryParams = showAllFlag ? `?limit=all` : ``;
            const res = await axiosInstance.get(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Notification/getByLink/${linkId}${queryParams}`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                },
            );

            setunread(res.data.unreadCount);


            console.log("Notification data",res.data.data)
            setNotify(res.data.data);
            setShowAll(showAllFlag);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [linkId, authToken]);

    const markNotificationAsRead = async (notifId) => {
        if (!authToken) return console.error("Auth token is missing");
        if (!linkId) return console.error("Link ID is missing");
        if (!notifId) return console.error("Notification ID is missing");

        try {
            await axiosInstance.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Notification/${notifId}/mark-read`,
                { linkId },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                },
            );

            setNotify((prev) =>
                prev.map((n) => {
                    if (n._id === notifId) {
                        // I-update lang yung viewer na tumutugma sa linkId
                        const updatedViewers = n.viewers.map((v) => (v.user === linkId ? { ...v, isRead: true } : v));
                        return { ...n, viewers: updatedViewers };
                    }
                    return n;
                }),
            );
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    return (
        <NotificationDisplayContext.Provider
            value={{
                notify,
                isunread,
                setNotify,
                markNotificationAsRead,
                fetchNotifications,
                showAll,
                loading,
            }}
        >
            {children}
        </NotificationDisplayContext.Provider>
    );
};

export const useNotificationDisplay = () => useContext(NotificationDisplayContext);
