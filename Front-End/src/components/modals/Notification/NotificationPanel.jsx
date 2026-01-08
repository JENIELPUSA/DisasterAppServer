import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const emergencyAlertsData = [
  {
    id: "EA-001",
    title: "Flood Warning",
    barangay: "Barangay San Roque",
    description: "High flood alert issued. Water levels rising rapidly.",
    severity: "Critical",
    issuedAt: "Today, 09:45 AM",
    validUntil: "6:00 PM",
  },
  {
    id: "EA-002",
    title: "Landslide Alert",
    barangay: "Barangay Mabini",
    description: "Possible landslide due to continuous heavy rainfall.",
    severity: "High",
    issuedAt: "Today, 07:30 AM",
    validUntil: "8:00 PM",
  },
  {
    id: "EA-003",
    title: "Strong Wind Advisory",
    barangay: "Barangay Poblacion",
    description: "Strong winds expected within the next 12 hours.",
    severity: "Medium",
    issuedAt: "Yesterday, 5:10 PM",
    validUntil: "Today, 5:00 PM",
  },
];

const rescuerAlertsData = [
  {
    id: "RA-001",
    title: "Rescuer Nearby",
    barangay: "Barangay Mabini",
    description: "A rescuer is currently in your area and ready to assist.",
    rescuerName: "Team Alpha",
    severity: "Info",
    notifiedAt: "Today, 10:30 AM",
  },
  {
    id: "RA-002",
    title: "Rescuer Nearby",
    barangay: "Barangay San Roque",
    description: "A rescuer is currently patrolling this area.",
    rescuerName: "Team Bravo",
    severity: "Info",
    notifiedAt: "Today, 11:00 AM",
  },
];

