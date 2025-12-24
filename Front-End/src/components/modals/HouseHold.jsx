import { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import HouseHoldLead from "../modals/HouseLead/HouseHoldLead";
import HouseHoldMember from "../modals/HouseHoldMember/HouseHoldMember";

export default function HouseHold({
  householdLeads,
  householdMembers,
  fetchHouseholdMembers,
  loading,
  updateHouseholdMemberStatus,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [hasDisabilityWarning, setHasDisabilityWarning] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const fetchInProgress = useRef(false);

  useEffect(() => {
    if (!modalVisible || !selectedHousehold) {
      return;
    }

    if (householdMembers) {
      let membersData = [];

      if (householdMembers && Array.isArray(householdMembers.members)) {
        membersData = householdMembers.members.map((member) => ({
          ...member,
          active: member.active !== undefined ? member.active : true,
          approved: member.approved !== undefined ? member.approved : false,
        }));
      }

      setSelectedMembers(membersData);

      const hasDisability = membersData.some(
        (member) =>
          member && member.disability && member.disability.trim() !== ""
      );
      setHasDisabilityWarning(hasDisability);

      setMembersLoading(false);
      fetchInProgress.current = false;
    }
  }, [householdMembers, modalVisible, selectedHousehold]);

  const handleViewDetails = async (household) => {
    setSelectedHousehold(household);
    setMembersLoading(true);
    fetchInProgress.current = true;
    setModalVisible(true);
    setSelectedMembers([]);
    setHasDisabilityWarning(false);

    try {
      await fetchHouseholdMembers({
        householdLeadId: household._id,
      });
    } catch (error) {
      console.error("Error fetching members:", error);
      Alert.alert("Error", "Failed to load household members");
      setMembersLoading(false);
      fetchInProgress.current = false;
    }
  };

  const handleCloseModal = () => {
    if (fetchInProgress.current) {
      Alert.alert(
        "Still Loading",
        "Please wait while household members are being loaded.",
        [{ text: "OK" }]
      );
      return;
    }
    setModalVisible(false);
  };

  const handleEdit = (household) => {
    console.log("Edit household:", household);
    Alert.alert(
      "Edit Household",
      `Edit functionality for ${household.fullName}`,
      [{ text: "OK", style: "default" }]
    );
  };

  const handleAddHousehold = () => {
    console.log("Add new household");
    Alert.alert("Add Household", "Navigate to add household form", [
      { text: "OK", style: "default" },
    ]);
  };

  const handleToggleStatus = (householdId, householdName, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const action = currentStatus === "active" ? "Inactivate" : "Activate";

    Alert.alert(
      `${action} Household`,
      `Are you sure you want to ${action.toLowerCase()} ${householdName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action,
          style: newStatus === "inactive" ? "destructive" : "default",
          onPress: () => {
            // Implementation of toggle status
            console.log(`${action} household ${householdId}`);
          },
        },
      ]
    );
  };

  const handleEditMember = (member) => {
    console.log("Edit member:", member);
    Alert.alert(
      "Edit Household Member",
      `Edit functionality for ${member.userId?.fullName || "Member"}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Edit",
          style: "default",
          onPress: () => {
            console.log("Editing member:", member._id);
          },
        },
      ]
    );
  };

  const handleToggleMemberActive = (memberId, memberName, currentStatus) => {
    const newStatus = !currentStatus;
    const updatedMembers = selectedMembers.map((member) =>
      member._id === memberId ? { ...member, active: newStatus } : member
    );
    setSelectedMembers(updatedMembers);
    
    // Update in backend
    updateHouseholdMemberStatus(memberId, { isActive: newStatus });
  };

  const handleToggleMemberApproved = (memberId, memberName, currentStatus) => {
    const newStatus = !currentStatus;
    const updatedMembers = selectedMembers.map((member) =>
      member._id === memberId ? { ...member, approved: newStatus } : member
    );
    setSelectedMembers(updatedMembers);
    
    // Update in backend
    updateHouseholdMemberStatus(memberId, { isApproved: newStatus });
  };

  return (
    <>
      <HouseHoldLead
        householdLeads={householdLeads}
        loading={loading}
        onViewDetails={handleViewDetails}
        onAddHousehold={handleAddHousehold}
        onEditHousehold={handleEdit}
        onToggleStatus={handleToggleStatus}
      />
      
      <HouseHoldMember
        modalVisible={modalVisible}
        selectedHousehold={selectedHousehold}
        selectedMembers={selectedMembers}
        membersLoading={membersLoading}
        hasDisabilityWarning={hasDisabilityWarning}
        onCloseModal={handleCloseModal}
        onEditMember={handleEditMember}
        onToggleMemberActive={handleToggleMemberActive}
        onToggleMemberApproved={handleToggleMemberApproved}
        onToggleStatus={handleToggleStatus}
        updateHouseholdMemberStatus={updateHouseholdMemberStatus}
      />
    </>
  );
}