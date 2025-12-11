import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
export const UserDisplayContext = createContext();

export const UserDisplayProvider = ({ children }) => {
  const [isUser, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users`,
        {
          withCredentials: true,
        }
      );

      const user = res?.data?.data;
      setUser(user);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserDisplayContext.Provider
      value={{
        isUser,
        loading,
        error,
        refreshUser: fetchUserData,
      }}
    >
      {children}
    </UserDisplayContext.Provider>
  );
};