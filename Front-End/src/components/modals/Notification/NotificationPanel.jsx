import React, { useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const NotificationPanel = ({
  notificationPanelVisible,
  closeNotificationPanel,
  notificationPanelTranslateX,
  rescuedHouseholdsData = [],
  handleRouteButtonPress,
  fetchNotification,
  loading = false,
  Notification = [],
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // 1. Fetch data tuwing bubuksan ang panel
  useEffect(() => {
    if (notificationPanelVisible && typeof fetchNotification === "function") {
      fetchNotification();
    }
  }, [notificationPanelVisible]);

  // 2. Skeleton Loading Animation logic
  useEffect(() => {
    let pulse;
    if (loading) {
      pulse = Animated.loop(
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
        ]),
      );
      pulse.start();
    }
    return () => {
      if (pulse) pulse.stop();
    };
  }, [loading]);

  // Helper para sa Emergency Alert Styles (High, Medium, Low)
  const getSeverityStyles = (severity) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-800",
          icon: "#dc2626",
          badge: "bg-red-100",
          badgeText: "text-red-700",
        };
      case "medium":
        return {
          bg: "bg-orange-50",
          border: "border-orange-200",
          text: "text-orange-800",
          icon: "#ea580c",
          badge: "bg-orange-100",
          badgeText: "text-orange-700",
        };
      default:
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-800",
          icon: "#2563eb",
          badge: "bg-blue-100",
          badgeText: "text-blue-700",
        };
    }
  };

  // HELPER PARA SA RESCUE STATUS ENUM
  // Mapping: ["none", "pending", "in_progress", "rescued", "cancelled"]
  const getRescueStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "rescued":
        return { 
            text: "RESCUED", 
            bg: "bg-emerald-100", 
            textColor: "text-emerald-700", 
            icon: "checkmark-circle" 
        };
      case "in_progress":
        return { 
            text: "IN PROGRESS", 
            bg: "bg-amber-100", 
            textColor: "text-amber-700", 
            icon: "time" 
        };
      case "pending":
        return { 
            text: "PENDING", 
            bg: "bg-blue-100", 
            textColor: "text-blue-700", 
            icon: "pause-circle" 
        };
      case "cancelled":
        return { 
            text: "CANCELLED", 
            bg: "bg-rose-100", 
            textColor: "text-rose-700", 
            icon: "close-circle" 
        };
      default:
        return { 
            text: "NONE", 
            bg: "bg-slate-100", 
            textColor: "text-slate-700", 
            icon: "help-circle" 
        };
    }
  };

  // Pagsamahin at i-sort ang lahat ng notification
  const combinedNotifications = useMemo(() => {
    const allNotifications = [];

    // Mapping para sa Rescued Households
    rescuedHouseholdsData.forEach((household) => {
      const statusStyle = getRescueStatusStyles(household.rescueStatus);
      allNotifications.push({
        id: household.id || household._id,
        type: "rescue",
        title: `Household: ${household.householdName}`,
        message: household.address,
        timestamp: household.rescuedAt || household.createdAt || new Date().toISOString(),
        data: household,
        badgeText: statusStyle.text,
        badgeColor: statusStyle.bg,
        badgeTextColor: statusStyle.textColor,
        statusIcon: statusStyle.icon,
      });
    });

    // Mapping para sa Emergency Alerts
    Notification.forEach((alert) => {
      const styles = getSeverityStyles(alert.meta?.severity);
      allNotifications.push({
        id: alert._id,
        type: "alert",
        title: alert.title,
        message: alert.message,
        severity: alert.meta?.severity?.toLowerCase() || "low",
        timestamp: alert.createdAt,
        data: alert,
        address: alert.address,
        badgeText: (alert.meta?.severity || "Alert").toUpperCase(),
        badgeColor: styles.badge,
        badgeTextColor: styles.badgeText,
      });
    });

    return allNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [rescuedHouseholdsData, Notification]);

  const SkeletonPulse = ({ style }) => (
    <Animated.View style={[style, { opacity: pulseAnim, backgroundColor: "#e5e7eb" }]} />
  );

  const renderSkeleton = () => [1, 2, 3].map((i) => (
    <View key={`skel-${i}`} className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <SkeletonPulse style={{ width: "60%", height: 20, borderRadius: 4 }} />
        <SkeletonPulse style={{ width: "20%", height: 24, borderRadius: 12 }} />
      </View>
      <SkeletonPulse style={{ width: "90%", height: 16, borderRadius: 4, marginBottom: 12 }} />
    </View>
  ));

  const renderNotificationItem = (item) => {
    const isRescue = item.type === "rescue";
    const alertStyles = getSeverityStyles(item.severity);

    return (
      <View
        key={item.id}
        className={`${isRescue ? "bg-white" : alertStyles.bg} rounded-xl border ${isRescue ? "border-slate-200" : alertStyles.border} p-4 mb-4 shadow-sm`}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <Ionicons 
              name={isRescue ? item.statusIcon : "warning"} 
              size={20} 
              color={isRescue ? "#334155" : alertStyles.icon} 
            />
            <Text className={`ml-2 font-bold flex-1 ${isRescue ? "text-slate-800" : alertStyles.text}`} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${item.badgeColor}`}>
            <Text className={`text-[10px] font-black ${item.badgeTextColor}`}>
              {item.badgeText}
            </Text>
          </View>
        </View>

        <Text className="text-sm text-slate-600 mb-3 leading-5">
          {item.message}
        </Text>

        <View className="flex-row justify-between items-center">
          <Text className="text-slate-400 text-[11px]">
            {new Date(item.timestamp).toLocaleDateString("en-PH", {
              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
            })}
          </Text>

          {isRescue && (
            <View className="flex-row space-x-2">
              <TouchableOpacity
                className="bg-cyan-600 rounded-lg px-3 py-2 flex-row items-center"
                onPress={() => handleRouteButtonPress(item.data)}
              >
                <Ionicons name="navigate" size={14} color="white" />
                <Text className="text-white text-xs font-bold ml-1">Route</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-slate-100 rounded-lg px-3 py-2"
                onPress={() => Alert.alert("Household Details", `Name: ${item.data.householdName}\nAddress: ${item.data.address}`)}
              >
                <Text className="text-slate-700 text-xs font-medium">Details</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (!notificationPanelVisible) return null;

  return (
    <Animated.View
      className="absolute top-0 right-0 h-full w-4/5 bg-slate-50"
      style={{
        transform: [{ translateX: notificationPanelTranslateX }],
        shadowColor: "#000",
        shadowOffset: { width: -5, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
        zIndex: 1000,
      }}
    >
      <View className="bg-cyan-800 px-6 pt-12 pb-6">
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-2xl font-black">Notification</Text>
          <TouchableOpacity onPress={closeNotificationPanel} className="bg-white/10 p-2 rounded-full">
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <View className="flex-row mt-4 space-x-2">
          <View className="bg-white/20 px-3 py-1 rounded-md">
            <Text className="text-white text-[10px] font-bold uppercase tracking-tighter">
              {combinedNotifications.length} Total
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {loading ? renderSkeleton() : combinedNotifications.map(renderNotificationItem)}
      </ScrollView>

      <View className="p-4 bg-white border-t border-slate-200">
        <TouchableOpacity 
          className="flex-row items-center justify-center py-3 bg-slate-100 rounded-xl"
          onPress={() => Alert.alert("Clear", "Feature coming soon.")}
        >
          <Ionicons name="trash-outline" size={18} color="#64748b" />
          <Text className="ml-2 text-slate-600 font-bold">Clear Notifications</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default NotificationPanel;