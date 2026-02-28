import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Dimensions,
  Animated,
  PanResponder,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const HouseholdMemberList = ({
  visible,
  onClose,
  householdWithMembers,
  fetchHouseholdWithMembers,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(0.4)).current; // Para sa Skeleton Pulse

  // Skeleton Animation Logic
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isLoading]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          Animated.event([null, { dy: slideAnim }], {
            useNativeDriver: false,
          })(evt, gestureState);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100) {
          handleClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible && fetchHouseholdWithMembers) {
      setError(null);
      if (!householdWithMembers) {
        fetchData();
      }
    }
  }, [visible]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (fetchHouseholdWithMembers) {
        await fetchHouseholdWithMembers();
      }
    } catch (err) {
      setError("Failed to load household data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(Dimensions.get("window").height);
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 70,
          friction: 12,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 60,
          friction: 8,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: Dimensions.get("window").height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {  // FIXED: Added missing dot before start
      onClose();
    });
  };

  // Skeleton UI Component
  const SkeletonItem = ({ style }) => (
    <Animated.View 
      style={[{ backgroundColor: '#e2e8f0', borderRadius: 8, opacity: pulseAnim }, style]} 
    />
  );

  const StatusBadge = ({ status }) => {
    const isNone = status === "none";
    return (
      <View className={`px-3 py-1 rounded-full ${isNone ? "bg-green-100" : "bg-red-100"}`}>
        <Text className={`text-xs font-bold uppercase tracking-wider ${isNone ? "text-green-700" : "text-red-700"}`}>
          {isNone ? "Safe / No Rescue" : status || "Unknown"}
        </Text>
      </View>
    );
  };

  // I-render ang loading state (Pulse Skeleton)
  if (isLoading) {
    return (
      <Modal visible={visible} animationType="none" transparent={true} onRequestClose={handleClose}>
        <View className="flex-1 bg-black/50">
          <SafeAreaView className="flex-1 bg-slate-50 mt-10 rounded-t-3xl overflow-hidden">
            <View className="p-6 bg-slate-200">
               <SkeletonItem style={{ width: 150, height: 24, marginBottom: 8 }} />
               <SkeletonItem style={{ width: 100, height: 16 }} />
            </View>
            <View className="p-4 space-y-6">
              {/* Status Card Skeleton */}
              <View className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <View className="flex-row justify-between mb-4">
                    <SkeletonItem style={{ width: 80, height: 15 }} />
                    <SkeletonItem style={{ width: 100, height: 25, borderRadius: 20 }} />
                </View>
                <View className="flex-row items-center gap-4">
                    <SkeletonItem style={{ width: 56, height: 56, borderRadius: 12 }} />
                    <View className="gap-2">
                        <SkeletonItem style={{ width: 40, height: 24 }} />
                        <SkeletonItem style={{ width: 140, height: 14 }} />
                    </View>
                </View>
              </View>
              {/* Member List Skeleton */}
              <View className="space-y-3">
                <SkeletonItem style={{ width: 120, height: 20, marginBottom: 10 }} />
                {[1, 2, 3, 4].map((i) => (
                   <View key={i} className="bg-white p-4 rounded-xl border border-slate-100 flex-row items-center gap-3">
                      <SkeletonItem style={{ width: 40, height: 40, borderRadius: 8 }} />
                      <View className="gap-2">
                        <SkeletonItem style={{ width: 150, height: 14 }} />
                        <SkeletonItem style={{ width: 100, height: 10 }} />
                      </View>
                   </View>
                ))}
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    );
  }

  // Error State
  if (error) {
    return (
      <Modal visible={visible} animationType="none" transparent={true} onRequestClose={handleClose}>
        <View className="flex-1 bg-black/50">
          <Animated.View className="absolute inset-0" style={{ opacity: fadeAnim }}>
            <TouchableOpacity className="flex-1" activeOpacity={1} onPress={handleClose} />
          </Animated.View>
          <Animated.View 
            className="flex-1 absolute inset-0" 
            style={{ transform: [{ translateY: slideAnim }] }}
          >
            {/* Cyan background with curved white container gaya ng ReportNasirangBahayModal */}
            <View className="flex-1 bg-cyan-700">
              <StatusBar backgroundColor="#0891b2" barStyle="light-content" />
              
              {/* Header Section gaya ng ReportNasirangBahayModal */}
              <SafeAreaView edges={['top']} style={{ flex: 0 }}>
                <View className="flex-row items-center justify-between px-6 py-5">
                  <View className="flex-1">
                    <Text className="text-2xl font-black text-white">Household Portal</Text>
                    <Text className="text-white/70 text-sm mt-1">Error Loading Data</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={handleClose}
                    className="bg-white/20 p-3 rounded-full active:bg-white/40"
                  >
                    <Ionicons name="close" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </SafeAreaView>

              {/* CURVED WHITE CONTAINER */}
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1 bg-white rounded-t-[35px] overflow-hidden"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: -3 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 10,
                }}
              >
                <View className="flex-1 justify-center items-center p-6">
                  <Ionicons name="alert-circle" size={64} color="#ef4444" />
                  <Text className="text-lg font-bold text-gray-800 mt-4">Error</Text>
                  <Text className="text-gray-600 text-center mt-2">{error}</Text>
                  <TouchableOpacity 
                    onPress={fetchData} 
                    className="mt-6 bg-cyan-600 px-6 py-3 rounded-lg"
                  >
                    <Text className="text-white font-semibold">Retry</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  // No Data State
  if (!householdWithMembers) {
    return (
      <Modal visible={visible} animationType="none" transparent={true} onRequestClose={handleClose}>
        <View className="flex-1 bg-black/50">
          <Animated.View className="absolute inset-0" style={{ opacity: fadeAnim }}>
            <TouchableOpacity className="flex-1" activeOpacity={1} onPress={handleClose} />
          </Animated.View>
          <Animated.View 
            className="flex-1 absolute inset-0" 
            style={{ transform: [{ translateY: slideAnim }] }}
          >
            {/* Cyan background with curved white container */}
            <View className="flex-1 bg-cyan-700">
              <StatusBar backgroundColor="#0891b2" barStyle="light-content" />
              
              {/* Header Section */}
              <SafeAreaView edges={['top']} style={{ flex: 0 }}>
                <View className="flex-row items-center justify-between px-6 py-5">
                  <View className="flex-1">
                    <Text className="text-2xl font-black text-white">Household Portal</Text>
                    <Text className="text-white/70 text-sm mt-1">No Data Available</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={handleClose}
                    className="bg-white/20 p-3 rounded-full active:bg-white/40"
                  >
                    <Ionicons name="close" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </SafeAreaView>

              {/* CURVED WHITE CONTAINER */}
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1 bg-white rounded-t-[35px] overflow-hidden"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: -3 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 10,
                }}
              >
                <View className="flex-1 justify-center items-center p-6">
                  <Ionicons name="home-outline" size={64} color="#94a3b8" />
                  <Text className="text-lg font-bold text-gray-800 mt-4">No Data</Text>
                  <Text className="text-gray-600 text-center mt-2">No household data available.</Text>
                  <TouchableOpacity 
                    onPress={fetchData} 
                    className="mt-6 bg-cyan-600 px-6 py-3 rounded-lg"
                  >
                    <Text className="text-white font-semibold">Load Data</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  const data = householdWithMembers;

  return (
    <Modal visible={visible} animationType="none" transparent={true} onRequestClose={handleClose}>
      <View className="flex-1 bg-black/50">
        <Animated.View className="absolute inset-0" style={{ opacity: fadeAnim }}>
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={handleClose} />
        </Animated.View>

        <Animated.View
          className="flex-1 absolute inset-0"
          style={{ transform: [{ translateY: slideAnim }] }}
          {...panResponder.panHandlers}
        >
          {/* Cyan background with curved white container gaya ng ReportNasirangBahayModal */}
          <View className="flex-1 bg-cyan-700">
            <StatusBar backgroundColor="#0891b2" barStyle="light-content" />
            
            {/* Header Section with cyan background */}
            <SafeAreaView edges={['top']} style={{ flex: 0 }}>
              <View className="flex-row items-center justify-between px-6 py-5">
                <View className="flex-1">
                  <Text className="text-2xl font-black text-white">Household Portal</Text>
                  <Text className="text-white/70 text-sm mt-1">{data.householdCode || "Family Details"}</Text>
                </View>
                <TouchableOpacity 
                  onPress={handleClose}
                  className="bg-white/20 p-3 rounded-full active:bg-white/40"
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </SafeAreaView>

            {/* CURVED WHITE CONTAINER */}
            <Animated.View
              className="flex-1 bg-white overflow-hidden"
              style={{
                transform: [{ scale: scaleAnim }],
                borderTopLeftRadius: 35,
                borderTopRightRadius: 35,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 10,
              }}
            >
              {/* Drag Indicator */}
              <View className="absolute top-2 left-0 right-0 z-50 items-center pt-3">
                <View className="w-12 h-1.5 bg-gray-400 rounded-full opacity-70" />
              </View>

              <ScrollView
                className="flex-1"
                contentContainerStyle={{ 
                  paddingHorizontal: 24, 
                  paddingVertical: 28, 
                  paddingBottom: 60 
                }}
                showsVerticalScrollIndicator={false}
              >
                <Animated.View
                  style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
                  }}
                >
                  {/* Rescue Status Card */}
                  <View className="bg-white p-5 rounded-2xl border border-gray-100 mb-6 shadow-sm">
                    <View className="flex-row justify-between items-start mb-4">
                      <Text className="font-semibold text-gray-500 text-sm">RESCUE STATUS</Text>
                      <StatusBadge status={data.rescueStatus} />
                    </View>
                    <View className="flex-row items-center gap-4">
                      <View className="h-14 w-14 bg-cyan-50 rounded-xl items-center justify-center">
                        <Ionicons name="people" size={28} color="#06b6d4" />
                      </View>
                      <View>
                        <Text className="text-2xl font-bold text-gray-800">
                          {data.totalMembers || data.familyMembers || data.actualMembersCount || 0}
                        </Text>
                        <Text className="text-gray-500 text-sm">Registered Family Members</Text>
                      </View>
                    </View>
                  </View>
                </Animated.View>

                <Animated.View
                  style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
                  }}
                >
                  {/* Household Information */}
                  <View className="mb-6">
                    <Text className="font-bold text-lg mb-4 text-gray-800">Household Information</Text>
                    <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                      <View className="p-5 border-b border-gray-50 bg-gray-50/50">
                        <View className="flex-row items-center gap-3">
                          <View className="w-10 h-10 bg-cyan-600 rounded-full items-center justify-center">
                            <Text className="text-white font-bold">
                              {data.lead?.fullName?.charAt(0) || "?"}
                            </Text>
                          </View>
                          <View>
                            <Text className="font-bold text-gray-800">
                              {data.lead?.fullName || "No Name"}
                            </Text>
                            <Text className="text-xs text-cyan-600 font-medium italic">Household Head</Text>
                          </View>
                        </View>
                      </View>
                      <View className="p-5 space-y-4">
                        <View className="flex-row items-start gap-3">
                          <Ionicons name="location" size={18} color="#94a3b8" />
                          <View className="flex-1">
                            <Text className="text-xs text-gray-400 uppercase font-bold tracking-tight">
                              Address
                            </Text>
                            <Text className="text-sm text-gray-700">
                              {data.lead?.address || 
                               (data.location ? 
                                 `Lat: ${data.location.latitude}, Lng: ${data.location.longitude}` : 
                                 "No address provided")}
                            </Text>
                          </View>
                        </View>
                        <View className="flex-row items-center gap-3">
                          <Ionicons name="call" size={18} color="#94a3b8" />
                          <View className="flex-1">
                            <Text className="text-xs text-gray-400 uppercase font-bold tracking-tight">
                              Emergency Contact
                            </Text>
                            <Text className="text-sm font-semibold text-gray-700">
                              {data.emergencyContact || data.lead?.contactNumber || "N/A"}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </Animated.View>

                <Animated.View
                  style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
                  }}
                >
                  {/* Family Members */}
                  <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                      <Text className="font-bold text-lg text-gray-800">Family Members</Text>
                      <View className="bg-gray-200 px-3 py-1 rounded">
                        <Text className="text-xs text-gray-600 font-bold">
                          {data.members?.length || 0} OTHERS
                        </Text>
                      </View>
                    </View>
                    <View className="space-y-3">
                      {data.members?.map((member, index) => (
                        <View 
                          key={member._id || index} 
                          className="bg-white p-4 rounded-xl border border-gray-100 flex-row items-center justify-between shadow-sm"
                        >
                          <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center">
                              <Ionicons name="person" size={20} color="#64748b" />
                            </View>
                            <View>
                              <Text className="font-semibold text-gray-800 text-sm">
                                {member.fullName}
                              </Text>
                              <View className="flex-row items-center gap-1">
                                <Ionicons name="call" size={10} color="#94a3b8" />
                                <Text className="text-xs text-gray-400">
                                  {member.contactNumber || "No contact"}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </Animated.View>
              </ScrollView>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default HouseholdMemberList;