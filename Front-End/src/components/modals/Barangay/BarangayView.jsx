import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { EvacuationDisplayContext } from "../../../contexts/EvacuationContext/EvacuationContext";
import { HouseholdContext } from "../../../contexts/HouseholdLeadContext/HouseholdContext";
import { HouseHoldMemberContext } from "../../../contexts/HouseHoldMemberContext/HouseHoldMemberContext";
import { MunicipalityContext } from "../../../contexts/MunicipalityContext/MunicipalityContext";
import HouseHold from "../HouseHold";
import EvacuationCenters from "./EvacuationCenter";
import StatusModal from "../SuccessFailed/SuccessFailedModal";

const BarangayView = ({
  selectedMunicipality,
  barangaysList,
  handleBack,
  handleAddBarangay,
  handleCancel,
  onEditBarangay,
  onViewHousehold,
  deleteBarangay,
  fetchBarangays,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [showEvacuationView, setShowEvacuationView] = useState(false);

  const [statusVisible, setStatusVisible] = useState(false);
  const [statusType, setStatusType] = useState("success");
  const [statusMessage, setStatusMessage] = useState("");

  // State for household view
  const [showHouseholdView, setShowHouseholdView] = useState(false);

  // Local state para sa search
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { evacuations, deleteEvacuation } = useContext(
    EvacuationDisplayContext
  );
  const { fetchHouseholdLeads, householdLeads } = useContext(HouseholdContext);
  const {
    fetchHouseholdMembers,
    householdMembers,
    loading,
    setLoading,
    updateHouseholdMemberStatus,
  } = useContext(HouseHoldMemberContext);

  // Debounce effect para sa search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  // Effect para tawagin ang fetchBarangays
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedMunicipality || typeof fetchBarangays !== "function") return;
      await fetchBarangays(debouncedSearch, 1);
    };

    fetchData();
  }, [debouncedSearch, selectedMunicipality, fetchBarangays]);

  const getDisplayBarangayName = (barangay) => {
    if (barangay.barangayName && barangay.barangayName.trim() !== "") {
      return barangay.barangayName;
    }
    if (barangay.fullAddress) {
      const parts = barangay.fullAddress.split(",");
      if (parts.length > 0) {
        return parts[0].trim();
      }
    }
    return "Unnamed Barangay";
  };

  const openMenu = (barangay) => {
    setSelectedBarangay(barangay);
    setMenuVisible(true);
  };

  const handleEdit = () => {
    if (selectedBarangay && onEditBarangay) {
      setMenuVisible(false);
      onEditBarangay({
        barangayData: selectedBarangay,
        municipality: selectedMunicipality,
      });
    }
  };

  const handleDelete = () => {
    if (!selectedBarangay) return;

    setMenuVisible(false);

    Alert.alert(
      "Delete Barangay",
      `Are you sure you want to delete ${getDisplayBarangayName(
        selectedBarangay
      )}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteBarangay(selectedBarangay._id);
              if (result.success) {
                setStatusType("success");
                setStatusMessage("Barangay deleted successfully.");
              } else {
                setStatusType("error");
                setStatusMessage(result.error || "Failed to delete barangay.");
              }

              setStatusVisible(true);

              if (
                selectedMunicipality &&
                typeof fetchBarangays === "function"
              ) {
                await fetchBarangays({
                  municipality: selectedMunicipality._id,
                  search: debouncedSearch,
                });
              }
            } catch (error) {
              console.error("Delete failed:", error);
              setStatusType("error");
              setStatusMessage("Something went wrong. Please try again.");
              setStatusVisible(true);
            }
          },
        },
      ]
    );
  };

  const handleViewHousehold = async () => {
    if (!selectedBarangay) {
      Alert.alert("Error", "No barangay selected");
      return;
    }

    setMenuVisible(false);

    try {
      await fetchHouseholdLeads({
        selectedBarangayId: selectedBarangay._id,
        municipalityId: selectedMunicipality._id,
      });
    } catch (error) {
      console.error("Error fetching household leads:", error);
      Alert.alert("Warning", "Household data might not be up to date.");
    }

    if (onViewHousehold && typeof onViewHousehold === "function") {
      onViewHousehold(selectedBarangay);
    } else {
      setShowHouseholdView(true);
    }
  };

  const handleViewEvacuationClick = async () => {
    if (!selectedBarangay) {
      Alert.alert("Error", "No barangay selected");
      return;
    }

    setMenuVisible(false);
    setShowEvacuationView(true);
  };

  const renderBarangayCard = ({ item }) => {
    const barangayEvacuationCount = evacuations.filter(
      (evac) =>
        evac.barangay &&
        evac.barangay.municipality === selectedMunicipality._id &&
        evac.barangay.barangayName === item.barangayName
    ).length;

    return (
      <View className="p-5 bg-white border border-gray-100 rounded-xl mb-3 shadow-sm">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
                <MaterialIcons name="place" size={18} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800">
                  {getDisplayBarangayName(item)}
                </Text>
                {item.isCapital && (
                  <View className="bg-yellow-100 px-2 py-1 rounded-full self-start mt-1">
                    <Text className="text-yellow-800 text-xs font-medium">
                      Municipal Capital
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <Text className="text-sm text-gray-500 ml-11">
              {item.fullAddress ||
                `${getDisplayBarangayName(item)}, ${
                  selectedMunicipality.name
                }, Biliran, Philippines`}
            </Text>
          </View>
          <TouchableOpacity className="p-2" onPress={() => openMenu(item)}>
            <MaterialIcons name="more-vert" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        <View className="ml-11 mt-3 flex-row items-center">
          <View className="flex-row items-center mr-4">
            <MaterialIcons name="calendar-today" size={14} color="#6B7280" />
            <Text className="text-gray-500 text-xs ml-1">
              Added:{" "}
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : "Unknown date"}
            </Text>
          </View>
          <View className="flex-row items-center">
            <MaterialIcons name="safety-divider" size={14} color="#6B7280" />
            <Text className="text-gray-500 text-xs ml-1">
              {barangayEvacuationCount} evacuation centers
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (!selectedMunicipality) {
    return (
      <View className="flex-1 justify-center items-center">
        <MaterialIcons name="error-outline" size={48} color="#EF4444" />
        <Text className="text-red-500 text-lg font-medium mt-4">
          No municipality selected
        </Text>
        <TouchableOpacity
          onPress={handleBack}
          className="mt-6 px-6 py-3 bg-cyan-600 rounded-xl"
        >
          <Text className="text-white font-semibold">
            Go back to municipalities
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render HouseHold component when household view is active
  if (showHouseholdView && selectedBarangay) {
    return (
      <>
        <HouseHold
          selectedBarangay={selectedBarangay}
          selectedMunicipality={selectedMunicipality}
          onBack={() => setShowHouseholdView(false)}
          householdLeads={householdLeads}
          fetchHouseholdMembers={fetchHouseholdMembers}
          householdMembers={householdMembers}
          loading={loading}
          setLoading={setLoading}
          updateHouseholdMemberStatus={updateHouseholdMemberStatus}
        />
        <TouchableOpacity
          className="absolute top-4 left-4 z-10 bg-white p-2 rounded-full shadow-md"
          onPress={() => setShowHouseholdView(false)}
        >
          <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
        </TouchableOpacity>
      </>
    );
  }

  // Render EvacuationCenters component when evacuation view is active
  if (showEvacuationView && selectedBarangay) {
    return (
      <EvacuationCenters
        selectedBarangay={selectedBarangay}
        selectedMunicipality={selectedMunicipality}
        getDisplayBarangayName={getDisplayBarangayName}
        onBack={() => setShowEvacuationView(false)}
      />
    );
  }

  // Main BarangayView render
  const municipalityEvacuationCount = evacuations.filter(
    (evac) =>
      evac.barangay && evac.barangay.municipality === selectedMunicipality._id
  ).length;

  return (
    <>
      <View className="px-6 pt-4 pb-3 border-b border-gray-100 bg-white">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-800">
              {selectedMunicipality.name || "Barangays"}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              {selectedMunicipality.name
                ? `Browse barangays in ${selectedMunicipality.name}`
                : "Select a municipality"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCancel}
            className="p-2 rounded-lg bg-gray-50 ml-4"
          >
            <MaterialIcons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-6 py-4">
        <View className="relative">
          <MaterialIcons
            name="search"
            size={20}
            color="#9CA3AF"
            style={{ position: "absolute", left: 16, top: 16, zIndex: 10 }}
          />
          <TextInput
            className="bg-white p-4 pl-12 rounded-xl border border-gray-200 text-base"
            placeholder="Search barangays..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              className="absolute right-4 top-4"
            >
              <MaterialIcons name="cancel" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Search indicator */}
        {debouncedSearch.length > 0 && (
          <View className="mt-2 flex-row items-center">
            <Text className="text-gray-500 text-xs">
              Searching for: "{debouncedSearch}"
            </Text>
          </View>
        )}
      </View>

      <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-100 bg-white">
        <TouchableOpacity
          onPress={handleBack}
          className="px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 flex-row items-center"
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={20} color="#4B5563" />
          <Text className="text-gray-700 font-medium ml-2">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="px-5 py-2.5 bg-cyan-600 rounded-xl flex-row items-center shadow-sm"
          onPress={handleAddBarangay}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Add Barangay</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={barangaysList || []}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        renderItem={renderBarangayCard}
        ListHeaderComponent={
          <View className="px-6 pt-6 pb-4">
            <Text className="text-lg font-semibold text-gray-700 mb-2">
              Barangays in {selectedMunicipality.name}
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-cyan-100 items-center justify-center mr-2">
                  <MaterialIcons name="apartment" size={14} color="#0891B2" />
                </View>
                <Text className="text-cyan-600 font-medium">
                  {(barangaysList || []).length} barangay
                  {(barangaysList || []).length !== 1 ? "s" : ""}
                </Text>
              </View>
              <View className="flex-row space-x-4">
                <View className="flex-row items-center">
                  <MaterialIcons
                    name="safety-divider"
                    size={14}
                    color="#6B7280"
                  />
                  <Text className="text-gray-600 text-xs ml-1">
                    {municipalityEvacuationCount} evacuation centers
                  </Text>
                </View>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="px-6 py-10 items-center">
            <MaterialIcons name="location-city" size={64} color="#E5E7EB" />
            <Text className="text-gray-400 text-lg font-medium mt-4">
              No barangays found
            </Text>
            <Text className="text-gray-400 text-center mt-2 px-10">
              {search
                ? "No barangays match your search. Try a different term."
                : `No barangays registered in ${selectedMunicipality.name} yet.`}
            </Text>
            {!search && (
              <TouchableOpacity
                onPress={handleAddBarangay}
                className="mt-6 px-6 py-3 bg-cyan-600 rounded-xl"
              >
                <Text className="text-white font-semibold">
                  Add First Barangay
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 30 }}
      />

      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View className="bg-white rounded-t-3xl overflow-hidden">
            {selectedBarangay && (
              <View className="p-5 border-b border-gray-200">
                <View className="flex-row items-start">
                  <View className="w-10 h-10 rounded-full bg-cyan-100 items-center justify-center mr-3">
                    <MaterialIcons name="place" size={20} color="#0891B2" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800">
                      {getDisplayBarangayName(selectedBarangay)}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1">
                      {selectedMunicipality.name}, Biliran
                    </Text>
                  </View>
                </View>
              </View>
            )}
            <View className="py-2">
              <TouchableOpacity
                className="flex-row items-center px-5 py-4 active:bg-gray-50"
                onPress={handleEdit}
              >
                <View className="w-8 h-8 rounded-full bg-cyan-100 items-center justify-center mr-3">
                  <MaterialIcons name="edit" size={18} color="#0891B2" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium">
                    Edit Barangay
                  </Text>
                  <Text className="text-gray-500 text-xs mt-0.5">
                    Update barangay information and location
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center px-5 py-4 active:bg-gray-50 border-t border-gray-100"
                onPress={handleViewHousehold}
              >
                <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
                  <MaterialIcons name="home" size={18} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium">
                    Household Management
                  </Text>
                  <Text className="text-gray-500 text-xs mt-0.5">
                    View and manage households in this barangay
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center px-5 py-4 active:bg-gray-50 border-t border-gray-100"
                onPress={handleViewEvacuationClick}
              >
                <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center mr-3">
                  <MaterialIcons
                    name="safety-divider"
                    size={18}
                    color="#F97316"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium">
                    Evacuation Centers
                  </Text>
                  <Text className="text-gray-500 text-xs mt-0.5">
                    View and manage evacuation centers
                  </Text>
                </View>
                {(() => {
                  const evacuationCount = evacuations.filter(
                    (evac) =>
                      evac.barangay &&
                      evac.barangay.municipality === selectedMunicipality._id &&
                      evac.barangay.barangayName ===
                        selectedBarangay?.barangayName
                  ).length;
                  if (evacuationCount > 0) {
                    return (
                      <View className="bg-orange-100 px-2 py-1 rounded-full">
                        <Text className="text-orange-800 text-xs font-medium">
                          {evacuationCount}
                        </Text>
                      </View>
                    );
                  }
                })()}
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center px-5 py-4 active:bg-gray-50 border-t border-gray-100"
                onPress={handleDelete}
              >
                <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center mr-3">
                  <MaterialIcons name="delete" size={18} color="#EF4444" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium">
                    Delete Barangay
                  </Text>
                  <Text className="text-gray-500 text-xs mt-0.5">
                    Remove barangay from the system
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              className="border-t border-gray-200 p-4 items-center"
              onPress={() => setMenuVisible(false)}
            >
              <Text className="text-gray-600 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      <StatusModal
        visible={statusVisible}
        type={statusType}
        message={statusMessage}
        onClose={() => setStatusVisible(false)}
      />
    </>
  );
};

export default BarangayView;
