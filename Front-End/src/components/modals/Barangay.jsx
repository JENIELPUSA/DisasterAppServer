import React, { useState, useEffect } from "react";
import { Modal, SafeAreaView } from "react-native";
import MunicipalitiesView from "./Barangay/MunicipalView";
import BarangayView from "./Barangay/BarangayView";
import RegisterBarangayForm from "../RegisterBarangay";

export default function Barangay({
  onClose,
  visible,
  onAddBarangay,
  barangays,
  updateBarangay,
  deleteBarangay,
  fetchBarangays
}) {
  const [municipalities, setMunicipalities] = useState([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // NEW STATE FOR REGISTERBARANGAYFORM MODAL
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [editingBarangay, setEditingBarangay] = useState(null);

  // -------------------- MUNICIPALITY DATA WITH ALL BILIRAN MUNICIPALITIES --------------------
  const Municipalities = [
    { id: 1, name: "Almeria" },
    { id: 2, name: "Biliran" },
    { id: 3, name: "Cabucgayan" },
    { id: 4, name: "Caibiran" },
    { id: 5, name: "Culaba" },
    { id: 6, name: "Kawayan" },
    { id: 7, name: "Maripipi" },
    { id: 8, name: "Naval (Capital)" },
  ];

  // -------------------- RESET FORM WHEN MODAL CLOSES --------------------
  useEffect(() => {
    if (!visible) {
      resetForm();
    } else {
      loadMunicipalities();
    }
  }, [visible]);

  // -------------------- LOAD MUNICIPALITIES --------------------
  const loadMunicipalities = () => {
    setLoading(true);
    // Simulate API loading
    setTimeout(() => {
      // Add total barangay count to each municipality
      const enriched = Municipalities.map((m) => ({
        ...m,
        totalBarangays: barangays.filter((b) => b.municipality === m.name)
          .length,
      }));

      setMunicipalities(enriched);
      setLoading(false);
    }, 500);
  };

  // UPDATED onEditBarangay FUNCTION
  const onEditBarangay = (barangayData) => {
    const { barangayData: barangay, municipality } = barangayData;
    setEditingBarangay({
      ...barangay,
      municipality: municipality.name, // Ensure municipality name is included
    });

    // Show the RegisterBarangayForm modal
    setShowRegisterForm(true);
  };

  // -------------------- RESET FORM --------------------
  const resetForm = () => {
    setSelectedMunicipality(null);
    setSearch("");
    setLoading(false);
    setShowRegisterForm(false);
    setEditingBarangay(null);
  };

  // -------------------- FILTER MUNICIPALITIES BASED ON SEARCH --------------------
  const filteredMunicipalities = municipalities.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  // -------------------- FILTER BARANGAYS BASED ON SELECTED MUNICIPALITY --------------------
  const barangaysList = barangays.filter(
    (b) => b.municipality === selectedMunicipality?.name
  );

  const filteredBarangays = barangaysList.filter((b) =>
    b.barangayName.toLowerCase().includes(search.toLowerCase())
  );

  // -------------------- HANDLE CANCEL --------------------
  const handleCancel = () => {
    resetForm();
    if (onClose) onClose();
  };

  // -------------------- HANDLE BACK FROM BARANGAY LIST --------------------
  const handleBack = () => {
    setSelectedMunicipality(null);
    setSearch("");
  };

  // -------------------- HANDLE ADD BARANGAY --------------------
  const handleAddBarangay = () => {
    if (onAddBarangay && selectedMunicipality) {
      onAddBarangay(selectedMunicipality);
    }
  };

  // -------------------- HANDLE REGISTER FORM CLOSE --------------------
  const handleRegisterFormClose = () => {
    setShowRegisterForm(false);
    setEditingBarangay(null);
  };

  // -------------------- HANDLE REGISTER FORM SUBMIT --------------------
  const handleRegisterFormSubmit = async (barangayData) => {
    await updateBarangay(barangayData.id, barangayData);
    handleRegisterFormClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={handleCancel}
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* RegisterBarangayForm Modal */}
        <RegisterBarangayForm
          visible={showRegisterForm}
          onClose={handleRegisterFormClose}
          onSubmit={handleRegisterFormSubmit}
          initialData={editingBarangay} // Pass the barangay data to edit
          isEditing={!!editingBarangay} // Indicate this is an edit operation
        />

        {/* Main Content */}
        {!selectedMunicipality ? (
          <MunicipalitiesView
            municipalities={municipalities}
            search={search}
            setSearch={setSearch}
            loading={loading}
            barangays={barangays}
            filteredMunicipalities={filteredMunicipalities}
            handleCancel={handleCancel}
            setSelectedMunicipality={setSelectedMunicipality}
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
