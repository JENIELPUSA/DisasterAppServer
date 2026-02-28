import React, { useState, useContext, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { EvacuationDisplayContext } from "../../../contexts/EvacuationContext/EvacuationContext";
import { MunicipalityContext } from "../../../contexts/MunicipalityContext/MunicipalityContext";
import EvacuationForm from "./EvacuationForm";
import EvacuationMapView from "./EvacuationMapView";
import EvacuationListView from "./EvacuationListView";
import StatusModal from "../SuccessFailed/SuccessFailedModal";

const EvacuationCenters = ({
  selectedBarangay,
  selectedMunicipality,
  getDisplayBarangayName,
  onBack,
}) => {
  const [showAddEvacuationForm, setShowAddEvacuationForm] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [showAddLocationMap, setShowAddLocationMap] = useState(false);
  const [evacuationSearch, setEvacuationSearch] = useState("");
  const [selectedEvacuation, setSelectedEvacuation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [editingEvacuation, setEditingEvacuation] = useState(null);

  const [statusVisible, setStatusVisible] = useState(false);
  const [statusType, setStatusType] = useState("success");
  const [statusMessage, setStatusMessage] = useState("");

  const {
    AddEvacuation,
    updateEvacuation,
    deleteEvacuation,
    fetchEvacuationsInBarangay,
    EvacuationsInbarangay,
  } = useContext(EvacuationDisplayContext);

  const { municipalities } = useContext(MunicipalityContext);

  const [evacuationData, setEvacuationData] = useState([]);

  // Initialize evacuation data
  useEffect(() => {
    if (selectedBarangay) {
      fetchEvacuationsInBarangay(selectedBarangay._id);
    }
  }, [selectedBarangay]);

  // Process evacuation data
  useEffect(() => {
    if (EvacuationsInbarangay && EvacuationsInbarangay.length > 0) {
      const processed = processEvacuationData(EvacuationsInbarangay);
      setEvacuationData(processed);
    }
  }, [EvacuationsInbarangay]);

  const getEvacuationStatus = (currentEvacuation, evacuationCapacity) => {
    if (!evacuationCapacity || evacuationCapacity === 0) return "No Capacity";
    const percentage = (currentEvacuation / evacuationCapacity) * 100;
    if (percentage >= 90) return "Full";
    if (percentage >= 70) return "High";
    return "Available";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Full":
        return "#EF4444";
      case "High":
        return "#F97316";
      case "Available":
        return "#10B981";
      case "No Capacity":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  const processEvacuationData = (rawEvacuations) => {
    return rawEvacuations
      .filter((evac) => evac.barangay)
      .map((evac) => {
        const currentEvacuation = evac.totalHouseholds || 0;
        const evacuationCapacity = evac.evacuationCapacity || 0;
        const percentage =
          evacuationCapacity > 0
            ? (currentEvacuation / evacuationCapacity) * 100
            : 0;
        const availableCapacity = Math.max(
          evacuationCapacity - currentEvacuation,
          0
        );
        const status = getEvacuationStatus(
          currentEvacuation,
          evacuationCapacity
        );
        return {
          ...evac,
          currentEvacuation,
          evacuationPercentage: percentage,
          availableCapacity,
          status,
          statusColor: getStatusColor(status),
        };
      });
  };

  const handleEvacuationSubmit = async (formData) => {
    try {
      if (editingEvacuation) {
        // UPDATE EXISTING EVACUATION
        const updatedEvacuation = {
          ...formData,
          barangay: selectedBarangay,
          municipality: selectedMunicipality._id,
          updatedAt: new Date().toISOString(),
          createdAt: editingEvacuation.createdAt || new Date().toISOString(),
        };
        const result = await updateEvacuation(
          updatedEvacuation._id,
          updatedEvacuation
        );
        if (result.success) {
          setStatusType("success");
          setStatusMessage("The data has been successfully removed!");
          // Auto-reset after delay
          setTimeout(() => {
            setStatusVisible(true);
          }, 1000);
        } else {
          setStatusType("error");
          setStatusMessage(result.error || "Sending failed!");
          setStatusVisible(true);
        }
      } else {
        // ADD NEW EVACUATION
        const newEvacuation = {
          ...formData,
          barangay: selectedBarangay,
          municipality: selectedMunicipality._id,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const result = await AddEvacuation(newEvacuation);
        if (result.success) {
          setStatusType("success");
          setStatusMessage("Matagumpay na naipadala ang iyong report!");

          // Auto-reset after delay
          setTimeout(() => {
            setStatusVisible(true);
          }, 1000);
        } else {
          setStatusType("error");
          setStatusMessage(
            result.error || "❌ Hindi matagumpay ang pagpapadala."
          );
          setStatusVisible(true);
        }
      }

      setShowAddEvacuationForm(false);
      setEditingEvacuation(null);
      fetchEvacuationsInBarangay(selectedBarangay._id);
    } catch (error) {
      console.error("Error saving evacuation:", error);
      Alert.alert(
        "Error",
        `Failed to ${editingEvacuation ? "update" : "add"} evacuation center: ${
          error.message
        }`
      );
    }
  };

  const handleEditEvacuation = (evacuation) => {
    setEditingEvacuation(evacuation);
    setShowAddEvacuationForm(true);
  };

  const handleDeleteEvacuation = (evacuation) => {
    Alert.alert(
      "Delete Evacuation Center",
      `Are you sure you want to delete ${evacuation.evacuationName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteEvacuation(evacuation._id);
              if (result.success) {
                setStatusType("success");
                setStatusMessage("The data has been successfully removed!");
                // Auto-reset after delay
                setTimeout(() => {
                  setStatusVisible(true);
                }, 1000);
              } else {
                setStatusType("error");
                setStatusMessage(result.error || "Sending failed!");
                setStatusVisible(true);
              }
            } catch (error) {
              console.error("Delete failed:", error);
              Alert.alert("Error", "Failed to delete evacuation center.");
            }
          },
        },
      ]
    );
  };

  const handleViewEvacuationDetails = (evacuation) => {
    setSelectedEvacuation(evacuation);
    setShowMapView(true);
  };

  const handleViewEvacuationOnMap = (evacuation) => {
    setSelectedEvacuation(evacuation);
    setShowMapView(true);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleEvacuationSelect = (evacuationId) => {
    const selected = evacuationData.find((evac) => evac._id === evacuationId);
    if (selected) {
      setSelectedEvacuation(selected);
      Alert.alert(
        selected.evacuationName,
        `Status: ${selected.status}\nCapacity: ${
          selected.currentEvacuation || 0
        }/${selected.evacuationCapacity}\nContact: ${
          selected.contactPerson?.name || "N/A"
        }`,
        [{ text: "OK" }]
      );
    }
  };

  if (!selectedBarangay) {
    return (
      <View className="flex-1 justify-center items-center">
        <MaterialIcons name="error-outline" size={48} color="#EF4444" />
        <Text className="text-red-500 text-lg font-medium mt-4">
          No barangay selected
        </Text>
        <TouchableOpacity
          onPress={onBack}
          className="mt-6 px-6 py-3 bg-cyan-600 rounded-xl"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <EvacuationListView
        evacuationData={EvacuationsInbarangay || []}
        barangayName={getDisplayBarangayName(selectedBarangay)}
        municipalityName={selectedMunicipality.name}
        searchQuery={evacuationSearch}
        onSearchChange={setEvacuationSearch}
        onAddEvacuation={() => {
          setEditingEvacuation(null);
          setShowAddEvacuationForm(true);
        }}
        onViewMap={() => {
          setSelectedEvacuation(null);
          setShowMapView(true);
        }}
        onViewEvacuationDetails={handleViewEvacuationDetails}
        onEditEvacuation={handleEditEvacuation}
        onDeleteEvacuation={handleDeleteEvacuation}
        onViewEvacuationOnMap={handleViewEvacuationOnMap}
      />

      <TouchableOpacity
        className="absolute top-4 left-4 z-10 bg-white p-2 rounded-full shadow-md"
        onPress={onBack}
      >
        <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
      </TouchableOpacity>

      <EvacuationForm
        visible={showAddEvacuationForm}
        onClose={() => {
          setShowAddEvacuationForm(false);
          setEditingEvacuation(null);
        }}
        onSubmit={handleEvacuationSubmit}
        selectedBarangay={selectedBarangay}
        selectedMunicipality={selectedMunicipality}
        initialData={editingEvacuation}
        onMapSelect={() => setShowAddLocationMap(true)}
        editingEvacuation={editingEvacuation}
        municipalities={municipalities}
      />

      <EvacuationMapView
        visible={showMapView}
        onClose={() => setShowMapView(false)}
        mode="view"
        municipality={selectedMunicipality.name}
        barangayName={getDisplayBarangayName(selectedBarangay)}
        evacuationLocations={evacuationData}
        selectedEvacuation={selectedEvacuation}
        onEvacuationSelect={handleEvacuationSelect}
      />

      <StatusModal
        visible={statusVisible}
        type={statusType}
        message={statusMessage}
        onClose={() => {
          setStatusVisible(false);
        }}
      />

      <EvacuationMapView
        visible={showAddLocationMap}
        onClose={() => setShowAddLocationMap(false)}
        mode="select"
        municipality={selectedMunicipality.name}
        barangayName={getDisplayBarangayName(selectedBarangay)}
        onLocationSelect={handleLocationSelect}
        initialLocation={selectedLocation}
      />
    </>
  );
};

export default EvacuationCenters;
