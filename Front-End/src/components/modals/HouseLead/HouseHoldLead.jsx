import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import {
  Ionicons,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

export default function HouseHoldLead({
  householdLeads,
  loading,
  fetchHouseholdMembers,
  onViewDetails,
  onAddHousehold,
  onEditHousehold,
  onToggleStatus,
}) {
  const [households, setHouseholds] = useState([]);
  const [stats, setStats] = useState({
    totalHouseholds: 0,
    totalMembers: 0,
    totalFamilyMembers: 0,
    activeHouseholds: 0,
  });
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    const data = Array.isArray(householdLeads) ? householdLeads : [];
    const householdsWithStatus = data.map((household) => ({
      ...household,
      status: household.status || "active",
    }));

    setHouseholds(householdsWithStatus);

    const totalHouseholds = householdsWithStatus.length;
    const totalMembers = householdsWithStatus.reduce(
      (sum, hh) => sum + (hh.totalMembers || 0),
      0
    );
    const totalFamilyMembers = householdsWithStatus.reduce(
      (sum, hh) => sum + (hh.familyMembers || 0),
      0
    );
    const activeHouseholds = householdsWithStatus.filter(
      (hh) => hh.status === "active"
    ).length;

    setStats({
      totalHouseholds,
      totalMembers,
      totalFamilyMembers,
      activeHouseholds,
    });
  }, [householdLeads]);

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

  // ==================== SKELETON COMPONENTS ====================

  const SkeletonStatsCard = ({ style = "" }) => (
    <View
      className={`bg-gray-100 rounded-xl p-4 mb-2 flex-1 mr-2 border border-gray-200 min-w-[30%] ${style}`}
    >
      <View className="flex-row items-center mb-2">
        <View className="w-5 h-5 bg-gray-300 rounded-lg" />
        <View className="w-10 h-3 bg-gray-300 rounded ml-2" />
      </View>
      <View className="w-12 h-8 bg-gray-300 rounded mb-1" />
      <View className="w-16 h-3 bg-gray-300 rounded" />
    </View>
  );

  const SkeletonHouseholdCard = () => (
    <View className="bg-white rounded-xl p-5 mb-3 mx-4 shadow-sm border border-gray-100">
      {/* Header Section */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center flex-1">
          <View className="w-12 h-12 bg-gray-200 rounded-xl" />
          <View className="ml-3 flex-1">
            <View className="w-24 h-3 bg-gray-200 rounded mb-1" />
            <View className="w-40 h-5 bg-gray-300 rounded" />
          </View>
        </View>
        <View className="flex-row items-center">
          <View className="w-16 h-6 bg-gray-200 rounded-full mr-2" />
          <View className="w-8 h-8 bg-gray-200 rounded-lg mr-2" />
          <View className="w-8 h-8 bg-gray-200 rounded-lg" />
        </View>
      </View>

      {/* Contact & Location Info */}
      <View className="mb-4">
        <View className="flex-row items-center mb-3">
          <View className="w-4 h-4 bg-gray-200 rounded" />
          <View className="w-32 h-3 bg-gray-200 rounded ml-3" />
        </View>
        <View className="flex-row items-start">
          <View className="w-4 h-4 bg-gray-200 rounded mt-1" />
          <View className="w-48 h-3 bg-gray-200 rounded ml-3" />
        </View>
      </View>

      {/* Barangay Badge */}
      <View className="mb-4">
        <View className="bg-gray-100 rounded-lg p-3">
          <View className="w-32 h-4 bg-gray-300 rounded" />
        </View>
      </View>

      {/* Stats Section */}
      <View className="border-t border-gray-100 pt-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            <View className="w-4 h-4 bg-gray-200 rounded" />
            <View className="ml-3">
              <View className="w-16 h-3 bg-gray-200 rounded mb-1" />
              <View className="w-8 h-5 bg-gray-300 rounded" />
            </View>
          </View>
          <View className="flex-row items-center flex-1">
            <View className="w-4 h-4 bg-gray-200 rounded" />
            <View className="ml-3">
              <View className="w-20 h-3 bg-gray-200 rounded mb-1" />
              <View className="w-24 h-4 bg-gray-300 rounded" />
            </View>
          </View>
        </View>
      </View>

      {/* Button */}
      <View className="rounded-lg p-3 mt-4 bg-gray-100 border border-gray-200">
        <View className="w-24 h-4 bg-gray-300 rounded mx-auto" />
      </View>
    </View>
  );

  // ==================== MAIN COMPONENTS ====================

  const renderHouseholdCard = ({ item }) => {
    if (showSkeleton) {
      return <SkeletonHouseholdCard />;
    }

    return (
      <View className="bg-white rounded-2xl p-6 mb-4 mx-5 shadow-lg border border-gray-100">
        {/* Header Section */}
        <View className="flex-row justify-between items-center mb-5">
          <View className="flex-row items-center flex-1">
            <View
              className={`p-4 rounded-xl ${
                item.status === "active"
                  ? "bg-gradient-to-br from-blue-600 to-indigo-600"
                  : "bg-gradient-to-br from-gray-500 to-gray-600"
              }`}
            >
              <MaterialCommunityIcons
                name="home-city"
                size={28}
                color="white"
              />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-xs text-blue-600 font-semibold mb-1 tracking-wide">
                HOUSEHOLD #{item.householdCode}
              </Text>
              <Text
                className="text-xl font-bold text-gray-900"
                numberOfLines={1}
              >
                {item.fullName}
              </Text>
            </View>
          </View>

          {/* Status Badge */}
          <View
            className={`px-4 py-2 rounded-full ${
              item.status === "active"
                ? "bg-green-100 border border-green-200"
                : "bg-gray-100 border border-gray-200"
            }`}
          >
            <Text
              className={`text-sm font-bold ${
                item.status === "active" ? "text-green-700" : "text-gray-600"
              }`}
            >
              {item.status === "active" ? "ACTIVE" : "INACTIVE"}
            </Text>
          </View>
        </View>

        {/* Contact & Location Info */}
        <View className="mb-5">
          <View className="flex-row items-center mb-3">
            <Ionicons
              name="call"
              size={18}
              color={item.status === "active" ? "#4f46e5" : "#9ca3af"}
            />
            <Text className="ml-3 text-gray-700 font-medium">
              {item.contactNumber || "No contact number"}
            </Text>
          </View>

          <View className="flex-row items-start">
            <Ionicons
              name="location"
              size={18}
              color={item.status === "active" ? "#4f46e5" : "#9ca3af"}
              style={{ marginTop: 2 }}
            />
            <Text className="ml-3 text-gray-600 flex-1">
              {item.address || "No address"}
            </Text>
          </View>
        </View>

        {/* Barangay Badge */}
        <View className="mb-5">
          <View
            className={`rounded-xl p-4 flex-row items-center border ${
              item.status === "active"
                ? "bg-blue-50 border-blue-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <MaterialCommunityIcons
              name="map-marker-radius"
              size={20}
              color={item.status === "active" ? "#4f46e5" : "#9ca3af"}
            />
            <Text className="ml-3 text-gray-800 font-semibold">
              Barangay {item.barangay || "Unknown"}
            </Text>
          </View>
        </View>

        {/* Stats Section */}
        <View className="border-t border-gray-100 pt-5">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center flex-1">
              <FontAwesome
                name="users"
                size={18}
                color={item.status === "active" ? "#4f46e5" : "#9ca3af"}
              />
              <View className="ml-3">
                <Text className="text-gray-500 text-sm font-medium">
                  Family Size
                </Text>
                <Text className="text-2xl font-bold text-gray-900">
                  {item.familyMembers || 0}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center flex-1">
              <Ionicons
                name="calendar"
                size={18}
                color={item.status === "active" ? "#4f46e5" : "#9ca3af"}
              />
              <View className="ml-3">
                <Text className="text-gray-500 text-sm font-medium">
                  Registered
                </Text>
                <Text className="text-gray-900 font-medium">
                  {formatDate(item.createdAt)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Professional Action Buttons */}
        <View className="flex-row space-x-3 mt-6">
          <TouchableOpacity
            onPress={() => onEditHousehold(item)}
            className="flex-1 bg-gray-100 rounded-xl p-4 flex-row items-center justify-center border border-gray-200 active:bg-gray-200"
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={18} color="#4b5563" />
            <Text className="text-gray-700 font-semibold ml-2">Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              onToggleStatus(item._id, item.fullName, item.status)
            }
            className={`flex-1 rounded-xl p-4 flex-row items-center justify-center border ${
              item.status === "active"
                ? "bg-amber-100 border-amber-200 active:bg-amber-200"
                : "bg-green-100 border-green-200 active:bg-green-200"
            }`}
            activeOpacity={0.7}
          >
            {item.status === "active" ? (
              <Ionicons name="power" size={18} color="#d97706" />
            ) : (
              <Ionicons name="power-outline" size={18} color="#059669" />
            )}
            <Text
              className={`font-semibold ml-2 ${
                item.status === "active" ? "text-amber-700" : "text-green-700"
              }`}
            >
              {item.status === "active" ? "Deactivate" : "Activate"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onViewDetails(item)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 flex-row items-center justify-center border border-blue-700 active:opacity-90"
            activeOpacity={0.8}
          >
            <Ionicons name="eye" size={18} color="white" />
            <Text className="text-white font-semibold ml-2">View</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-8">
      <View className="bg-gradient-to-br from-blue-50 to-indigo-50 p-10 rounded-2xl mb-8 border border-blue-100">
        <MaterialCommunityIcons
          name="home-city-outline"
          size={80}
          color="#4f46e5"
        />
      </View>
      <Text className="text-2xl font-bold text-gray-900 mb-3 text-center">
        No Households Found
      </Text>
      <Text className="text-gray-500 text-center mb-8 text-lg leading-7 max-w-md">
        Start by registering families for the housing program. Click the button
        below to add your first household.
      </Text>

      <TouchableOpacity
        onPress={onAddHousehold}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 rounded-xl flex-row items-center shadow-lg shadow-blue-500/30"
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle" size={24} color="white" />
        <Text className="text-white font-bold text-lg ml-3">
          Add First Household
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Main loading state
  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <View className="bg-gradient-to-r from-blue-600 to-indigo-700 pt-16 pb-8 px-6">
          <View className="mb-8">
            <View className="w-64 h-10 bg-blue-500/50 rounded mb-3" />
            <View className="w-48 h-4 bg-blue-500/50 rounded" />
          </View>

          <View className="flex-row justify-between flex-wrap">
            <SkeletonStatsCard />
            <SkeletonStatsCard style="mx-1" />
            <SkeletonStatsCard style="ml-2" />
          </View>
        </View>

        <View className="flex-1">
          <View className="px-6 py-5 border-b border-gray-200 bg-white">
            <View className="flex-row justify-between items-center">
              <View className="w-48 h-6 bg-gray-300 rounded" />
              <View className="flex-row">
                <View className="flex-row items-center mr-6">
                  <View className="w-4 h-4 bg-gray-300 rounded-full mr-3" />
                  <View className="w-20 h-4 bg-gray-200 rounded" />
                </View>
                <View className="flex-row items-center">
                  <View className="w-4 h-4 bg-gray-300 rounded-full mr-3" />
                  <View className="w-20 h-4 bg-gray-200 rounded" />
                </View>
              </View>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 120 }}
          >
            {[1, 2, 3, 4, 5].map((item) => (
              <SkeletonHouseholdCard key={item} />
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Professional Header with Gradient */}
      <View className="bg-gradient-to-r from-blue-600 to-indigo-700 pt-16 pb-8 px-6">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-white mb-2">
            Household Management
          </Text>
          <Text className="text-blue-100 text-lg">
            Housing Program Registry
          </Text>
        </View>

        {/* Enhanced Stats Cards */}
        <View className="flex-row justify-between flex-wrap">
          <View className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-3 flex-1 mr-3 border border-white/20 min-w-[30%]">
            <View className="flex-row items-center mb-3">
              <MaterialCommunityIcons
                name="home-group"
                size={24}
                color="white"
              />
              <Text className="text-white/90 text-sm font-semibold ml-3">
                TOTAL
              </Text>
            </View>
            <Text className="text-4xl font-bold text-white mb-2">
              {stats.totalHouseholds}
            </Text>
            <Text className="text-white/80 text-sm">Households</Text>
          </View>

          <View className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-3 flex-1 mx-1.5 border border-white/20 min-w-[30%]">
            <View className="flex-row items-center mb-3">
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color="white"
              />
              <Text className="text-white/90 text-sm font-semibold ml-3">
                ACTIVE
              </Text>
            </View>
            <Text className="text-4xl font-bold text-white mb-2">
              {stats.activeHouseholds}
            </Text>
            <Text className="text-white/80 text-sm">Active</Text>
          </View>

          <View className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-3 flex-1 ml-3 border border-white/20 min-w-[30%]">
            <View className="flex-row items-center mb-3">
              <MaterialCommunityIcons
                name="account-cancel"
                size={24}
                color="white"
              />
              <Text className="text-white/90 text-sm font-semibold ml-3">
                INACTIVE
              </Text>
            </View>
            <Text className="text-4xl font-bold text-white mb-2">
              {stats.totalHouseholds - stats.activeHouseholds}
            </Text>
            <Text className="text-white/80 text-sm">Inactive</Text>
          </View>
        </View>
      </View>

      {/* Household List Section */}
      <View className="flex-1">
        {households.length > 0 ? (
          <>
            <View className="px-6 py-5 border-b border-gray-200 bg-white">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-800 font-bold text-lg">
                  Registered Households ({households.length})
                </Text>
                <View className="flex-row">
                  <View className="flex-row items-center mr-6">
                    <View className="w-4 h-4 rounded-full bg-green-500 mr-3"></View>
                    <Text className="text-gray-600 font-medium">
                      Active: {stats.activeHouseholds}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-4 h-4 rounded-full bg-gray-400 mr-3"></View>
                    <Text className="text-gray-600 font-medium">
                      Inactive: {stats.totalHouseholds - stats.activeHouseholds}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <FlatList
              data={households}
              renderItem={renderHouseholdCard}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 20, paddingBottom: 120 }}
            />
          </>
        ) : (
          renderEmptyState()
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={onAddHousehold}
        className="absolute bottom-8 right-8 bg-gradient-to-br from-blue-600 to-indigo-600 w-20 h-20 rounded-full items-center justify-center shadow-2xl shadow-indigo-500/40 z-10"
        activeOpacity={0.9}
        style={{
          elevation: 12,
          shadowColor: "#4f46e5",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
        }}
      >
        <View className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}