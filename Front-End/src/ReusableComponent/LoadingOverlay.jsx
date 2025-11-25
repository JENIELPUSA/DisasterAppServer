import React from "react";
import { View, Modal, Image, Text, ActivityIndicator } from "react-native";

const LoadingOverlay = ({ visible, message }) => {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View className="flex-1 bg-black/50 justify-center items-center">
        <Image
          source={require("../../assets/SagipLogo.png")}
          className="w-36 h-36 mb-4"
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#ffffff" />
        {message && (
          <Text className="mt-4 text-white text-lg text-center">{message}</Text>
        )}
      </View>
    </Modal>
  );
};

export default LoadingOverlay;
