import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome,
  FontAwesome5,
} from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const ViewHouseholdsModal = ({
  viewHouseholdModalVisible,
  setViewHouseholdModalVisible,
  selectedBarangay,
  setSelectedBarangay,
  searchHousehold,
  setSearchHousehold,
  barangayData,
  householdData,
  handleBackToBarangayList,
}) => {
  const renderBarangayItem = ({ item }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
      onPress={() => setSelectedBarangay(item)}
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
        <View className="bg-green-100 px-3 py-1 rounded-full">
          <Text className="text-green-800 text-sm font-semibold">
            {item.totalHouseholds} Households
          </Text>
        </View>
      </View>

      <View className="mb-2">
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-600 text-sm">Current Evacuation</Text>
          <Text className="text-blue-800 font-semibold">
            {item.currentEvacuation} people
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600 text-sm">Evacuation Capacity</Text>
          <Text className="text-gray-800 font-semibold">
            {item.evacuationCapacity} people
          </Text>
        </View>
      </View>

      <View className="w-full bg-gray-200 rounded-full h-2">
        <View
          className="bg-blue-500 h-2 rounded-full"
          style={{
            width: `${
              (item.currentEvacuation / item.evacuationCapacity) * 100
            }%`,
          }}
        />
      </View>
    </TouchableOpacity>
  );

  const renderHouseholdItem = ({ item }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800 mb-1">
            {item.householdHead}
          </Text>
          <Text className="text-gray-600 text-sm mb-2">{item.address}</Text>
        </View>
        <View
          className={`px-3 py-1 rounded-full ${
            item.status === "Registered"
              ? "bg-green-100"
              : item.status === "Evacuated"
              ? "bg-blue-100"
              : "bg-yellow-100"
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              item.status === "Registered"
                ? "text-green-800"
                : item.status === "Evacuated"
                ? "text-blue-800"
                : "text-yellow-800"
            }`}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between mb-3">
        <View className="items-center flex-1">
          <Text className="text-2xl font-bold text-purple-600">
            {item.familyMembers}
          </Text>
          <Text className="text-gray-600 text-xs text-center">
            Family Members
          </Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-xs font-semibold text-gray-700 text-center">
            Contact
          </Text>
          <Text className="text-gray-600 text-xs text-center">
            {item.contactNumber}
          </Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-xs font-semibold text-gray-700 text-center">
            Registered
          </Text>
          <Text className="text-gray-600 text-xs text-center">
            {item.registrationDate}
          </Text>
        </View>
      </View>

      <View className="flex-row space-x-2">
        <TouchableOpacity className="flex-1 bg-blue-50 py-2 rounded-lg items-center">
          <Text className="text-blue-600 text-xs font-semibold">
            View Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-green-50 py-2 rounded-lg items-center">
          <Text className="text-green-600 text-xs font-semibold">Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredHouseholds = selectedBarangay
    ? householdData[selectedBarangay.name]?.filter(
        (household) =>
          household.householdHead
            .toLowerCase()
            .includes(searchHousehold.toLowerCase()) ||
          household.address
            .toLowerCase()
            .includes(searchHousehold.toLowerCase())
      )
    : [];

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={viewHouseholdModalVisible}
      onRequestClose={() => {
        setViewHouseholdModalVisible(false);
        setSelectedBarangay(null);
        setSearchHousehold("");
      }}
    >
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pb-4 border-b border-gray-200">
          <View className="flex-row items-center flex-1">
            {selectedBarangay && (
              <TouchableOpacity
                onPress={handleBackToBarangayList}
                className="mr-3 p-2"
              >
                <Ionicons name="arrow-back" size={24} color="#6B7280" />
              </TouchableOpacity>
            )}
            <Text className="text-2xl font-bold text-gray-800 flex-1">
              {selectedBarangay
                ? `Households - ${selectedBarangay.name}`
                : "Select Barangay"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setViewHouseholdModalVisible(false);
              setSelectedBarangay(null);
              setSearchHousehold("");
            }}
            className="p-2"
          >
            <MaterialIcons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {!selectedBarangay ? (
          <View className="flex-1 p-4">
            <Text className="text-lg font-semibold text-gray-700 mb-4">
              Select a Barangay to view households
            </Text>
            <FlatList
              data={barangayData}
              renderItem={renderBarangayItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : (
          <View className="flex-1">
            <View className="px-4 py-3 border-b border-gray-200">
              <View className="bg-gray-100 rounded-2xl px-4 py-3 flex-row items-center">
                <FontAwesome name="search" size={16} color="#9CA3AF" />
                <TextInput
                  placeholder="Search households..."
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-gray-800"
                  value={searchHousehold}
                  onChangeText={setSearchHousehold}
                />
              </View>
            </View>

            <View className="bg-blue-50 p-4 mx-4 my-3 rounded-2xl border border-blue-100">
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-blue-800 font-semibold">
                    Total Households
                  </Text>
                  <Text className="text-2xl font-bold text-blue-900">
                    {filteredHouseholds.length}
                  </Text>
                </View>
                <View className="bg-blue-100 p-3 rounded-full">
                  <FontAwesome5 name="users" size={24} color="#1e40af" />
                </View>
              </View>
            </View>

            <FlatList
              data={filteredHouseholds}
              renderItem={renderHouseholdItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View className="items-center justify-center py-8">
                  <Text className="text-gray-500 text-lg">
                    No households found
                  </Text>
                </View>
              }
            />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default ViewHouseholdsModal;