const NotificationPanel = ({
  notificationPanelVisible,
  closeNotificationPanel,
  notificationPanelTranslateX,
  rescuedHouseholdsData = [],
  handleRouteButtonPress,
  loading = false 
}) => {
  const pulseAnim = new Animated.Value(1); 

  React.useEffect(() => {
    if (loading) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
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
      pulse.start();
      return () => pulse.stop();
    }
  }, [loading]);

  if (!notificationPanelVisible) return null;

  console.log("rescuedHouseholdsData",rescuedHouseholdsData)

  // Skeleton Loading Components
  const SkeletonPulse = ({ style, children }) => (
    <Animated.View
      style={[
        style,
        {
          opacity: pulseAnim,
          backgroundColor: "#e5e7eb",
        },
      ]}
    >
      {children}
    </Animated.View>
  );

  // Skeleton for rescued households
  const renderRescuedHouseholdsSkeleton = () => (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-4">
        <SkeletonPulse style={{ width: 150, height: 24, borderRadius: 6 }} />
        <SkeletonPulse style={{ width: 40, height: 24, borderRadius: 12 }} />
      </View>

      {[1, 2, 3].map((item) => (
        <View
          key={item}
          className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm"
        >
          {/* Household Header Skeleton */}
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1">
              <SkeletonPulse style={{ width: '70%', height: 20, borderRadius: 4, marginBottom: 8 }} />
              <SkeletonPulse style={{ width: '50%', height: 16, borderRadius: 4 }} />
            </View>
            <SkeletonPulse style={{ width: 60, height: 24, borderRadius: 12 }} />
          </View>

          {/* Household Details Skeleton */}
          <View className="space-y-2 mb-4">
            <SkeletonPulse style={{ width: '40%', height: 16, borderRadius: 4 }} />
          </View>

          {/* Action Buttons Skeleton */}
          <View className="flex-row space-x-3">
            <SkeletonPulse style={{ flex: 1, height: 48, borderRadius: 8 }} />
            <SkeletonPulse style={{ flex: 1, height: 48, borderRadius: 8 }} />
          </View>
        </View>
      ))}
    </View>
  );

  // Skeleton for emergency alerts
  const renderEmergencyAlertsSkeleton = () => (
    <View className="mb-8">
      <View className="flex-row items-center justify-between mb-4">
        <SkeletonPulse style={{ width: 150, height: 24, borderRadius: 6 }} />
        <SkeletonPulse style={{ width: 40, height: 24, borderRadius: 12 }} />
      </View>

      {[1, 2, 3].map((item) => (
        <View
          key={item}
          className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200"
        >
          <View className="flex-row items-center mb-3">
            <SkeletonPulse style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }} />
            <View className="flex-1">
              <SkeletonPulse style={{ width: '60%', height: 18, borderRadius: 4, marginBottom: 6 }} />
              <SkeletonPulse style={{ width: '40%', height: 14, borderRadius: 4 }} />
            </View>
            <SkeletonPulse style={{ width: 60, height: 24, borderRadius: 12 }} />
          </View>
          <SkeletonPulse style={{ width: '100%', height: 16, borderRadius: 4, marginBottom: 12 }} />
          <SkeletonPulse style={{ width: '80%', height: 12, borderRadius: 4 }} />
        </View>
      ))}
    </View>
  );

  // Skeleton for rescuer alerts
  const renderRescuerAlertsSkeleton = () => (
    <View className="mb-8">
      <SkeletonPulse style={{ width: 200, height: 24, borderRadius: 6, marginBottom: 16 }} />

      {[1, 2].map((item) => (
        <View
          key={item}
          className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200"
        >
          <View className="flex-row items-center mb-3">
            <SkeletonPulse style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }} />
            <View className="flex-1">
              <SkeletonPulse style={{ width: '60%', height: 18, borderRadius: 4, marginBottom: 6 }} />
              <SkeletonPulse style={{ width: '40%', height: 14, borderRadius: 4 }} />
            </View>
          </View>
          <SkeletonPulse style={{ width: '100%', height: 16, borderRadius: 4, marginBottom: 8 }} />
          <SkeletonPulse style={{ width: '70%', height: 12, borderRadius: 4 }} />
        </View>
      ))}
    </View>
  );

  return (
    <Animated.View
      className="absolute top-0 right-0 h-full w-4/5 bg-white"
      style={{
        transform: [{ translateX: notificationPanelTranslateX }],
        shadowColor: "#000",
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 20,
      }}
    >
      {/* Panel Header */}
      <View className="bg-cyan-700 px-6 py-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="notifications" size={28} color="white" />
            <Text className="text-white text-2xl font-bold ml-3">
              Notifications
            </Text>
          </View>
          <TouchableOpacity onPress={closeNotificationPanel} className="p-2">
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
        </View>
        <Text className="text-cyan-100 text-sm mt-2">
          Rescued households and emergency alerts
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5 py-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Rescued Households */}
        {loading ? (
          renderRescuedHouseholdsSkeleton()
        ) : (
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-800 text-xl font-bold">
                Rescued Households
              </Text>
              <View className="bg-cyan-100 px-3 py-1 rounded-full">
                <Text className="text-cyan-700 text-sm font-medium">
                  {rescuedHouseholdsData.length}
                </Text>
              </View>
            </View>

            {(rescuedHouseholdsData || []).map((household) => (
              <View
                key={household.id}
                className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm"
              >
                {/* Household Header */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-gray-800 text-lg font-bold">
                      {household.householdName}
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      {household.address}
                    </Text>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full ${
                      household.rescueStatus === "pending"
                        ? "bg-yellow-100"
                        : household.rescueStatus === "in_progress"
                        ? "bg-orange-100"
                        : household.rescueStatus === "rescued"
                        ? "bg-green-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        household.rescueStatus === "pending"
                          ? "text-yellow-700"
                          : household.rescueStatus === "in_progress"
                          ? "text-orange-700"
                          : household.rescueStatus === "rescued"
                          ? "text-green-700"
                          : "text-gray-700"
                      }`}
                    >
                      {household.rescueStatus}
                    </Text>
                  </View>
                </View>

                {/* Household Details */}
                <View className="space-y-2 mb-4">
                  <View className="flex-row items-center">
                    <Ionicons name="people-outline" size={16} color="#6b7280" />
                    <Text className="text-gray-600 text-sm ml-2">
                      {household.members} members
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row space-x-3">
                  <TouchableOpacity
                    className="flex-1 bg-cyan-600 rounded-lg p-3 flex-row items-center justify-center"
                    onPress={() => handleRouteButtonPress(household)}
                  >
                    <Ionicons name="navigate" size={20} color="white" />
                    <Text className="text-white font-bold ml-2">Route</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-gray-100 rounded-lg p-3 flex-row items-center justify-center"
                    onPress={() =>
                      Alert.alert(
                        "Household Details",
                        `Full details for ${household.name}\n\nLocation: ${
                          household.barangay || household.address
                        }\nMembers: ${household.members}\nStatus: ${
                          household.rescueStatus
                        }`
                      )
                    }
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={20}
                      color="#6b7280"
                    />
                    <Text className="text-gray-700 font-medium ml-2">
                      Details
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Emergency Alerts */}
        {loading ? (
          renderEmergencyAlertsSkeleton()
        ) : (
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-800 text-xl font-bold">
                Emergency Alerts
              </Text>
              <View className="bg-red-100 px-3 py-1 rounded-full">
                <Text className="text-red-700 text-sm font-medium">
                  {emergencyAlertsData.length}
                </Text>
              </View>
            </View>

            {emergencyAlertsData.map((alert) => (
              <View
                key={alert.id}
                className={`rounded-xl p-4 mb-4 border ${
                  alert.severity === "Critical"
                    ? "bg-red-50 border-red-200"
                    : alert.severity === "High"
                    ? "bg-orange-50 border-orange-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <View className="flex-row items-center mb-3">
                  <View
                    className={`w-10 h-10 rounded-full justify-center items-center mr-3 ${
                      alert.severity === "Critical"
                        ? "bg-red-100"
                        : alert.severity === "High"
                        ? "bg-orange-100"
                        : "bg-yellow-100"
                    }`}
                  >
                    <Ionicons
                      name="warning"
                      size={22}
                      color={
                        alert.severity === "Critical"
                          ? "#dc2626"
                          : alert.severity === "High"
                          ? "#ea580c"
                          : "#ca8a04"
                      }
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="font-bold text-gray-800">{alert.title}</Text>
                    <Text className="text-sm text-gray-600">
                      {alert.barangay}
                    </Text>
                  </View>

                  <View
                    className={`px-3 py-1 rounded-full ${
                      alert.severity === "Critical"
                        ? "bg-red-200"
                        : alert.severity === "High"
                        ? "bg-orange-200"
                        : "bg-yellow-200"
                    }`}
                  >
                    <Text className="text-xs font-bold">{alert.severity}</Text>
                  </View>
                </View>

                <Text className="text-gray-700 mb-3">{alert.description}</Text>
                <Text className="text-gray-500 text-xs">
                  Issued: {alert.issuedAt} • Valid until: {alert.validUntil}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Rescuer Alerts */}
        {loading ? (
          renderRescuerAlertsSkeleton()
        ) : (
          <View className="mb-8">
            <Text className="text-gray-800 text-xl font-bold mb-4">
              Rescuer Notifications
            </Text>

            {rescuerAlertsData.map((alert) => (
              <View
                key={alert.id}
                className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4"
              >
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 bg-blue-100 rounded-full justify-center items-center mr-3">
                    <Ionicons name="person-outline" size={22} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-blue-800 font-bold">{alert.title}</Text>
                    <Text className="text-blue-600 text-sm">
                      {alert.barangay}
                    </Text>
                  </View>
                </View>
                <Text className="text-gray-700 mb-2">{alert.description}</Text>
                <Text className="text-gray-500 text-xs">
                  Rescuer: {alert.rescuerName} • Notified at: {alert.notifiedAt}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Panel Footer */}
      <View className="border-t border-gray-200 px-5 py-4">
        {loading ? (
          <SkeletonPulse style={{ width: '100%', height: 48, borderRadius: 8 }} />
        ) : (
          <TouchableOpacity
            className="bg-gray-100 rounded-lg p-3 flex-row items-center justify-center"
            onPress={() => Alert.alert("Clear All", "Clear all notifications?")}
          >
            <Ionicons name="trash-outline" size={20} color="#6b7280" />
            <Text className="text-gray-700 font-medium ml-2">
              Clear All Notifications
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

export default NotificationPanel;