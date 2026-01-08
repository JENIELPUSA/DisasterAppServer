import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';

const ExpandedQRModal = ({
  qrExpanded,
  handleCloseExpandedQR,
  userProfile,
  handleShareQR,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={qrExpanded}
      onRequestClose={handleCloseExpandedQR}
    >
      <View className="flex-1 bg-black/70 justify-center items-center">
        <TouchableOpacity
          className="absolute top-10 right-5 z-10"
          onPress={handleCloseExpandedQR}
        >
          <Ionicons name="close-circle" size={32} color="white" />
        </TouchableOpacity>
        
        <View className="bg-white rounded-3xl p-8 max-w-md mx-5 items-center">
          <Text className="text-gray-800 text-2xl font-bold mb-4 text-center">
            Your QR Code
          </Text>

          {/* Large QR Code */}
          <View className="bg-white p-6 rounded-2xl border-4 border-cyan-500 shadow-2xl mb-6">
            <QRCode
              value={userProfile.qrData}
              size={280}
              color="#0e7490"
              backgroundColor="white"
              logoSize={70}
              logoBackgroundColor="transparent"
            />
          </View>

          <Text className="text-gray-600 text-center mb-2 text-lg font-semibold">
            {userProfile.name}
          </Text>
          <Text className="text-gray-500 text-center mb-6">
            User ID: {userProfile.userId}
          </Text>

          {/* User Details */}
          <View className="w-full bg-gray-50 rounded-xl p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="location" size={16} color="#6b7280" />
              <Text className="text-gray-600 ml-2 text-sm">
                {userProfile.address}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="call" size={16} color="#6b7280" />
              <Text className="text-gray-600 ml-2 text-sm">
                {userProfile.contactNumber}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row space-x-4 w-full">
            <TouchableOpacity
              className="flex-1 bg-gray-200 rounded-xl p-4 items-center flex-row justify-center"
              onPress={handleCloseExpandedQR}
            >
              <Ionicons name="close" size={20} color="#6b7280" />
              <Text className="text-gray-700 font-semibold ml-2">Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-cyan-600 rounded-xl p-4 items-center flex-row justify-center"
              onPress={handleShareQR}
            >
              <Ionicons name="share-outline" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Share QR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ExpandedQRModal;