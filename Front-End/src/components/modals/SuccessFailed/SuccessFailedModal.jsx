import React, { useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, Animated, Easing } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const SuccessFailedModal = ({ visible, type = "success", message, onClose }) => {
  const isSuccess = type === "success";
  
  // Animation values
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const iconRotateAnim = React.useRef(new Animated.Value(0)).current;
  const contentFadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      iconRotateAnim.setValue(0);
      contentFadeAnim.setValue(0);

      // Backdrop fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();

      // Modal scale & slide in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      // Icon rotation animation
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(iconRotateAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]).start();

      // Content fade in
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const backdropOpacity = fadeAnim;
  const modalScale = scaleAnim;
  const modalTranslateY = slideAnim;
  const iconRotate = iconRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Modal transparent visible={visible} animationType="none">
      {/* Animated Backdrop */}
      <Animated.View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 16,
          backgroundColor: "rgba(8, 47, 62, 0.5)",
          opacity: backdropOpacity,
        }}
      >
        {/* Animated Modal Card */}
        <Animated.View
          style={{
            width: "100%",
            maxWidth: 360,
            transform: [
              { scale: modalScale },
              { translateY: modalTranslateY },
            ],
          }}
          className="bg-white rounded-3xl overflow-hidden shadow-2xl elevation-12"
        >
          {/* Header Background - Solid Colors only */}
          <View className={`h-24 ${isSuccess ? "bg-cyan-500" : "bg-red-500"}`} />

          {/* Content Container */}
          <View className="px-8 pb-8">
            {/* Animated Icon Container */}
            <Animated.View
              style={{
                transform: [{ rotate: iconRotate }],
                opacity: contentFadeAnim,
                marginTop: -48,
              }}
              className={`p-4 rounded-full mb-6 self-center shadow-lg ${
                isSuccess ? "bg-cyan-50" : "bg-red-50"
              }`}
            >
              <View className={`w-16 h-16 rounded-full items-center justify-center ${
                isSuccess ? "bg-cyan-100" : "bg-red-100"
              }`}>
                <MaterialIcons
                  name={isSuccess ? "check-circle" : "error"}
                  size={56}
                  color={isSuccess ? "#0891b2" : "#dc2626"}
                />
              </View>
            </Animated.View>

            {/* Title */}
            <Animated.View style={{ opacity: contentFadeAnim }}>
              <Text className={`text-center text-2xl font-black mb-2 ${
                isSuccess ? "text-cyan-900" : "text-red-900"
              }`}>
                {isSuccess ? "Success! 🎉" : "Oops! Something Went Wrong"}
              </Text>
            </Animated.View>

            {/* Message */}
            <Animated.View style={{ opacity: contentFadeAnim }}>
              <Text className="text-center text-sm text-slate-600 leading-6 mb-8">
                {message}
              </Text>
            </Animated.View>

            {/* Main Button - Solid Colors only */}
            <Animated.View style={{ opacity: contentFadeAnim }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClose}
                className={`w-full py-4 rounded-2xl items-center shadow-md ${
                  isSuccess ? "bg-cyan-500" : "bg-red-600"
                }`}
              >
                <Text className="text-white text-sm font-bold tracking-wide uppercase">
                  {isSuccess ? "Great, Thanks!" : "Try Again"}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Secondary Action */}
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={onClose}
              className="mt-4 py-2 items-center"
            >
              <Text className={`text-sm font-semibold ${
                isSuccess ? "text-cyan-500" : "text-red-600"
              }`}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default SuccessFailedModal;