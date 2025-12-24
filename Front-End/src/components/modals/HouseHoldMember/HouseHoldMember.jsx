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

  // Handle Edit Member
  const handleEditMember = (member) => {
    setEditingMember(member);
    setEditModalVisible(true);
  };

  // Handle Save Edit from EditMemberForm
  const handleSaveEdit = (updatedMember) => {
    onEditMember(updatedMember);
    updateHouseholdMember(updatedMember._id, updatedMember);
    setEditModalVisible(false);
    setEditingMember(null);
  };

  // Handle Cancel Edit
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
      month: "long",
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

  const calculateDisabilityStats = () => {
    if (!selectedMembers.length) return { count: 0, percentage: 0 };

    const disabilityCount = selectedMembers.filter(
      (member) => member && member.disability && member.disability.trim() !== ""
    ).length;

    const percentage = (disabilityCount / selectedMembers.length) * 100;

    return {
      count: disabilityCount,
      percentage: percentage.toFixed(1),
    };
  };

  const handleToggleQRCode = (memberId) => {
    if (expandedQRCode === memberId) {
      setExpandedQRCode(null);
    } else {
      setExpandedQRCode(memberId);
    }
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

  // Skeleton Modal Content
  const SkeletonModalContent = () => (
    <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
      {/* Household Lead Skeleton */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-gray-200 rounded-xl" />
            <View className="ml-3">
              <View className="w-32 h-5 bg-gray-300 rounded mb-1" />
              <View className="w-24 h-3 bg-gray-200 rounded" />
            </View>
          </View>
          <View className="w-16 h-6 bg-gray-200 rounded-full" />
        </View>

        <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <View className="w-40 h-5 bg-gray-300 rounded mb-3" />
          <View className="space-y-3">
            <View className="flex-row items-center">
              <View className="w-4 h-4 bg-gray-200 rounded" />
              <View className="w-48 h-3 bg-gray-200 rounded ml-3" />
            </View>
            <View className="flex-row items-start">
              <View className="w-4 h-4 bg-gray-200 rounded mt-1" />
              <View className="w-56 h-3 bg-gray-200 rounded ml-3" />
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 bg-gray-200 rounded" />
              <View className="w-40 h-3 bg-gray-200 rounded ml-3" />
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 bg-gray-200 rounded" />
              <View className="w-32 h-3 bg-gray-200 rounded ml-3" />
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 bg-gray-200 rounded" />
              <View className="w-48 h-3 bg-gray-200 rounded ml-3" />
            </View>
          </View>
        </View>
      </View>

      {/* Members Section Skeleton */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-gray-200 rounded-xl" />
            <View className="ml-3">
              <View className="w-40 h-5 bg-gray-300 rounded mb-1" />
              <View className="w-24 h-3 bg-gray-200 rounded" />
            </View>
          </View>
          <View className="w-20 h-6 bg-gray-200 rounded-full" />
        </View>

        {/* Member Card Skeletons */}
        {[1, 2, 3].map((item) => (
          <View
            key={item}
            className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-200"
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
                <View className="w-12 h-6 bg-gray-200 rounded-full mr-2" />
                <View className="w-16 h-6 bg-gray-200 rounded-full" />
              </View>
            </View>

            <View className="space-y-2">
              <View className="flex-row items-center">
                <View className="w-4 h-4 bg-gray-200 rounded" />
                <View className="w-40 h-3 bg-gray-200 rounded ml-2" />
              </View>
              <View className="flex-row items-center">
                <View className="w-4 h-4 bg-gray-200 rounded" />
                <View className="w-48 h-3 bg-gray-200 rounded ml-2" />
              </View>
              <View className="flex-row items-center">
                <View className="w-4 h-4 bg-gray-200 rounded" />
                <View className="w-56 h-3 bg-gray-200 rounded ml-2" />
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderMemberCard = (member, index) => {
    if (!member) return null;

    const memberHasDisability = hasDisability(member);
    // Gamitin ang isActive at isApproved mula sa schema
    const isActive = member.isActive !== undefined ? member.isActive : false;
    const isApproved = member.isApproved !== undefined ? member.isApproved : false;
    const isQRCodeExpanded = expandedQRCode === member._id;
    const hasVerificationCode =
      member.verificationCode && member.verificationCode.trim() !== "";
    const qrCodeData = generateQRCodeData(member);

    return (
      <View
        key={member._id || `member-${index}`}
        className={`bg-white rounded-2xl p-5 mb-4 border ${
          memberHasDisability
            ? "border-amber-200 bg-gradient-to-br from-amber-50 to-white"
            : "border-gray-200"
        }`}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1">
            <View
              className={`p-3 rounded-xl ${
                memberHasDisability ? "bg-amber-100" : "bg-blue-100"
              }`}
            >
              {memberHasDisability ? (
                <MaterialCommunityIcons
                  name="account-alert"
                  size={22}
                  color="#d97706"
                />
              ) : (
                <FontAwesome name="user" size={20} color="#4f46e5" />
              )}
            </View>
            <View className="ml-4 flex-1">
              <Text className="font-bold text-gray-900 text-lg">
                {member.userId?.fullName || "Unknown Name"}
              </Text>
              <Text className="text-gray-600 text-sm">
                {member.relationship || "No relationship specified"}
              </Text>
            </View>
          </View>

          {/* Status Badges */}
          <View className="flex-row space-x-2">
            {memberHasDisability && (
              <View className="bg-amber-100 px-3 py-1.5 rounded-full border border-amber-200">
                <Text className="text-amber-800 text-xs font-bold">PWD</Text>
              </View>
            )}
            {isApproved && (
              <View className="bg-green-100 px-3 py-1.5 rounded-full border border-green-200">
                <Text className="text-green-800 text-xs font-bold">APPROVED</Text>
              </View>
            )}
          </View>
        </View>

        <View className="space-y-3">
          <View className="flex-row items-center">
            <Ionicons name="call" size={16} color="#6b7280" />
            <Text className="ml-3 text-gray-700 font-medium">
              {member.userId?.contactNumber || "No contact"}
            </Text>
          </View>

          <View className="flex-row items-center">
            <MaterialIcons name="cake" size={16} color="#6b7280" />
            <Text className="ml-3 text-gray-700 font-medium">
              {formatBirthDate(member.birthDate)} (
              {calculateAge(member.birthDate)} years old)
            </Text>
          </View>

          <View className="flex-row items-start">
            <MaterialCommunityIcons
              name="home"
              size={16}
              color="#6b7280"
              style={{ marginTop: 2 }}
            />
            <Text className="ml-3 text-gray-600 flex-1">
              {member.userId?.address || "No address"}
            </Text>
          </View>

          {memberHasDisability && (
            <View className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
              <View className="flex-row items-center">
                <MaterialCommunityIcons
                  name="accessibility"
                  size={20}
                  color="#92400e"
                />
                <View className="ml-3 flex-1">
                  <Text className="text-amber-900 font-bold text-sm">
                    DISABILITY ALERT
                  </Text>
                  <Text className="text-amber-800">{member.disability}</Text>
                </View>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={24}
                  color="#d97706"
                />
              </View>
            </View>
          )}

          {/* Verification Code with Expandable QR Code */}
          <View className="pt-3 border-t border-gray-100">
            <TouchableOpacity
              onPress={() => handleToggleQRCode(member._id)}
              className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg active:bg-gray-100"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <MaterialCommunityIcons
                  name={hasVerificationCode ? "qrcode" : "qrcode-remove"}
                  size={20}
                  color={hasVerificationCode ? "#4f46e5" : "#9ca3af"}
                />
                <Text className="ml-3 text-gray-700 font-medium">
                  Verification Code:{" "}
                  {hasVerificationCode ? member.verificationCode : "N/A"}
                </Text>
              </View>
              <MaterialCommunityIcons
                name={isQRCodeExpanded ? "chevron-up" : "chevron-down"}
                size={24}
                color="#6b7280"
              />
            </TouchableOpacity>

            {/* Expanded QR Code Section */}
            {isQRCodeExpanded && hasVerificationCode && (
              <View className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-blue-800 font-bold text-lg">
                    QR Code
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      console.log("📱 SHARE QR CODE:");
                      console.log("Member:", member.userId?.fullName);
                      console.log(
                        "Verification Code:",
                        member.verificationCode
                      );
                      console.log("QR Code Data:", qrCodeData);
                      Alert.alert(
                        "Share QR Code",
                        "QR code data copied to console"
                      );
                    }}
                    className="p-2 bg-white rounded-lg border border-blue-200"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="share-outline" size={18} color="#4f46e5" />
                  </TouchableOpacity>
                </View>

                {/* REAL QR Code Display */}
                <View className="items-center mb-3">
                  <View className="bg-white p-4 rounded-lg border border-gray-300">
                    <QRCode
                      value={qrCodeData}
                      size={150}
                      color="black"
                      backgroundColor="white"
                      logoSize={30}
                      logoMargin={2}
                      logoBorderRadius={15}
                      quietZone={10}
                    />
                  </View>
                  <Text className="text-gray-600 text-sm mt-2">
                    Scan this QR code for verification
                  </Text>
                </View>

                <View className="bg-white p-3 rounded-lg border border-blue-100">
                  <Text className="text-center text-gray-800 font-medium">
                    Code:{" "}
                    <Text className="font-mono font-bold">
                      {member.verificationCode}
                    </Text>
                  </Text>
                  <Text className="text-center text-gray-500 text-xs mt-1">
                    Member ID: {member._id?.substring(0, 8) || "N/A"}
                  </Text>
                </View>
              </View>
            )}

            {/* Join Date */}
            <View className="flex-row items-center mt-3">
              <Ionicons name="calendar" size={16} color="#6b7280" />
              <Text className="ml-2 text-gray-600 text-sm">
                Joined: {formatDate(member.createdAt)}
              </Text>
            </View>
          </View>

          {/* Action Buttons for Member */}
          <View className="flex-row space-x-2 mt-4">
            {/* Edit Button */}
            <TouchableOpacity
              onPress={() => handleEditMember(member)}
              className="flex-1 bg-blue-100 rounded-xl p-3 flex-row items-center justify-center border border-blue-200 active:bg-blue-200"
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={16} color="#2563eb" />
              <Text className="text-blue-700 font-semibold ml-2 text-sm">
                Edit
              </Text>
            </TouchableOpacity>

            {/* Toggle Active Status Button */}
            <TouchableOpacity
              onPress={() =>
                handleToggleMemberActive(
                  member._id,
                  member.userId?.fullName || "Member",
                  isActive
                )
              }
              className={`flex-1 rounded-xl p-3 flex-row items-center justify-center border ${
                isActive
                  ? "bg-green-100 border-green-200 active:bg-green-200"
                  : "bg-gray-100 border-gray-200 active:bg-gray-200"
              }`}
              activeOpacity={0.7}
            >
              {isActive ? (
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
              ) : (
                <Ionicons name="close-circle" size={16} color="#6b7280" />
              )}
              <Text
                className={`font-semibold ml-2 text-sm ${
                  isActive ? "text-green-700" : "text-gray-700"
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </Text>
            </TouchableOpacity>

            {/* Toggle Approved Status Button - Ipakita lamang kung hindi pa approved */}
            {!isApproved && (
              <TouchableOpacity
                onPress={() =>
                  handleToggleMemberApproved(
                    member._id,
                    member.userId?.fullName || "Member",
                    isApproved
                  )
                }
                className="flex-1 rounded-xl p-3 flex-row items-center justify-center border bg-amber-100 border-amber-200 active:bg-amber-200"
                activeOpacity={0.7}
              >
                <Ionicons name="time" size={16} color="#d97706" />
                <Text className="font-semibold ml-2 text-sm text-amber-700">
                  Pending
                </Text>
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
          {/* Modern Modal Header */}
          <View
            className={`pb-6 px-6 ${
              hasDisabilityWarning
                ? "bg-gradient-to-r from-amber-500 to-amber-600"
                : "bg-gradient-to-r from-blue-600 to-indigo-700"
            }`}
            style={{
              paddingTop:
                Platform.OS === "android" ? StatusBar.currentHeight + 20 : 20,
            }}
          >
            <View className="flex-row items-center justify-between mb-5">
              <TouchableOpacity
                onPress={onCloseModal}
                className="p-3 bg-white/20 rounded-xl"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <View className="flex-1 ml-4">
                <Text className="text-white text-2xl font-bold text-center">
                  Household Details
                </Text>
                {selectedHousehold && (
                  <Text className="text-white/90 text-center mt-2 font-medium">
                    {selectedHousehold.householdCode}
                  </Text>
                )}
              </View>
              <View className="w-12" />
            </View>

            {/* Disability Warning Banner */}
            {hasDisabilityWarning && (
              <View className="bg-white/25 p-4 rounded-2xl">
                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={24}
                    color="white"
                  />
                  <View className="ml-4 flex-1">
                    <Text className="text-white font-bold text-lg">
                      DISABILITY ALERT
                    </Text>
                    <Text className="text-white/90 mt-1">
                      This household has members with disabilities requiring
                      special attention
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Show skeleton loading for members */}
          {membersLoading ? (
            <SkeletonModalContent />
          ) : (
            <ScrollView
              className="flex-1 bg-gray-50"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 120 }}
            >
              <View className="p-6">
                {selectedHousehold && (
                  <>
                    {/* Household Lead Section */}
                    <View className="mb-8">
                      <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                          <View className="bg-gradient-to-br from-blue-100 to-white p-4 rounded-2xl border border-blue-200">
                            <MaterialCommunityIcons
                              name="account-tie"
                              size={28}
                              color="#4f46e5"
                            />
                          </View>
                          <View className="ml-4">
                            <Text className="text-gray-900 font-bold text-xl">
                              Household Lead
                            </Text>
                            <Text className="text-gray-600">
                              Primary contact person
                            </Text>
                          </View>
                        </View>

                        {/* Disability Summary */}
                        {selectedMembers.length > 0 &&
                          calculateDisabilityStats().count > 0 && (
                            <View className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 rounded-full">
                              <Text className="text-white font-bold">
                                PWD: {calculateDisabilityStats().count}
                              </Text>
                            </View>
                          )}
                      </View>

                      <View className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <Text className="font-bold text-gray-900 text-xl mb-4">
                          {selectedHousehold.fullName}
                        </Text>

                        <View className="space-y-4">
                          <View className="flex-row items-center">
                            <Ionicons name="call" size={20} color="#6b7280" />
                            <Text className="ml-4 text-gray-700 font-medium text-lg">
                              {selectedHousehold.contactNumber ||
                                "No contact number"}
                            </Text>
                          </View>

                          <View className="flex-row items-start">
                            <Ionicons
                              name="location"
                              size={20}
                              color="#6b7280"
                              style={{ marginTop: 2 }}
                            />
                            <Text className="ml-4 text-gray-600 flex-1 text-lg">
                              {selectedHousehold.address || "No address"}
                            </Text>
                          </View>

                          <View className="flex-row items-center">
                            <MaterialCommunityIcons
                              name="map-marker-radius"
                              size={20}
                              color="#6b7280"
                            />
                            <Text className="ml-4 text-gray-700 font-medium text-lg">
                              Barangay {selectedHousehold.barangay || "Unknown"}
                            </Text>
                          </View>

                          <View className="flex-row items-center">
                            <MaterialCommunityIcons
                              name="home-group"
                              size={20}
                              color="#6b7280"
                            />
                            <Text className="ml-4 text-gray-700 font-medium text-lg">
                              Family Size:{" "}
                              {selectedHousehold.familyMembers || 0} members
                            </Text>
                          </View>

                          <View className="flex-row items-center">
                            <Ionicons
                              name="calendar"
                              size={20}
                              color="#6b7280"
                            />
                            <Text className="ml-4 text-gray-700 font-medium text-lg">
                              Registered:{" "}
                              {formatDate(selectedHousehold.createdAt)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Disability Statistics Card */}
                    {hasDisabilityWarning && (
                      <View className="mb-8">
                        <View className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-300">
                          <View className="flex-row items-center justify-between mb-6">
                            <View className="flex-row items-center">
                              <MaterialCommunityIcons
                                name="accessibility"
                                size={28}
                                color="#d97706"
                              />
                              <Text className="ml-4 text-amber-900 font-bold text-xl">
                                Disability Report
                              </Text>
                            </View>
                            <View className="bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 rounded-full">
                              <Text className="text-white font-bold text-lg">
                                {calculateDisabilityStats().count} PWD
                              </Text>
                            </View>
                          </View>

                          <Text className="text-amber-800 text-lg mb-4 font-medium">
                            {calculateDisabilityStats().count} out of{" "}
                            {selectedMembers.length} members have disabilities (
                            {calculateDisabilityStats().percentage}%)
                          </Text>

                          <View className="bg-white p-5 rounded-xl border border-amber-300">
                            <Text className="text-amber-900 font-bold text-lg mb-3">
                              Special Considerations Needed:
                            </Text>
                            <View className="space-y-2">
                              <View className="flex-row items-center">
                                <Ionicons
                                  name="checkmark-circle"
                                  size={20}
                                  color="#d97706"
                                />
                                <Text className="ml-3 text-amber-800">
                                  Accessibility modifications
                                </Text>
                              </View>
                              <View className="flex-row items-center">
                                <Ionicons
                                  name="checkmark-circle"
                                  size={20}
                                  color="#d97706"
                                />
                                <Text className="ml-3 text-amber-800">
                                  Priority government assistance
                                </Text>
                              </View>
                              <View className="flex-row items-center">
                                <Ionicons
                                  name="checkmark-circle"
                                  size={20}
                                  color="#d97706"
                                />
                                <Text className="ml-3 text-amber-800">
                                  Regular health monitoring
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Members Section */}
                    <View className="mb-8">
                      <View className="flex-row items-center justify-between mb-6">
                        <View className="flex-row items-center">
                          <View className="bg-gradient-to-br from-green-100 to-white p-4 rounded-2xl border border-green-200">
                            <FontAwesome
                              name="users"
                              size={24}
                              color="#059669"
                            />
                          </View>
                          <View className="ml-4">
                            <Text className="text-gray-900 font-bold text-xl">
                              Household Members
                            </Text>
                            <Text className="text-gray-600">
                              {selectedMembers.length} registered member
                              {selectedMembers.length !== 1 ? "s" : ""}
                            </Text>
                          </View>
                        </View>
                        <View className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 rounded-full">
                          <Text className="text-white font-bold text-lg">
                            TOTAL: {selectedMembers.length}
                          </Text>
                        </View>
                      </View>

                      {selectedMembers.length > 0 ? (
                        selectedMembers.map((member, index) =>
                          renderMemberCard(member, index)
                        )
                      ) : (
                        <View className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-10 items-center justify-center border border-gray-200">
                          <MaterialCommunityIcons
                            name="account-group-outline"
                            size={64}
                            color="#9ca3af"
                          />
                          <Text className="text-gray-600 font-bold text-xl mt-6">
                            No members registered yet
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Household Status Section */}
                    <View className="mb-8">
                      <View className="flex-row items-center mb-4">
                        <View className="bg-gradient-to-br from-amber-100 to-white p-4 rounded-2xl border border-amber-200">
                          <MaterialCommunityIcons
                            name="clipboard-check"
                            size={24}
                            color="#d97706"
                          />
                        </View>
                        <View className="ml-4">
                          <Text className="text-gray-900 font-bold text-xl">
                            Household Status
                          </Text>
                          <Text className="text-gray-600">
                            Current registration details
                          </Text>
                        </View>
                      </View>

                      <View className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <View className="flex-row justify-between items-center mb-6">
                          <View>
                            <Text className="text-gray-600 text-sm">
                              Status
                            </Text>
                            <Text
                              className={`text-2xl font-bold ${
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
                            <Text className="text-gray-600 text-sm">
                              Capacity
                            </Text>
                            <Text className="text-2xl font-bold text-gray-900">
                              {selectedMembers.length}/
                              {selectedHousehold.familyMembers || 0}
                            </Text>
                          </View>
                        </View>

                        {/* Professional Status Toggle Button */}
                        <TouchableOpacity
                          onPress={() => {
                            onToggleStatus(
                              selectedHousehold._id,
                              selectedHousehold.fullName,
                              selectedHousehold.status
                            );
                            onCloseModal();
                          }}
                          className={`rounded-xl p-5 flex-row items-center justify-center ${
                            selectedHousehold.status === "active"
                              ? "bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-300"
                              : "bg-gradient-to-r from-green-50 to-green-100 border border-green-300"
                          }`}
                          activeOpacity={0.8}
                        >
                          {selectedHousehold.status === "active" ? (
                            <Ionicons name="power" size={24} color="#d97706" />
                          ) : (
                            <Ionicons
                              name="power-outline"
                              size={24}
                              color="#059669"
                            />
                          )}
                          <Text
                            className={`ml-3 font-bold text-xl ${
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

      {/* Use the separated EditMemberForm component */}
      <EditMemberForm
        visible={editModalVisible}
        member={editingMember}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
    </>
  );
}