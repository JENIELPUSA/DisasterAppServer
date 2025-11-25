import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import axiosInstance from "../../ReusableFolder/axioxInstance";
import WarningLogoutModal from "../../ReusableFolder/WarningLogOutModal";
export const OrganizerDisplayContext = createContext();

export const OrganizerDisplayProvider = ({ children }) => {
    const { authToken, logout } = useContext(AuthContext);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [customError, setCustomError] = useState("");
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [isOrganizer, setOrganizer] = useState([]);
    const [isOrganizerProfile, setOrganizerProfile] = useState([]);
    const [isTotalOrganizer, setTotalOrganizer] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const limit = 5;
    const FetchOrganizerData = async (page = 1, limit, searchTerm = "", fromDate = "", toDate = "") => {
        if (!authToken) return;

        try {
            setIsLoading(true);

            const params = {
                page,
                limit,
            };

            if (searchTerm && searchTerm.trim() !== "") {
                params.search = searchTerm.trim();
            }

            if (fromDate && fromDate.trim() !== "") {
                params.dateFrom = fromDate.trim();
            }

            if (toDate && toDate.trim() !== "") {
                params.dateTo = toDate.trim();
            }

            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Organizer`, {
                params,
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Cache-Control": "no-cache",
                },
            });

            const { data, totalPages, currentPage, totalOrganizer } = res.data;

            setOrganizer(data || []);
            setTotalOrganizer(totalOrganizer || 0);
            setTotalPages(totalPages || 1);
            setCurrentPage(currentPage || page);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!authToken) return;
        FetchOrganizerData(1, search, dateFrom, dateTo);
    }, [authToken, search, dateFrom, dateTo]);

    const AddOrganizer = async (values) => {
        try {
            const formData = new FormData();
            formData.append("first_name", values.first_name || "");
            formData.append("last_name", values.last_name || "");
            formData.append("gender", values.gender || "");
            formData.append("email", values.email || "");
            formData.append("contact_number", values.contact_number || "");
            formData.append("role", "organizer");
            if (values.avatar) formData.append("avatar", values.avatar);
            if (values.middle_name) formData.append("middle_name", values.middle_name);

            const res = await axiosInstance.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/signup`, formData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.status === 201 && res.data.status === "success") {
                const newAdmin = res.data.data;
                return { success: true, data: newAdmin };
            } else {
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.error || error.message || "Something went wrong.";

            setCustomError(message);
            setModalStatus("failed");
            setShowModal(true);

            return { success: false, error: message };
        }
    };

    const DeleteOrganizer = async (officerID) => {
        try {
            const response = await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Organizer/${officerID}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                return { success: true, data: response.data.data };
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const UpdateOrganizer = async (dataID, values) => {
        try {
            const formData = new FormData();
            formData.append("first_name", values.first_name || "");
            formData.append("last_name", values.last_name || "");
            formData.append("gender", values.gender || "");
            formData.append("email", values.email || "");
            formData.append("contact_number", values.contact_number || "");
            formData.append("role", "organizer");
            if (values.avatar) formData.append("avatar", values.avatar);
            if (values.middle_name) formData.append("middle_name", values.middle_name);

            const response = await axios.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Organizer/${dataID}`, formData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data?.status === "success") {
                if (values.setting == "Yes") {
                    setShowLogoutModal(true);
                }

                return { success: true, data: response.data.data };
            } else {
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.error || error.message || "Something went wrong.";

            setCustomError(message);
            setModalStatus("failed");
            setShowModal(true);

            return { success: false, error: message };
        }
    };

    return (
        <OrganizerDisplayContext.Provider
            value={{
                isOrganizer,
                DeleteOrganizer,
                UpdateOrganizer,
                isTotalOrganizer,
                isOrganizerProfile,
                AddOrganizer,
                customError,
                isLoading,
                setIsLoading,
                totalPages,
                currentPage,
                setCurrentPage,
                FetchOrganizerData,
                limit,
                search,
                setSearch,
                dateFrom,
                setDateFrom,
                dateTo,
                setDateTo,
            }}
        >
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
                errorMessage={customError}
            />
            {/* Warning Logout Modal */}
            <WarningLogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onLogout={() => {
                    logout();
                }}
                message="Please log out your dashboard to complete your action."
            />
        </OrganizerDisplayContext.Provider>
    );
};
