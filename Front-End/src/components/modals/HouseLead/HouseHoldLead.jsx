import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  TextInput
} from "react-native";
import { useState, useEffect, useRef } from "react";
import {
  Ionicons,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function HouseHoldLead({
  householdLeads,
  loading,
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
  const [searchQuery, setSearchQuery] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    const data = Array.isArray(householdLeads) ? householdLeads : [];
    const filteredData = searchQuery
      ? data.filter(household =>
          household.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          household.householdCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          household.barangay?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : data;

    const householdsWithStatus = filteredData.map((household) => ({
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
  }, [householdLeads, searchQuery]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ==================== SKELETON COMPONENTS ====================
  const SkeletonStatsCard = () => (
    <View className="bg-white rounded-xl p-4 mb-3 flex-1 mx-1.5 min-w-[30%] shadow-sm">
      <View className="flex-row items-center mb-3">
        <View className="w-8 h-8 bg-gray-200 rounded-lg" />
        <View className="w-16 h-2 bg-gray-200 rounded ml-2" />
      </View>
      <View className="w-12 h-6 bg-gray-300 rounded mb-1" />
      <View className="w-16 h-2 bg-gray-200 rounded" />
    </View>
  );

  const SkeletonHouseholdCard = () => (
    <View className="bg-white rounded-xl p-4 mb-3 mx-4 shadow-sm">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <View className="w-40 h-4 bg-gray-200 rounded mb-2" />
          <View className="w-24 h-3 bg-gray-300 rounded" />
        </View>
        <View className="w-16 h-6 bg-gray-200 rounded-full" />
      </View>
      
      <View className="mb-3">
        <View className="flex-row items-center mb-2">
          <View className="w-4 h-4 bg-gray-200 rounded mr-2" />
          <View className="w-32 h-3 bg-gray-200 rounded" />
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-4 bg-gray-200 rounded mr-2" />
          <View className="w-48 h-3 bg-gray-200 rounded" />
        </View>
      </View>
      
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-4 h-4 bg-gray-200 rounded mr-2" />
          <View className="w-20 h-3 bg-gray-300 rounded" />
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-4 bg-gray-200 rounded mr-2" />
          <View className="w-24 h-3 bg-gray-200 rounded" />
        </View>
      </View>
      
      <View className="flex-row space-x-2">
        <View className="flex-1 h-10 bg-gray-200 rounded-lg" />
        <View className="flex-1 h-10 bg-gray-200 rounded-lg" />
        <View className="flex-1 h-10 bg-gray-200 rounded-lg" />
      </View>
    </View>
  );

  // ==================== MAIN COMPONENTS ====================
  const StatsCard = ({ icon, label, value, color, bgColor }) => (
    <Animated.View 
      style={{ opacity: fadeAnim }}
      className={`${bgColor} rounded-xl p-4 mb-3 flex-1 mx-1.5 min-w-[30%] shadow-sm`}
    >
      <View className="flex-row items-center mb-2">
        <View className={`p-2 rounded-lg ${color}`}>
          {icon}
        </View>
        <Text className="text-gray-600 text-xs font-medium ml-2">{label}</Text>
      </View>
      <Text className="text-2xl font-bold text-gray-900 mb-1">{value.toLocaleString()}</Text>
      <Text className="text-gray-500 text-xs">Households</Text>
    </Animated.View>
  );

  const SearchBar = () => (
    <View className="px-4 py-3 bg-white border-b border-gray-200">
      <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2.5">
        <Ionicons name="search" size={18} color="#6b7280" />
        <TextInput
          className="flex-1 ml-2 text-gray-800 text-base"
          placeholder="Search households..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")} className="p-1">
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  const renderHouseholdCard = ({ item, index }) => {
    if (showSkeleton) {
      return <SkeletonHouseholdCard />;
    }

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0]
            })
          }]
        }}
        className="bg-white rounded-xl p-4 mb-3 mx-4 shadow-sm"
      >
        {/* Header Section */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-blue-600 text-xs font-semibold mb-1">
              HH-{item.householdCode || "N/A"}
            </Text>
            <Text className="text-gray-900 font-bold text-base" numberOfLines={1}>
              {item.fullName || "Unnamed Household"}
            </Text>
          </View>
          <View
            className={`px-2 py-1 rounded-full ${
              item.status === "active"
                ? "bg-green-100"
                : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                item.status === "active" ? "text-green-700" : "text-gray-600"
              }`}
            >
              {item.status === "active" ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>

        {/* Details Section */}
        <View className="mb-3">
          <View className="flex-row items-center mb-2">
            <Ionicons name="call" size={14} color="#6b7280" />
            <Text className="ml-2 text-gray-700 text-sm">
              {item.contactNumber || "No contact"}
            </Text>
          </View>

          <View className="flex-row items-start">
            <Ionicons name="location" size={14} color="#6b7280" style={{ marginTop: 2 }} />
            <Text className="ml-2 text-gray-600 text-sm flex-1">
              {item.address || "No address"}
            </Text>
          </View>
        </View>

        {/* Stats and Barangay Section */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <FontAwesome name="users" size={14} color="#6b7280" />
            <View className="ml-2">
              <Text className="text-gray-500 text-xs">Family Size</Text>
              <Text className="text-gray-900 font-bold text-sm">
                {item.familyMembers || 0} members
              </Text>
            </View>
          </View>
          
          <View className="bg-blue-50 rounded-lg px-3 py-1.5">
            <Text className="text-blue-700 font-semibold text-xs">
              Brgy. {item.barangay || "Unknown"}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => onEditHousehold(item)}
            className="flex-1 bg-gray-100 rounded-lg p-2.5 flex-row items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={14} color="#4b5563" />
            <Text className="text-gray-700 font-medium text-sm ml-1.5">Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onToggleStatus(item._id, item.fullName, item.status)}
            className={`flex-1 rounded-lg p-2.5 flex-row items-center justify-center ${
              item.status === "active"
                ? "bg-amber-100"
                : "bg-green-100"
            }`}
            activeOpacity={0.7}
          >
            {item.status === "active" ? (
              <Ionicons name="power" size={14} color="#d97706" />
            ) : (
              <Ionicons name="power-outline" size={14} color="#059669" />
            )}
            <Text
              className={`font-medium text-sm ml-1.5 ${
                item.status === "active" ? "text-amber-700" : "text-green-700"
              }`}
            >
              {item.status === "active" ? "Deactivate" : "Activate"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onViewDetails(item)}
            className="flex-1 bg-cyan-600 rounded-lg p-2.5 flex-row items-center justify-center"
            activeOpacity={0.8}
          >
            <Ionicons name="eye" size={14} color="white" />
            <Text className="text-white font-medium text-sm ml-1.5">View</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-8">
      <View className="bg-blue-50 p-8 rounded-2xl mb-6">
        <MaterialCommunityIcons
          name="home-search"
          size={48}
          color="#3b82f6"
        />
      </View>
      <Text className="text-lg font-bold text-gray-900 mb-2 text-center">
        {searchQuery ? "No Results Found" : "No Households Yet"}
      </Text>
      <Text className="text-gray-500 text-center mb-6 text-sm leading-5 max-w-sm">
        {searchQuery
          ? "Try adjusting your search terms or filters"
          : "Start by adding your first household to the system"}
      </Text>

      <TouchableOpacity
        onPress={onAddHousehold}
        className="bg-blue-600 px-5 py-3 rounded-lg flex-row items-center"
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={18} color="white" />
        <Text className="text-white font-semibold text-sm ml-2">
          Add New Household
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Main loading state
  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Header Skeleton */}
        <View className="bg-cyan-800 pt-12 pb-6 px-4">
          <View className="mb-6">
            <View className="w-48 h-6 bg-blue-700 rounded mb-2" />
            <View className="w-36 h-3 bg-blue-700 rounded" />
          </View>

          <View className="flex-row justify-between">
            <SkeletonStatsCard />
            <SkeletonStatsCard />
            <SkeletonStatsCard />
          </View>
        </View>

        {/* Search Bar Skeleton */}
        <View className="px-4 py-3 bg-white border-b border-gray-200">
          <View className="w-full h-12 bg-gray-200 rounded-lg" />
        </View>

        {/* Household List Skeleton */}
        <View className="flex-1 pt-4">
          {[1, 2, 3].map((item) => (
            <SkeletonHouseholdCard key={item} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-cyan-600 pt-12 pb-6 px-4">
        <View className="mb-6">
          <Text className="text-xl font-bold text-white mb-1">
            Household Management
          </Text>
          <Text className="text-blue-200 text-sm">
            Manage and monitor housing beneficiaries
          </Text>
        </View>

        {/* Stats Cards */}
        <View className="flex-row justify-between">
          <StatsCard
            icon={<MaterialCommunityIcons name="home-group" size={18} color="white" />}
            label="Total"
            value={stats.totalHouseholds}
            color="bg-cyan-600"
            bgColor="bg-white"
          />
          
          <StatsCard
            icon={<MaterialCommunityIcons name="check-circle" size={18} color="white" />}
            label="Active"
            value={stats.activeHouseholds}
            color="bg-green-500"
            bgColor="bg-white"
          />
          
          <StatsCard
            icon={<MaterialCommunityIcons name="account-cancel" size={18} color="white" />}
            label="Inactive"
            value={stats.totalHouseholds - stats.activeHouseholds}
            color="bg-gray-500"
            bgColor="bg-white"
          />
        </View>
      </View>

      {/* Search Bar */}
      <SearchBar />

      {/* List Header */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-gray-900 font-bold">Households</Text>
            <Text className="text-gray-500 text-xs">
              {households.length} of {stats.totalHouseholds} shown
            </Text>
          </View>
          <View className="flex-row items-center space-x-4">
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
              <Text className="text-gray-600 text-xs">Active</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-gray-400 mr-1.5" />
              <Text className="text-gray-600 text-xs">Inactive</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Household List */}
      {households.length > 0 ? (
        <FlatList
          data={households}
          renderItem={renderHouseholdCard}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 12, paddingBottom: 80 }}
          ListEmptyComponent={renderEmptyState}
        />
      ) : (
        renderEmptyState()
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={onAddHousehold}
        className="absolute bottom-6 right-6 bg-cyan-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        activeOpacity={0.9}
        style={{
          elevation: 8,
          shadowColor: "#3b82f6",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}