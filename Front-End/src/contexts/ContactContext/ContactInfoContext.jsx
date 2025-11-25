import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";

export const ContactContext = createContext();

export const ContactDisplayProvider = ({ children }) => {
    const { authToken } = useContext(AuthContext);

    const [contacts, setContacts] = useState([]); // renamed from isContact → clearer name
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [customError, setCustomError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [FontColor, setFontColor] = useState("");
    const [bgtheme, setBgTheme] = useState(""); // added missing variable
    const [displayContact, setDisplayContact] = useState(null);

    useEffect(() => {
        fetchDisplayContact();
    }, []);

    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => setCustomError(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [customError]);

    const AddContact = async (formData) => {
        if (!authToken) return;

        // 🔹 Basic validation
        if (!formData.officeName?.trim()) throw new Error("Please provide office name.");
        if (!formData.city?.trim()) throw new Error("Please provide city.");
        if (!formData.emails || formData.emails.length === 0 || !formData.emails.some((email) => email.trim() !== "")) {
            throw new Error("Please provide at least one email address.");
        }

        setIsLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/ContactInfo`, formData, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                withCredentials: true,
            });

            // ✅ Simplified response handling
            if (res.data.success === "success") {
                setContacts((prev) => [...prev, res.data.data]);
                setModalStatus("success");
                setShowModal(true);
                console.log("✅ Contact information added successfully.");
                return { success: true };
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.error || error.message || "Something went wrong.";

            setModalStatus("failed");
            setShowModal(true);
            setCustomError(message);
            console.error("❌ AddContact error:", message);

            return { success: false, error: message };
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDisplayContact = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/ContactInfo`, {
                withCredentials: true,
            });

            if (res.data.success) {
                setDisplayContact(res.data.data); // Set single contact for display
            } else {
                throw new Error(res.data.message || "Failed to fetch contact info.");
            }
        } catch (error) {
            const message =
                error.response?.data?.message || error.response?.data?.error || error.message || "Something went wrong while fetching contact info.";

            setCustomError(message);
            console.error("fetchDisplayContact error:", message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ContactContext.Provider
            value={{
                contacts,
                AddContact,
                profile,
                FontColor,
                bgtheme,
                isLoading,
                customError,
                totalPages,
                currentPage,
                setCurrentPage,
                displayContact,
            }}
        >
            {children}

            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
                error={customError}
            />
        </ContactContext.Provider>
    );
};
