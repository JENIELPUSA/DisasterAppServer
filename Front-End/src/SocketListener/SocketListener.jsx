import { useEffect, useContext } from "react";
import socket from "../socket.js";
import { IncidentReportContext } from "../contexts/IncidentReportContext/IncidentReportContext.jsx";
import { NotificationContext } from "../contexts/NotificationContext/NotificationContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { BarangayDisplayContext } from "../contexts/BrgyContext/BarangayContext.jsx";
import { EvacuationDisplayContext } from "../contexts/EvacuationContext/EvacuationContext.jsx";
import { HouseholdContext } from "../contexts/HouseholdLeadContext/HouseholdContext.jsx";

const SocketListener = () => {
  const { role, linkId } = useAuth();
  const { fetchNotification } = useContext(NotificationContext);
  const { fetchIncidentReports } = useContext(IncidentReportContext);
  const { displayBarangaysForUser } = useContext(BarangayDisplayContext);
  const { fetchEvacuationsInBarangay } = useContext(EvacuationDisplayContext);
  const { getHouseholdLeadsSendNotification } = useContext(HouseholdContext);

  // Optional: register user
  useEffect(() => {
    if (!linkId || !role) return;
    socket.emit("register-user", linkId, role);
  }, [linkId, role]);

  // Listen for new incident and refetch
  useEffect(() => {
    if (!linkId || !role) return;

    const handleNewIncident = () => {
      fetchIncidentReports();
    };

    const handleNewNotification = () => {
      fetchNotification();
    };

    const handleUpdateBarangay = (data) => {
      displayBarangaysForUser("", "", data.municipality);
    };

    const handleDeleteBarangay = (data) => {
      displayBarangaysForUser("", "", data.municipality);
    };

    const handleRemoveEvacuation = (data) => {
      console.log("data", data.barangay);
      fetchEvacuationsInBarangay(data.barangay);
    };

    const handleAddNewTracking = () => {
      console.log("TRigger IUpdate New")
      getHouseholdLeadsSendNotification();
    };

    socket.on("incident:new", handleNewIncident);
    socket.on("notification:new", handleNewNotification);
    socket.on("UpdateBarangay:new", handleUpdateBarangay);
    socket.on("DeletedBarangay:new", handleDeleteBarangay);

    socket.on("removeEvacuation:new", handleRemoveEvacuation);
    socket.on("tracking:new", handleAddNewTracking);

    return () => {
      socket.off("incident:new", handleNewIncident);
      socket.off("notification:new", handleNewNotification);
      socket.off("UpdateBarangay:new", handleUpdateBarangay);
      socket.off("removeEvacuation:new", handleRemoveEvacuation);
    };
  }, [linkId, role, fetchIncidentReports]);

  return null;
};

export default SocketListener;
