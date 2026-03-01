import React, { useMemo } from "react";
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
import PropTypes from "prop-types"; // optional but recommended

// -----------------------------------------------------------------------------
// Helper: format date (optional, pwedeng gamitin sa ibang fields)
// -----------------------------------------------------------------------------
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid date";
  }
};

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

const Header = ({ name, relationship, profileImage, onClose }) => (
  <View className="bg-cyan-700 px-6 py-6">
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center">
        <Image
          source={{ uri: profileImage }}
          className="w-12 h-12 rounded-full border-2 border-white mr-3"
          resizeMode="cover"
          accessibilityLabel="Profile picture"
        />
        <View>
          <Text className="text-white text-xl font-bold">{name}</Text>
          <Text className="text-white text-sm opacity-90">{relationship}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={onClose}
        className="p-2"
        accessibilityLabel="Close profile panel"
        accessibilityHint="Closes the side panel"
      >
        <Ionicons name="close" size={28} color="white" />
      </TouchableOpacity>
    </View>
  </View>
);

Header.propTypes = {
  name: PropTypes.string.isRequired,
  relationship: PropTypes.string.isRequired,
  profileImage: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

const QRCodeSection = ({ qrData, onPress, onShare, onSave }) => (
  <View className="items-center mb-6">
    <Text className="text-gray-800 text-lg font-bold mb-3 text-center">
      Scan QR Code for Identification
    </Text>
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="items-center"
      accessibilityLabel="Expand QR code"
      accessibilityHint="Opens a larger view of the QR code"
    >
      <View className="bg-white p-4 rounded-xl border-2 border-gray-300 shadow-lg">
        <QRCode
          value={qrData}
          size={180}
          color="#0e7490"
          backgroundColor="white"
        />
      </View>
      <Text className="text-gray-500 text-sm mt-2 text-center italic">
        Tap QR code to expand
      </Text>
    </TouchableOpacity>

    <View className="flex-row justify-center space-x-4 mt-4">
      <TouchableOpacity
        className="flex-row items-center bg-cyan-100 px-4 py-2 rounded-xl"
        onPress={onShare}
        accessibilityLabel="Share QR code"
      >
        <Ionicons name="share-outline" size={18} color="#0e7490" />
        <Text className="text-cyan-700 font-medium ml-2">Share</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-row items-center bg-blue-100 px-4 py-2 rounded-xl"
        onPress={onSave}
        accessibilityLabel="Save QR code"
      >
        <Ionicons name="download-outline" size={18} color="#1d4ed8" />
        <Text className="text-blue-700 font-medium ml-2">Save</Text>
      </TouchableOpacity>
    </View>
  </View>
);

QRCodeSection.propTypes = {
  qrData: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

const InfoSection = ({ householdCode, householdStatus, contactNumber, email }) => (
  <View className="space-y-4 pb-10">
    <View className="bg-gray-100 rounded-xl p-4">
      <Text className="text-gray-800 font-bold mb-3">
        Household Information
      </Text>
      <View className="space-y-2">
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Code</Text>
          <Text className="text-gray-800 font-medium">{householdCode}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Rescue Status</Text>
          <Text
            className={`font-bold capitalize ${
              householdStatus === "rescued"
                ? "text-green-600"
                : "text-orange-500"
            }`}
          >
            {householdStatus}
          </Text>
        </View>
      </View>
    </View>

    <View className="bg-gray-100 rounded-xl p-4">
      <Text className="text-gray-800 font-bold mb-3">
        Contact Information
      </Text>
      <Text className="text-gray-700 mb-2">
        <Ionicons name="call" size={14} color="#6b7280" /> {contactNumber}
      </Text>
      <Text className="text-gray-700">
        <Ionicons name="mail" size={14} color="#6b7280" /> {email}
      </Text>
    </View>
  </View>
);

InfoSection.propTypes = {
  householdCode: PropTypes.string.isRequired,
  householdStatus: PropTypes.string.isRequired,
  contactNumber: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
};

const Footer = ({ userId }) => (
  <View className="border-t border-gray-200 px-6 py-10 bg-gray-50">
    <View className="flex-row justify-between items-center mb-4">
      <View>
        <Text className="text-gray-500 text-[11px] font-bold tracking-widest uppercase">
          Official Profile
        </Text>
        <Text className="text-gray-400 text-[10px]">
          Verified Digital Identity
        </Text>
      </View>
      <View className="bg-green-100 px-3 py-1 rounded-full flex-row items-center">
        <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
        <Text className="text-green-700 text-[10px] font-bold">ACTIVE</Text>
      </View>
    </View>

    <View className="mb-4">
      <Text className="text-gray-400 text-[9px] leading-4 italic">
        This QR code and User ID serve as your official identification within
        the disaster management system. Keep this information secure.
      </Text>
    </View>

    <View className="pt-4 border-t border-gray-200">
      <Text className="text-gray-400 text-[9px] font-mono">REF: {userId}</Text>
      <Text className="text-gray-300 text-[8px] mt-1">
        Last Sync: {new Date().toLocaleString()}
      </Text>
    </View>
  </View>
);

Footer.propTypes = {
  userId: PropTypes.string.isRequired,
};

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

const ProfilePanel = ({
  profilePanelVisible,
  closeProfilePanel,
  handleQRPress,
  handleShareQR,
  handleSaveQR,
  profilePanelTranslateX,
  profile,
}) => {
  // Memoize the derived user profile to avoid recalculations on every render
  const userProfile = useMemo(() => {
    const defaultProfileImage = "https://via.placeholder.com/150";

    if (!profile) {
      return {
        name: "N/A",
        relationship: "N/A",
        contactNumber: "N/A",
        email: "N/A",
        householdCode: "N/A",
        householdStatus: "N/A",
        qrData: "unknown",
        userId: "N/A",
        profileImage: defaultProfileImage,
      };
    }

    return {
      name: profile.fullName || "N/A",
      relationship: profile.householdMember?.relationship || "N/A",
      contactNumber: profile.contactNumber || "N/A",
      email: profile.username || "N/A",
      householdCode: profile.householdLead?.householdCode || "N/A",
      householdStatus: profile.rescueStatus || profile.householdLead?.rescueStatus || "N/A",
      qrData: profile._id || profile.userId || "unknown",
      userId: profile._id || "N/A",
      profileImage: defaultProfileImage, // Replace with actual image URL if available
    };
  }, [profile]);

  if (!profilePanelVisible) return null;

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
      accessibilityViewIsModal
      accessibilityLabel="Profile panel"
    >
      <Header
        name={userProfile.name}
        relationship={userProfile.relationship}
        profileImage={userProfile.profileImage}
        onClose={closeProfilePanel}
      />

      <ScrollView
        className="flex-1 px-5 py-4"
        showsVerticalScrollIndicator={false}
      >
        <QRCodeSection
          qrData={userProfile.qrData}
          onPress={handleQRPress}
          onShare={handleShareQR}
          onSave={handleSaveQR}
        />

        <InfoSection
          householdCode={userProfile.householdCode}
          householdStatus={userProfile.householdStatus}
          contactNumber={userProfile.contactNumber}
          email={userProfile.email}
        />
      </ScrollView>

      <Footer userId={userProfile.userId} />
    </Animated.View>
  );
};

ProfilePanel.propTypes = {
  profilePanelVisible: PropTypes.bool.isRequired,
  closeProfilePanel: PropTypes.func.isRequired,
  handleQRPress: PropTypes.func.isRequired,
  handleShareQR: PropTypes.func.isRequired,
  handleSaveQR: PropTypes.func.isRequired,
  profilePanelTranslateX: PropTypes.object.isRequired, // Animated interpolation object
  profile: PropTypes.object, // pwede ring null
};

export default ProfilePanel;