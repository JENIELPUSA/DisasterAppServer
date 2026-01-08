import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EmergencyRescueButton = ({ 
  canSeeEmergencyRescue, 
  handleEmergencyRescuePress,
}) => {
  const { width } = Dimensions.get('window');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  useEffect(() => {
    if (!canSeeEmergencyRescue) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    pulse.start();
    shimmer.start();

    return () => {
      pulse.stop();
      shimmer.stop();
    };
  }, [canSeeEmergencyRescue]);

  if (!canSeeEmergencyRescue) return null;

  return (
    <View className="px-5 mt-6 mb-8">
      <View className="relative overflow-hidden rounded-2xl">
        {/* Animated gradient background */}
        <Animated.View
          className="absolute inset-0"
          style={{
            transform: [{ scale: pulseAnim }],
          }}
        >
          <View
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)",
            }}
          />

          {/* Shimmer effect */}
          <Animated.View
            className="absolute top-0 left-0 w-full h-full opacity-20"
            style={{
              transform: [{ translateX: shimmerTranslateX }],
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            }}
          />
        </Animated.View>

        {/* Glow effect */}
        <View className="absolute -inset-2 bg-cyan-500/30 blur-xl rounded-2xl" />

        {/* Main button */}
        <TouchableOpacity
          className="relative p-6 flex-row items-center justify-center rounded-2xl border-2 border-white/30"
          onPress={handleEmergencyRescuePress}
          activeOpacity={0.9}
        >
          {/* Icon with glow */}
          <View className="relative mr-4">
            <View className="absolute inset-0 bg-red-500/30 rounded-full blur-sm" />
            <Ionicons name="alert-circle" size={32} color="white" />
          </View>

          {/* Text content */}
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold tracking-tight">
              EMERGENCY RESCUE
            </Text>
            <Text className="text-white/90 text-sm font-medium mt-1">
              Immediate assistance • 24/7 Response
            </Text>
          </View>

          {/* Right arrow */}
          <View className="ml-4 bg-white/20 p-2 rounded-full">
            <Ionicons name="arrow-forward" size={20} color="white" />
          </View>
        </TouchableOpacity>

        {/* Bottom indicators */}
        <View className="absolute -bottom-2 left-0 right-0 flex-row justify-center space-x-2">
          <View className="w-1 h-1 bg-white/40 rounded-full" />
          <View className="w-8 h-1 bg-white rounded-full" />
          <View className="w-1 h-1 bg-white/40 rounded-full" />
        </View>
      </View>

      {/* Information text */}
      <View className="mt-4 px-2">
        <View className="flex-row items-center justify-center mb-1">
          <Ionicons
            name="information-circle"
            size={16}
            color="#6B7280"
          />
          <Text className="text-gray-600 text-center text-sm ml-2 font-medium">
            For life-threatening emergencies only
          </Text>
        </View>
        <Text className="text-gray-500 text-center text-xs">
          Pressing this button will immediately alert emergency
          responders
        </Text>
      </View>
    </View>
  );
};

export default EmergencyRescueButton;