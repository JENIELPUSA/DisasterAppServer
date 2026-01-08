import React, { useState, useEffect, useContext, useMemo } from "react";
import { Modal, SafeAreaView } from "react-native";
import MunicipalitiesView from "./Barangay/MunicipalView";
import BarangayView from "./Barangay/BarangayView";
import RegisterBarangayForm from "../RegisterBarangay";
import { MunicipalityContext } from "../../contexts/MunicipalityContext/MunicipalityContext";

export default function Barangay({
  onClose,
  visible,
  onAddBarangay,
  barangays,
  updateBarangay,
  deleteBarangay,
  fetchBarangays,
  displayBarangaysForUser,
}) {
  // Kunin ang municipalities mula sa Context
  const { municipalities } = useContext(MunicipalityContext);

  const [selectedMunicipality, setSelectedMunicipality] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // State para sa Form Modal
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [editingBarangay, setEditingBarangay] = useState(null);

  console.log("barangays", barangays);

  // -------------------- RESET FORM WHEN MODAL CLOSES --------------------
  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  // -------------------- PROCESS MUNICIPALITIES DATA --------------------
  const enrichedMunicipalities = useMemo(() => {
    if (municipalities && municipalities.length > 0) {
      return municipalities.map((m) => {
        // Bilangin ang barangays na kabilang sa municipality na ito
        const municipalityBarangays = barangays.filter(
          (b) => b.municipality?.id === m._id || b.municipality?.name === m.municipalityName
        );
        
        return {
          id: m._id,
          name: m.municipalityName,
          totalBarangays: municipalityBarangays.length,
        };
      });
    }
    return [];
  }, [municipalities, barangays]);

  // -------------------- FILTER LOGIC --------------------
  const filteredMunicipalities = enrichedMunicipalities.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase())
  );

  const barangaysList = useMemo(() => {
    if (!selectedMunicipality) return [];
    
    return barangays.filter(
      (b) => 
        b.municipality?.id === selectedMunicipality.id || 
        b.municipality?.name === selectedMunicipality.name
    );
  }, [barangays, selectedMunicipality]);

  const filteredBarangays = barangaysList.filter((b) =>
    b.barangayName?.toLowerCase().includes(search.toLowerCase())
  );

  // -------------------- HANDLERS --------------------
  const onEditBarangay = (barangayData) => {
    // Kung ang barangayData ay may nested structure
    if (barangayData.barangayData) {
      const { barangayData: barangay, municipality } = barangayData;
      setEditingBarangay({
        ...barangay,
        municipality: municipality?.name || selectedMunicipality?.name,
      });
    } else {
      // Kung direkta ang barangay object
      setEditingBarangay({
        ...barangayData,
        municipality: barangayData.municipality?.name || selectedMunicipality?.name,
      });
    }
    setShowRegisterForm(true);
  };

  const resetForm = () => {
    setSelectedMunicipality(null);
    setSearch("");
    setLoading(false);
    setShowRegisterForm(false);
    setEditingBarangay(null);
  };

  const handleCancel = () => {
    resetForm();
    if (onClose) onClose();
  };

  const handleBack = () => {
    setSelectedMunicipality(null);
    setSearch("");
  };

  const handleAddBarangay = () => {
    if (onAddBarangay && selectedMunicipality) {
      onAddBarangay(selectedMunicipality);
    }
  };

  const handleRegisterFormClose = () => {
    setShowRegisterForm(false);
    setEditingBarangay(null);
  };

  const handleRegisterFormSubmit = async (barangayData) => {
    try {
      if (barangayData.id) {
        await updateBarangay(barangayData.id, barangayData);
      }
      handleRegisterFormClose();
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={handleCancel}
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Register/Edit Barangay Modal */}
        <RegisterBarangayForm
          visible={showRegisterForm}
          onClose={handleRegisterFormClose}
          onSubmit={handleRegisterFormSubmit}
          initialData={editingBarangay}
          isEditing={!!editingBarangay}
          municipalities={municipalities}
        />

        {/* Main Content Switcher */}
        {!selectedMunicipality ? (
          <MunicipalitiesView
            municipalities={enrichedMunicipalities}
            search={search}
            setSearch={setSearch}
            loading={loading}
            barangays={barangays}
            filteredMunicipalities={filteredMunicipalities}
            handleCancel={handleCancel}
            setSelectedMunicipality={setSelectedMunicipality}
            displayBarangaysForUser={displayBarangaysForUser}
          />
        ) : (
          <BarangayView
            selectedMunicipality={selectedMunicipality}
            barangaysList={barangaysList}
            search={search}
            setSearch={setSearch}
            filteredBarangays={filteredBarangays}
            handleBack={handleBack}
            handleAddBarangay={handleAddBarangay}
            handleCancel={handleCancel}
            onEditBarangay={onEditBarangay}
            deleteBarangay={deleteBarangay}
            fetchBarangays={fetchBarangays}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}