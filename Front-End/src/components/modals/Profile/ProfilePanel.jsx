import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";

const ProfilePanel = ({
  profilePanelVisible,
  closeProfilePanel,
  handleQRPress,
  handleShareQR,
  handleSaveQR,
  profilePanelTranslateX,
  profile,
}) => {
  if (!profilePanelVisible) return null;

  // Extract data from the profile object
  const userProfile = {
    name: profile?.fullName || "N/A",
    role: profile?.role || "N/A",
    contactNumber: profile?.contactNumber || "N/A",
    email: profile?.username || "N/A",
    address: profile?.address || "N/A",

    // ✅ ITO ANG IMPORTANTE: Gamitin ang userId, hindi verification code
    // QR Data - using USER ID not verification code
    qrData: profile?._id || profile?.userId, // Gamitin ang userId mismo

    // For account information
    accountCreated: profile?.createdAt
      ? new Date(profile.createdAt).toLocaleDateString()
      : "N/A",
    lastLogin: profile?.updatedAt
      ? new Date(profile.updatedAt).toLocaleDateString()
      : "Recently",

    // Household information
    householdCode: profile?.householdLead?.householdCode || "N/A",
    householdStatus: profile?.householdLead?.rescueStatus || "N/A",
    relationship: profile?.householdMember?.relationship || "N/A",

    // User ID for reference
    userId: profile?._id || "N/A",

    // For profile image
    profileImage: "https://via.placeholder.com/150",
  };

  console.log("userProfile", userProfile);
  console.log("QR Code will contain:", userProfile.qrData);
  console.log(
    "Is this a valid user ID?",
    /^[0-9a-fA-F]{24}$/.test(userProfile.qrData),
  );

  return (
    <Animated.View
      className="absolute top-0 left-0 h-full w-4/5 bg-white shadow-2xl"
      style={{
        transform: [{ translateX: profilePanelTranslateX }],
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 20,
      }}
    >
      {/* Panel Header */}
      <View className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Image
              source={{ uri: userProfile.profileImage }}
              className="w-12 h-12 rounded-full border-2 border-white mr-3"
              resizeMode="cover"
            />
            <View>
              <Text className="text-gray-500 text-xl font-bold">
                {userProfile.name}
              </Text>
              <Text className="text-gray-500 text-sm opacity-90">
                {userProfile.relationship}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={closeProfilePanel} className="p-2">
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Content */}
      <ScrollView
        className="flex-1 px-5 py-4"
        showsVerticalScrollIndicator={false}
      >
        {/* QR Code Section - Clickable */}
        <View className="items-center mb-6">
          <Text className="text-gray-800 text-lg font-bold mb-3 text-center">
            Scan QR Code for Identification
          </Text>
          <Text className="text-gray-600 text-sm mb-3 text-center">
            Contains User ID: {userProfile.userId.substring(0, 12)}...
          </Text>

          {/* Clickable QR Code */}
          <TouchableOpacity
            onPress={handleQRPress}
            activeOpacity={0.7}
            className="items-center"
          >
            <View className="bg-white p-4 rounded-xl border-2 border-gray-300 shadow-lg">
              <QRCode
                value={userProfile.qrData}
                size={200}
                color="#0e7490"
                backgroundColor="white"
                logoSize={40}
                logoBackgroundColor="transparent"
              />
            </View>
            <Text className="text-gray-500 text-sm mt-2 text-center">
              Tap QR code to expand
            </Text>
          </TouchableOpacity>

          {/* QR Actions */}
          <View className="flex-row justify-center space-x-4 mt-4">
            <TouchableOpacity
              className="flex-row items-center bg-cyan-100 px-4 py-2 rounded-xl"
              onPress={handleShareQR}
            >
              <Ionicons name="share-outline" size={18} color="#0e7490" />
              <Text className="text-cyan-700 font-medium ml-2">Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center bg-blue-100 px-4 py-2 rounded-xl"
              onPress={handleSaveQR}
            >
              <Ionicons name="download-outline" size={18} color="#1d4ed8" />
              <Text className="text-blue-700 font-medium ml-2">Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Details */}
        <View className="space-y-4">
          {/* Role Badge */}
          <View className="bg-gray-100 rounded-xl p-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-cyan-100 rounded-full justify-center items-center mr-3">
                <Ionicons name="person" size={20} color="#0e7490" />
              </View>
              <View>
                <Text className="text-gray-500 text-xs">Role</Text>
                <Text className="text-gray-800 font-bold capitalize">
                  {userProfile.role.replace("_", " ")}
                </Text>
              </View>
            </View>
          </View>

          {/* User ID Display */}
          <View className="bg-gray-100 rounded-xl p-4">
            <Text className="text-gray-800 font-bold mb-3">
              User Identification
            </Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">User ID</Text>
                <Text className="text-gray-800 font-medium text-xs">
                  {userProfile.userId}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">QR Contains</Text>
                <Text className="text-gray-800 font-medium">User ID</Text>
              </View>
            </View>
          </View>

          {/* Household Information */}
          <View className="bg-gray-100 rounded-xl p-4">
            <Text className="text-gray-800 font-bold mb-3">
              Household Information
            </Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Household Code</Text>
                <Text className="text-gray-800 font-medium">
                  {userProfile.householdCode}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Rescue Status</Text>
                <View className="flex-row items-center">
                  <View
                    className={`w-2 h-2 rounded-full mr-2 ${
                      userProfile.householdStatus === "rescued"
                        ? "bg-green-500"
                        : userProfile.householdStatus === "pending"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  />
                  <Text className="font-medium capitalize">
                    {userProfile.householdStatus}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Contact Info */}
          <View className="bg-gray-100 rounded-xl p-4">
            <Text className="text-gray-800 font-bold mb-3">
              Contact Information
            </Text>
            <View className="space-y-3">
              <View className="flex-row items-center">
                <Ionicons
                  name="call"
                  size={18}
                  color="#6b7280"
                  className="mr-3"
                />
                <Text className="text-gray-700">
                  {userProfile.contactNumber}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons
                  name="mail"
                  size={18}
                  color="#6b7280"
                  className="mr-3"
                />
                <Text className="text-gray-700">{userProfile.email}</Text>
              </View>
            </View>
          </View>

          {/* Location Info */}
          <View className="bg-gray-100 rounded-xl p-4">
            <Text className="text-gray-800 font-bold mb-3">Location</Text>
            <View className="space-y-3">
              <View className="flex-row">
                <Ionicons
                  name="location"
                  size={18}
                  color="#6b7280"
                  className="mr-3 mt-1"
                />
                <View className="flex-1">
                  <Text className="text-gray-700">{userProfile.address}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Account Info */}
          <View className="bg-gray-100 rounded-xl p-4">
            <Text className="text-gray-800 font-bold mb-3">
              Account Information
            </Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Account Created</Text>
                <Text className="text-gray-800 font-medium">
                  {userProfile.accountCreated}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Last Updated</Text>
                <Text className="text-gray-800 font-medium">
                  {userProfile.lastLogin}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Status</Text>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <Text className="text-green-700 font-medium">
                    {profile?.isActive ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Verification</Text>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <Text className="text-green-700 font-medium">
                    {profile?.isVerified ? "Verified" : "Not Verified"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

export default ProfilePanel;
