import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  Modal,
  Alert,
} from "react-native";
import { useState, useContext } from "react";
import {
  Ionicons,
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import EditMemberForm from "./EditMemberForm";
import { HouseHoldMemberContext } from "../../../contexts/HouseHoldMemberContext/HouseHoldMemberContext";

export default function HouseHoldMember({
  modalVisible,
  selectedHousehold,
  selectedMembers,
  membersLoading,
  hasDisabilityWarning,
  onCloseModal,
  onEditMember,
  onToggleMemberActive,
  onToggleMemberApproved,
  onToggleStatus,
}) {
  const { updateHouseholdMember } = useContext(HouseHoldMemberContext);
  const [expandedQRCode, setExpandedQRCode] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const handleEditMember = (member) => {
    setEditingMember(member);
    setEditModalVisible(true);
  };

  const handleSaveEdit = (updatedMember) => {
    onEditMember(updatedMember);
    updateHouseholdMember(updatedMember._id, updatedMember);
    setEditModalVisible(false);
    setEditingMember(null);
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setEditingMember(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatBirthDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const hasDisability = (member) => {
    return member && member.disability && member.disability.trim() !== "";
  };

  // Calculate demographics statistics
  const calculateDemographics = () => {
    let children = 0;
    let seniorCitizens = 0;
    let pwd = 0;

    selectedMembers.forEach((member) => {
      const age = calculateAge(member.birthDate);
      
      // Count children (below 18 years old)
      if (age < 18) {
        children++;
      }
      
      // Count senior citizens (60 years old and above)
      if (age >= 60) {
        seniorCitizens++;
      }
      
      // Count PWD (Persons with Disabilities)
      if (hasDisability(member)) {
        pwd++;
      }
    });

    return {
      children,
      seniorCitizens,
      pwd,
      total: selectedMembers.length,
    };
  };

  const generateQRCodeData = (member) => {
    const qrData = {
      memberId: member._id,
      verificationCode: member.verificationCode,
      fullName: member.userId?.fullName || "Unknown",
      householdCode: selectedHousehold?.householdCode || "N/A",
      timestamp: new Date().toISOString(),
    };
    return JSON.stringify(qrData);
  };

  const handleToggleQRCode = (memberId) => {
    setExpandedQRCode(expandedQRCode === memberId ? null : memberId);
  };

  const handleToggleMemberActive = (memberId, memberName, currentStatus) => {
    const newStatus = !currentStatus;
    const action = newStatus ? "Activate" : "Deactivate";
    Alert.alert(
      `${action} Member`,
      `Are you sure you want to ${action.toLowerCase()} ${memberName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action,
          style: newStatus ? "default" : "destructive",
          onPress: () => {
            onToggleMemberActive(memberId, memberName, currentStatus);
          },
        },
      ]
    );
  };

  const handleToggleMemberApproved = (memberId, memberName, currentStatus) => {
    const newStatus = !currentStatus;
    const action = newStatus ? "Approve" : "Reject";
    Alert.alert(
      `${action} Member`,
      `Are you sure you want to ${action.toLowerCase()} ${memberName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action,
          style: newStatus ? "default" : "destructive",
          onPress: () => {
            onToggleMemberApproved(memberId, memberName, currentStatus);
          },
        },
      ]
    );
  };

  const SkeletonModalContent = () => (
    <View className="flex-1 p-4">
      {/* Header Skeleton */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-gray-200 rounded-xl" />
            <View className="ml-3">
              <View className="w-32 h-5 bg-gray-300 rounded mb-2" />
              <View className="w-24 h-3 bg-gray-200 rounded" />
            </View>
          </View>
          <View className="w-16 h-6 bg-gray-200 rounded-full" />
        </View>

        <View className="bg-gray-50 rounded-lg p-4">
          <View className="w-36 h-5 bg-gray-300 rounded mb-3" />
          <View className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <View key={i} className="flex-row items-center">
                <View className="w-4 h-4 bg-gray-200 rounded" />
                <View className="w-48 h-3 bg-gray-200 rounded ml-2" />
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Members Section Skeleton */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-gray-200 rounded-xl" />
            <View className="ml-3">
              <View className="w-40 h-5 bg-gray-300 rounded mb-2" />
              <View className="w-24 h-3 bg-gray-200 rounded" />
            </View>
          </View>
          <View className="w-20 h-6 bg-gray-200 rounded-full" />
        </View>

        {[1, 2].map((item) => (
          <View
            key={item}
            className="bg-gray-50 rounded-lg p-4 mb-3"
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-gray-300 rounded-lg" />
                <View className="ml-3 flex-1">
                  <View className="w-32 h-5 bg-gray-300 rounded mb-1" />
                  <View className="w-24 h-3 bg-gray-200 rounded" />
                </View>
              </View>
              <View className="flex-row">
                <View className="w-14 h-6 bg-gray-200 rounded-full mr-2" />
                <View className="w-16 h-6 bg-gray-200 rounded-full" />
              </View>
            </View>

            <View className="space-y-2">
              {[1, 2, 3].map((line) => (
                <View key={line} className="flex-row items-center">
                  <View className="w-4 h-4 bg-gray-200 rounded" />
                  <View className="w-48 h-3 bg-gray-200 rounded ml-2" />
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderMemberCard = (member, index) => {
    if (!member) return null;

    const memberHasDisability = hasDisability(member);
    const isActive = member.isActive !== undefined ? member.isActive : false;
    const isApproved = member.isApproved !== undefined ? member.isApproved : false;
    const isQRCodeExpanded = expandedQRCode === member._id;
    const hasVerificationCode =
      member.verificationCode && member.verificationCode.trim() !== "";
    const qrCodeData = generateQRCodeData(member);

    return (
      <View
        key={member._id || `member-${index}`}
        className={`bg-white rounded-lg p-4 mb-3 border ${
          memberHasDisability
            ? "border-amber-200"
            : "border-gray-200"
        }`}
      >
        {/* Member Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View
              className={`p-2 rounded-lg ${
                memberHasDisability ? "bg-amber-100" : "bg-blue-100"
              }`}
            >
              {memberHasDisability ? (
                <MaterialCommunityIcons
                  name="account-alert"
                  size={18}
                  color="#d97706"
                />
              ) : (
                <FontAwesome name="user" size={16} color="#2563eb" />
              )}
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-semibold text-gray-900" numberOfLines={1}>
                {member.userId?.fullName || "Unknown Name"}
              </Text>
              <Text className="text-gray-600 text-xs mt-0.5">
                {member.relationship || "No relationship"}
              </Text>
            </View>
          </View>

          {/* Status Badges */}
          <View className="flex-row space-x-1">
            {memberHasDisability && (
              <View className="bg-amber-100 px-2 py-1 rounded-full">
                <Text className="text-amber-800 text-xs font-medium">PWD</Text>
              </View>
            )}
            {isApproved && (
              <View className="bg-green-100 px-2 py-1 rounded-full">
                <Text className="text-green-800 text-xs font-medium">✓</Text>
              </View>
            )}
          </View>
        </View>

        {/* Member Details */}
        <View className="space-y-2">
          <View className="flex-row items-center">
            <Ionicons name="call" size={14} color="#6b7280" />
            <Text className="ml-2 text-gray-700 text-sm">
              {member.userId?.contactNumber || "No contact"}
            </Text>
          </View>

          <View className="flex-row items-center">
            <MaterialIcons name="cake" size={14} color="#6b7280" />
            <Text className="ml-2 text-gray-700 text-sm">
              {formatBirthDate(member.birthDate)} ({calculateAge(member.birthDate)}y)
            </Text>
          </View>

          {memberHasDisability && (
            <View className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <View className="flex-row items-start">
                <MaterialCommunityIcons
                  name="accessibility"
                  size={16}
                  color="#92400e"
                />
                <View className="ml-2 flex-1">
                  <Text className="text-amber-900 font-medium text-xs">
                    DISABILITY
                  </Text>
                  <Text className="text-amber-800 text-xs mt-0.5">
                    {member.disability}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Verification Code & QR */}
          <View className="pt-3 border-t border-gray-100">
            <TouchableOpacity
              onPress={() => handleToggleQRCode(member._id)}
              className="flex-row items-center justify-between p-2 bg-gray-50 rounded"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <MaterialCommunityIcons
                  name={hasVerificationCode ? "qrcode" : "qrcode-remove"}
                  size={16}
                  color={hasVerificationCode ? "#2563eb" : "#9ca3af"}
                />
                <Text className="ml-2 text-gray-700 text-sm">
                  Code: {hasVerificationCode ? member.verificationCode : "N/A"}
                </Text>
              </View>
              <MaterialCommunityIcons
                name={isQRCodeExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color="#6b7280"
              />
            </TouchableOpacity>

            {/* Expanded QR Code */}
            {isQRCodeExpanded && hasVerificationCode && (
              <View className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <View className="items-center mb-2">
                  <View className="bg-white p-3 rounded border border-gray-300">
                    <QRCode
                      value={qrCodeData}
                      size={120}
                      color="black"
                      backgroundColor="white"
                    />
                  </View>
                  <Text className="text-gray-600 text-xs mt-2">
                    Scan for verification
                  </Text>
                </View>

                <View className="bg-white p-2 rounded border border-blue-100">
                  <Text className="text-center text-gray-800 font-medium text-sm">
                    <Text className="font-mono">{member.verificationCode}</Text>
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View className="flex-row space-x-2 mt-3">
            <TouchableOpacity
              onPress={() => handleEditMember(member)}
              className="flex-1 bg-blue-50 rounded p-2.5 flex-row items-center justify-center border border-blue-200"
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={13} color="#2563eb" />
              <Text className="text-blue-700 font-medium ml-1.5 text-xs">Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                handleToggleMemberActive(
                  member._id,
                  member.userId?.fullName || "Member",
                  isActive
                )
              }
              className={`flex-1 rounded p-2.5 flex-row items-center justify-center border ${
                isActive
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-100 border-gray-200"
              }`}
              activeOpacity={0.7}
            >
              {isActive ? (
                <Ionicons name="checkmark-circle" size={13} color="#059669" />
              ) : (
                <Ionicons name="close-circle" size={13} color="#6b7280" />
              )}
              <Text
                className={`font-medium ml-1.5 text-xs ${
                  isActive ? "text-green-700" : "text-gray-700"
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </Text>
            </TouchableOpacity>

            {!isApproved && (
              <TouchableOpacity
                onPress={() =>
                  handleToggleMemberApproved(
                    member._id,
                    member.userId?.fullName || "Member",
                    isApproved
                  )
                }
                className="flex-1 rounded p-2.5 flex-row items-center justify-center border bg-amber-50 border-amber-200"
                activeOpacity={0.7}
              >
                <Ionicons name="time" size={13} color="#d97706" />
                <Text className="font-medium ml-1.5 text-xs text-amber-700">Pending</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={onCloseModal}
        statusBarTranslucent={false}
      >
        <SafeAreaView className="flex-1 bg-white">
          {/* Header */}
          <View
            className={`pb-4 px-4 ${
              hasDisabilityWarning
                ? "bg-amber-600"
                : "bg-cyan-600"
            }`}
            style={{
              paddingTop:
                Platform.OS === "android" ? StatusBar.currentHeight + 12 : 12,
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <TouchableOpacity
                onPress={onCloseModal}
                className="p-2 bg-white/20 rounded-lg"
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={20} color="white" />
              </TouchableOpacity>
              <View className="flex-1 ml-3">
                <Text className="text-white font-semibold text-lg text-center">
                  Household Details
                </Text>
                {selectedHousehold && (
                  <Text className="text-white/90 text-center text-sm">
                    HH-{selectedHousehold.householdCode}
                  </Text>
                )}
              </View>
              <View className="w-8" />
            </View>

            {hasDisabilityWarning && (
              <View className="bg-white/20 p-3 rounded-lg">
                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={18}
                    color="white"
                  />
                  <View className="ml-2 flex-1">
                    <Text className="text-white font-medium text-sm">DISABILITY ALERT</Text>
                    <Text className="text-white/90 text-xs mt-0.5">
                      Contains members with disabilities
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Content */}
          {membersLoading ? (
            <SkeletonModalContent />
          ) : (
            <ScrollView
              className="flex-1 bg-gray-50"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 80 }}
            >
              <View className="p-4">
                {selectedHousehold && (
                  <>
                    {/* Household Lead */}
                    <View className="mb-6">
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                          <View className="bg-blue-100 p-3 rounded-lg">
                            <MaterialCommunityIcons
                              name="account-tie"
                              size={20}
                              color="#2563eb"
                            />
                          </View>
                          <View className="ml-3">
                            <Text className="text-gray-900 font-semibold">
                              Household Lead
                            </Text>
                            <Text className="text-gray-600 text-xs">
                              Primary contact
                            </Text>
                          </View>
                        </View>

                        {selectedMembers.length > 0 && (
                          <View className="bg-cyan-600 px-2.5 py-1 rounded-full">
                            <Text className="text-white font-medium text-xs">
                              {selectedMembers.length} Members
                            </Text>
                          </View>
                        )}
                      </View>

                      <View className="bg-white rounded-lg p-4 border border-gray-200">
                        <Text className="font-semibold text-gray-900 text-base mb-3">
                          {selectedHousehold.fullName}
                        </Text>

                        <View className="space-y-2">
                          <View className="flex-row items-center">
                            <Ionicons name="call" size={16} color="#6b7280" />
                            <Text className="ml-2 text-gray-700 text-sm">
                              {selectedHousehold.contactNumber || "No contact"}
                            </Text>
                          </View>

                          <View className="flex-row items-start">
                            <Ionicons name="location" size={16} color="#6b7280" style={{ marginTop: 2 }} />
                            <Text className="ml-2 text-gray-600 text-sm flex-1">
                              {selectedHousehold.address || "No address"}
                            </Text>
                          </View>

                          <View className="flex-row items-center">
                            <MaterialCommunityIcons
                              name="map-marker-radius"
                              size={16}
                              color="#6b7280"
                            />
                            <Text className="ml-2 text-gray-700 text-sm">
                              Brgy. {selectedHousehold.barangay || "Unknown"}
                            </Text>
                          </View>

                          <View className="flex-row items-center">
                            <MaterialCommunityIcons
                              name="home-group"
                              size={16}
                              color="#6b7280"
                            />
                            <Text className="ml-2 text-gray-700 text-sm">
                              Family: {selectedHousehold.familyMembers || 0} members
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Demographics Statistics */}
                    {selectedMembers.length > 0 && (
                      <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                          <View className="bg-purple-100 p-3 rounded-lg">
                            <MaterialCommunityIcons
                              name="chart-bar"
                              size={20}
                              color="#7c3aed"
                            />
                          </View>
                          <View className="ml-3">
                            <Text className="text-gray-900 font-semibold">
                              Demographics
                            </Text>
                            <Text className="text-gray-600 text-xs">
                              Age and disability breakdown
                            </Text>
                          </View>
                        </View>

                        <View className="bg-white rounded-lg p-4 border border-gray-200">
                          <View className="flex-row justify-between mb-2">
                            <View className="items-center flex-1">
                              <Text className="text-gray-900 font-bold text-2xl">
                                {calculateDemographics().total}
                              </Text>
                              <Text className="text-gray-600 text-xs mt-1">
                                Total Members
                              </Text>
                            </View>
                            <View className="items-center flex-1">
                              <Text className="text-blue-600 font-bold text-2xl">
                                {calculateDemographics().children}
                              </Text>
                              <Text className="text-gray-600 text-xs mt-1">
                                Children (&lt;18)
                              </Text>
                            </View>
                            <View className="items-center flex-1">
                              <Text className="text-orange-600 font-bold text-2xl">
                                {calculateDemographics().seniorCitizens}
                              </Text>
                              <Text className="text-gray-600 text-xs mt-1">
                                Seniors (60+)
                              </Text>
                            </View>
                          </View>
                          
                          <View className="mt-4 pt-4 border-t border-gray-100">
                            <View className="items-center">
                              <Text className="text-amber-700 font-bold text-2xl">
                                {calculateDemographics().pwd}
                              </Text>
                              <Text className="text-gray-600 text-xs mt-1">
                                Persons with Disabilities
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Disability Statistics */}
                    {hasDisabilityWarning && (
                      <View className="mb-6">
                        <View className="bg-amber-50 rounded-lg p-4 border border-amber-300">
                          <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center">
                              <MaterialCommunityIcons
                                name="accessibility"
                                size={20}
                                color="#d97706"
                              />
                              <Text className="ml-2 text-amber-900 font-semibold text-sm">
                                Disability Report
                              </Text>
                            </View>
                            <View className="bg-amber-500 px-3 py-1 rounded-full">
                              <Text className="text-white font-medium text-xs">
                                {calculateDemographics().pwd} PWD
                              </Text>
                            </View>
                          </View>

                          <Text className="text-amber-800 text-sm mb-3">
                            {calculateDemographics().pwd} of {selectedMembers.length} members
                            ({((calculateDemographics().pwd / selectedMembers.length) * 100).toFixed(1)}%)
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Members Section */}
                    <View className="mb-6">
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                          <View className="bg-green-100 p-3 rounded-lg">
                            <FontAwesome name="users" size={18} color="#059669" />
                          </View>
                          <View className="ml-3">
                            <Text className="text-gray-900 font-semibold">
                              Household Members
                            </Text>
                            <Text className="text-gray-600 text-xs">
                              {selectedMembers.length} registered
                            </Text>
                          </View>
                        </View>
                        <View className="bg-cyan-600 px-3 py-1 rounded-full">
                          <Text className="text-white font-medium text-xs">
                            TOTAL: {selectedMembers.length}
                          </Text>
                        </View>
                      </View>

                      {selectedMembers.length > 0 ? (
                        selectedMembers.map((member, index) =>
                          renderMemberCard(member, index)
                        )
                      ) : (
                        <View className="bg-gray-50 rounded-lg p-8 items-center justify-center border border-gray-200">
                          <MaterialCommunityIcons
                            name="account-group-outline"
                            size={36}
                            color="#9ca3af"
                          />
                          <Text className="text-gray-600 font-medium mt-3">
                            No members registered
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Household Status */}
                    <View className="mb-6">
                      <View className="flex-row items-center mb-3">
                        <View className="bg-amber-100 p-3 rounded-lg">
                          <MaterialCommunityIcons
                            name="clipboard-check"
                            size={18}
                            color="#d97706"
                          />
                        </View>
                        <View className="ml-3">
                          <Text className="text-gray-900 font-semibold">
                            Household Status
                          </Text>
                          <Text className="text-gray-600 text-xs">
                            Registration details
                          </Text>
                        </View>
                      </View>

                      <View className="bg-white rounded-lg p-4 border border-gray-200">
                        <View className="flex-row justify-between items-center mb-4">
                          <View>
                            <Text className="text-gray-600 text-xs">Status</Text>
                            <Text
                              className={`font-semibold mt-1 ${
                                selectedHousehold.status === "active"
                                  ? "text-green-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {selectedHousehold.status === "active"
                                ? "ACTIVE"
                                : "INACTIVE"}
                            </Text>
                          </View>
                          <View>
                            <Text className="text-gray-600 text-xs">Capacity</Text>
                            <Text className="font-semibold text-gray-900 mt-1">
                              {selectedMembers.length}/{selectedHousehold.familyMembers || 0}
                            </Text>
                          </View>
                        </View>

                        <TouchableOpacity
                          onPress={() => {
                            onToggleStatus(
                              selectedHousehold._id,
                              selectedHousehold.fullName,
                              selectedHousehold.status
                            );
                            onCloseModal();
                          }}
                          className={`rounded p-3.5 flex-row items-center justify-center ${
                            selectedHousehold.status === "active"
                              ? "bg-amber-50 border border-amber-300"
                              : "bg-green-50 border border-green-300"
                          }`}
                          activeOpacity={0.8}
                        >
                          {selectedHousehold.status === "active" ? (
                            <Ionicons name="power" size={18} color="#d97706" />
                          ) : (
                            <Ionicons name="power-outline" size={18} color="#059669" />
                          )}
                          <Text
                            className={`ml-2 font-medium ${
                              selectedHousehold.status === "active"
                                ? "text-amber-700"
                                : "text-green-700"
                            }`}
                          >
                            {selectedHousehold.status === "active"
                              ? "Deactivate Household"
                              : "Activate Household"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      <EditMemberForm
        visible={editModalVisible}
        member={editingMember}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
    </>
  );
}