import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const EvacuationListView = ({
  evacuationData,
  barangayName,
  municipalityName,
  searchQuery,
  onSearchChange,
  onAddEvacuation,
  onViewMap,
  onViewEvacuationDetails,
  onEditEvacuation,
  onDeleteEvacuation,
  onViewEvacuationOnMap,
}) => {
  const calculateStats = () => {
    const totalCapacity = evacuationData.reduce((sum, evac) => sum + (evac.evacuationCapacity || 0), 0);
    const totalCurrent = evacuationData.reduce((sum, evac) => sum + (evac.currentEvacuation || 0), 0);
    const totalAvailable = evacuationData.reduce((sum, evac) => sum + (evac.availableCapacity || 0), 0);
    const activeCenters = evacuationData.filter(evac => evac.isActive).length;
    const fullCenters = evacuationData.filter(evac => evac.status === "Full").length;
    
    return {
      totalCapacity,
      totalCurrent,
      totalAvailable,
      activeCenters,
      fullCenters
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Full": return "#EF4444";
      case "High": return "#F97316";
      case "Available": return "#10B981";
      case "No Capacity": return "#6B7280";
      default: return "#6B7280";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "Full": return "bg-red-100";
      case "High": return "bg-orange-100";
      case "Available": return "bg-green-100";
      case "No Capacity": return "bg-gray-100";
      default: return "bg-gray-100";
    }
  };

  const filteredEvacuationData = evacuationData.filter(evac =>
    (evac.evacuationName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (evac.location?.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (evac.contactPerson?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (evac.status || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = calculateStats();

  const handleViewOnMap = (item) => {
    if (onViewEvacuationOnMap) {
      onViewEvacuationOnMap(item);
    } else {
      Alert.alert(
        "Function Not Available",
        "View on Map functionality is not available. Please check if the parent component has provided this function.",
        [{ text: "OK" }]
      );
    }
  };

  const renderEvacuationCard = ({ item, index }) => {
    const currentEvacuation = item.currentEvacuation || 0;
    const evacuationCapacity = item.evacuationCapacity || 0;
    const percentage = evacuationCapacity > 0 
      ? (currentEvacuation / evacuationCapacity) * 100 
      : 0;
    
    const status = item.status || "No Capacity";
    const statusColor = getStatusColor(status);
    const statusBgColor = getStatusBgColor(status);
    
    return (
      <TouchableOpacity
        onPress={() => onViewEvacuationDetails && onViewEvacuationDetails(item)}
        activeOpacity={0.8}
      >
        <View className={`p-4 bg-white border ${item.isActive ? 'border-gray-200' : 'border-gray-300'} rounded-xl mb-3 shadow-sm`}>
          {!item.isActive && (
            <View className="absolute top-2 right-2 z-10">
              <View className="bg-gray-100 px-2 py-1 rounded-full">
                <Text className="text-gray-600 text-xs font-medium">Inactive</Text>
              </View>
            </View>
          )}
          
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center mr-3">
                  <Text className="text-orange-700 font-bold">{index + 1}</Text>
                </View>
                <View className="flex-1">
                  <Text className={`text-lg font-semibold ${item.isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                    {item.evacuationName || item.location?.address?.split(',')[0] || "Unnamed Center"}
                  </Text>
                  <Text className={`text-sm mt-1 ${item.isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                    Evacuation Center
                  </Text>
                </View>
              </View>
              <Text className={`text-sm mb-2 ml-11 ${item.isActive ? 'text-gray-500' : 'text-gray-400'}`}>
                {item.location?.address || "No address provided"}
              </Text>
            </View>
            
            <View className={`px-3 py-1 rounded-full ${statusBgColor}`}>
              <Text className={`text-xs font-medium`} style={{ color: statusColor }}>
                {status}
              </Text>
            </View>
          </View>

          <View className="ml-11 mb-3">
            <View className="flex-row items-center mb-2">
              <View className="w-32">
                <Text className={`text-sm ${item.isActive ? 'text-gray-600' : 'text-gray-400'}`}>Capacity:</Text>
              </View>
              <View className="flex-1">
                <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  {evacuationCapacity > 0 ? (
                    <View 
                      className={`h-full ${percentage >= 90 ? 'bg-red-500' : percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  ) : (
                    <View className="h-full bg-gray-400" style={{ width: '100%' }} />
                  )}
                </View>
                <View className="flex-row justify-between mt-1">
                  <Text className={`text-xs ${item.isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                    {currentEvacuation} / {evacuationCapacity || 'N/A'}
                  </Text>
                  {evacuationCapacity > 0 && (
                    <Text className={`text-xs ${item.isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                      {percentage.toFixed(1)}%
                    </Text>
                  )}
                </View>
                {(item.availableCapacity || 0) > 0 && (
                  <Text className={`text-xs mt-1 ${item.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                    Available: {item.availableCapacity} spots
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View className="ml-11 mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialIcons name="location-on" size={14} color={item.isActive ? "#6B7280" : "#9CA3AF"} />
              <Text className={`text-xs ml-1 ${item.isActive ? 'text-gray-500' : 'text-gray-400'}`}>
                Lat: {item.location?.latitude?.toFixed(4) || "N/A"}, 
                Long: {item.location?.longitude?.toFixed(4) || "N/A"}
              </Text>
            </View>
          </View>

          {item.contactPerson && (
            <View className="ml-11 border-t border-gray-100 pt-3">
              <View className="flex-row items-center mb-2">
                <MaterialIcons name="person" size={16} color={item.isActive ? "#6B7280" : "#9CA3AF"} />
                <Text className={`text-sm ml-2 ${item.isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                  {item.contactPerson.name || "N/A"}
                </Text>
              </View>
              <View className="flex-row items-center mb-2">
                <MaterialIcons name="phone" size={16} color={item.isActive ? "#6B7280" : "#9CA3AF"} />
                <Text className={`text-sm ml-2 ${item.isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                  {item.contactPerson.contactNumber || "N/A"}
                </Text>
              </View>
              {item.contactPerson.email && (
                <View className="flex-row items-center">
                  <MaterialIcons name="email" size={16} color={item.isActive ? "#6B7280" : "#9CA3AF"} />
                  <Text className={`text-sm ml-2 ${item.isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                    {item.contactPerson.email}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View className="ml-11 mt-3 pt-3 border-t border-gray-100">
            <Text className={`text-xs mb-1 ${item.isActive ? 'text-gray-500' : 'text-gray-400'}`}>
              Total Households: {item.totalHouseholds || 0}
            </Text>
            <Text className={`text-xs ${item.isActive ? 'text-gray-500' : 'text-gray-400'}`}>
              Added: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown'}
            </Text>
          </View>

          <View className="ml-11 mt-3 pt-3 border-t border-gray-100 flex-row justify-end space-x-2">
            {onEditEvacuation && (
              <TouchableOpacity
                className="px-3 py-1.5 bg-cyan-50 rounded-lg"
                onPress={() => onEditEvacuation(item)}
                activeOpacity={0.7}
              >
                <Text className="text-cyan-600 text-xs font-medium">Edit</Text>
              </TouchableOpacity>
            )}
            
            {onDeleteEvacuation && (
              <TouchableOpacity
                className="px-3 py-1.5 bg-red-50 rounded-lg"
                onPress={() => {
                  Alert.alert(
                    "Delete Evacuation Center",
                    `Are you sure you want to delete ${item.evacuationName || item.location?.address?.split(',')[0] || "this evacuation center"}?`,
                    [
                      { text: "Cancel", style: "cancel" },
                      { 
                        text: "Delete", 
                        style: "destructive",
                        onPress: () => onDeleteEvacuation(item)
                      }
                    ]
                  );
                }}
                activeOpacity={0.7}
              >
                <Text className="text-red-600 text-xs font-medium">Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 pt-4 pb-3 border-b border-gray-100 bg-white">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-800">
              Evacuation Centers
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              {barangayName}, {municipalityName}
            </Text>
          </View>
        </View>
      </View>

      <View className="px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center mr-3">
              <MaterialIcons name="safety-divider" size={22} color="#F97316" />
            </View>
            <View>
              <Text className="text-lg font-semibold text-gray-800">
                {evacuationData.length} Evacuation Center{evacuationData.length !== 1 ? 's' : ''}
              </Text>
              <Text className="text-gray-500 text-sm">
                {stats.activeCenters} active, {stats.fullCenters} full
              </Text>
            </View>
          </View>
          
          <View className="flex-row space-x-3">
            <View className="items-center">
              <View className="w-8 h-8 rounded-full bg-cyan-100 items-center justify-center">
                <Text className="text-cyan-700 font-bold text-sm">
                  {stats.totalCurrent}
                </Text>
              </View>
              <Text className="text-gray-600 text-xs mt-1">Occupied</Text>
            </View>
            <View className="items-center">
              <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center">
                <Text className="text-green-700 font-bold text-sm">
                  {stats.totalAvailable}
                </Text>
              </View>
              <Text className="text-gray-600 text-xs mt-1">Available</Text>
            </View>
            <View className="items-center">
              <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                <Text className="text-gray-700 font-bold text-sm">
                  {stats.totalCapacity}
                </Text>
              </View>
              <Text className="text-gray-600 text-xs mt-1">Total Cap.</Text>
            </View>
          </View>
        </View>

        <View className="bg-cyan-50 p-3 rounded-lg">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-cyan-800 font-medium">Overall Capacity</Text>
            <Text className="text-cyan-800 text-sm">
              {stats.totalCapacity > 0 
                ? `${((stats.totalCurrent / stats.totalCapacity) * 100).toFixed(1)}% occupied`
                : 'No capacity data'
              }
            </Text>
          </View>
          <View className="h-2 bg-cyan-200 rounded-full overflow-hidden">
            {stats.totalCapacity > 0 && (
              <View 
                className="h-full bg-cyan-600"
                style={{ width: `${Math.min(100, (stats.totalCurrent / stats.totalCapacity) * 100)}%` }}
              />
            )}
          </View>
        </View>
      </View>

      <View className="px-6 py-4">
        <View className="relative">
          <MaterialIcons 
            name="search" 
            size={20} 
            color="#9CA3AF" 
            style={{ position: 'absolute', left: 16, top: 16, zIndex: 10 }}
          />
          <TextInput
            className="bg-white p-4 pl-12 rounded-xl border border-gray-200 text-base"
            placeholder="Search by name, address, contact person, or status..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => onSearchChange("")}
              className="absolute right-4 top-4"
              activeOpacity={0.7}
            >
              <MaterialIcons name="cancel" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-100 bg-white">
        <TouchableOpacity
          className="px-4 py-2.5 bg-cyan-600 rounded-xl flex-row items-center"
          onPress={onAddEvacuation}
          activeOpacity={0.7}
        >
          <MaterialIcons name="add" size={20} color="white" />
          <Text className="text-white font-medium ml-2">Add Evacuation Center</Text>
        </TouchableOpacity>

        <View className="flex-row space-x-2">
          <TouchableOpacity
            className="px-4 py-2.5 bg-green-600 rounded-xl flex-row items-center"
            onPress={onViewMap}
            activeOpacity={0.7}
          >
            <MaterialIcons name="map" size={20} color="white" />
            <Text className="text-white font-medium ml-2">View Map</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="px-4 py-2.5 bg-gray-100 rounded-xl border border-gray-300 flex-row items-center"
            onPress={() => Alert.alert("Info", "Generate Report functionality would be implemented here")}
            activeOpacity={0.7}
          >
            <MaterialIcons name="assessment" size={20} color="#4B5563" />
            <Text className="text-gray-700 font-medium ml-2">Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-6 py-3 bg-white border-b border-gray-100">
        <Text className="text-gray-600 text-sm font-medium mb-2">Status Legend:</Text>
        <View className="flex-row flex-wrap gap-2">
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-green-500 mr-1" />
            <Text className="text-gray-600 text-xs">Available (&lt;70%)</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-yellow-500 mr-1" />
            <Text className="text-gray-600 text-xs">High (70-89%)</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-red-500 mr-1" />
            <Text className="text-gray-600 text-xs">Full (≥90%)</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-gray-400 mr-1" />
            <Text className="text-gray-600 text-xs">No Capacity</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredEvacuationData}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
        renderItem={renderEvacuationCard}
        ListEmptyComponent={
          <View className="px-6 py-10 items-center">
            <MaterialIcons name="safety-divider" size={64} color="#E5E7EB" />
            <Text className="text-gray-400 text-lg font-medium mt-4">
              No evacuation centers found
            </Text>
            <Text className="text-gray-400 text-center mt-2 px-10">
              {searchQuery 
                ? "No evacuation centers match your search."
                : `No evacuation centers registered in ${barangayName} yet.`
              }
            </Text>
            {!searchQuery && onAddEvacuation && (
              <TouchableOpacity
                onPress={onAddEvacuation}
                className="mt-6 px-6 py-3 bg-cyan-600 rounded-xl"
                activeOpacity={0.7}
              >
                <Text className="text-white font-semibold">
                  Add First Evacuation Center
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 30 }}
      />
    </View>
  );
};

export default EvacuationListView;