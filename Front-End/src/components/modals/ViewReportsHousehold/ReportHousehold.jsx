import React, { useState, useEffect, useContext, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NasirangBahayContext } from "../../../contexts/NasirangBahayReportContext/NasirangBahayReportContext";
import ReportDetail from "./ReportDetails";
import ImageGalleryModal from "./ImageGalleryModal";

const { width } = Dimensions.get("window");

// --- FIX 1: ILABAS ANG MGA COMPONENTS NA MAY INPUT PARA HINDI MAWALA ANG FOCUS ---

const FilterScroll = ({ title, options, selected, setSelected }) => (
  <View className="mb-2">
    <Text className="text-xs font-bold text-slate-500 uppercase mb-1">{title}</Text>
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      className="flex-row gap-2"
      keyboardShouldPersistTaps="handled" 
    >
      <TouchableOpacity onPress={() => setSelected("")} className={`px-3 py-1.5 rounded-full border ${selected === "" ? "bg-cyan-700 border-cyan-700" : "bg-white border-slate-300"}`}>
        <Text className={`text-sm font-medium ${selected === "" ? "text-white" : "text-slate-700"}`}>All</Text>
      </TouchableOpacity>
      {options?.map((opt) => (
        <TouchableOpacity key={opt} onPress={() => setSelected(opt)} className={`px-3 py-1.5 rounded-full border ${selected === opt ? "bg-cyan-700 border-cyan-700" : "bg-white border-slate-300"} ml-2`}>
          <Text className={`text-sm font-medium ${selected === opt ? "text-white" : "text-slate-700"}`}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const FilterSection = memo(({ 
  searchQuery, 
  setSearchQuery, 
  showFilters, 
  setShowFilters, 
  selectedMunicipality,
  setSelectedMunicipality,
  selectedBarangay,
  setSelectedBarangay,
  selectedTyphoon,
  setSelectedTyphoon,
  clearFilters,
  allMunicipalities,
  allBarangays,
  allTyphoons
}) => (
  <View className="px-4 pb-2 bg-white border-b border-slate-200">
    <View className="flex-row items-center bg-slate-100 rounded-full px-4 py-2 mb-3">
      <Ionicons name="search" size={20} color="#94a3b8" />
      <TextInput
        className="flex-1 ml-2 text-base text-slate-900"
        placeholder="Search by name, typhoon, address..."
        placeholderTextColor="#94a3b8"
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCorrect={false} // Nakakatulong din ito para hindi mag-lag
      />
      {searchQuery !== "" && (
        <TouchableOpacity onPress={() => setSearchQuery("")}>
          <Ionicons name="close-circle" size={20} color="#94a3b8" />
        </TouchableOpacity>
      )}
    </View>

    <TouchableOpacity
      onPress={() => setShowFilters(!showFilters)}
      className="flex-row items-center justify-between py-2"
    >
      <View className="flex-row items-center gap-2">
        <Ionicons name="options" size={20} color="#0f172a" />
        <Text className="text-base font-semibold text-slate-800">Filters</Text>
      </View>
      <Ionicons name={showFilters ? "chevron-up" : "chevron-down"} size={20} color="#64748b" />
    </TouchableOpacity>

    {showFilters && (
      <View className="py-3 space-y-3">
        <FilterScroll
          title="Municipality"
          options={allMunicipalities}
          selected={selectedMunicipality}
          setSelected={setSelectedMunicipality}
        />
        <FilterScroll
          title="Barangay"
          options={allBarangays}
          selected={selectedBarangay}
          setSelected={setSelectedBarangay}
        />
        <FilterScroll
          title="Typhoon"
          options={allTyphoons}
          selected={selectedTyphoon}
          setSelected={setSelectedTyphoon}
        />

        {(selectedMunicipality || selectedBarangay || selectedTyphoon) && (
          <TouchableOpacity onPress={clearFilters} className="self-end mt-2">
            <Text className="text-cyan-700 font-semibold">Clear all filters</Text>
          </TouchableOpacity>
        )}
      </View>
    )}
  </View>
));

// --- MAIN COMPONENT ---

const ReportHousehold = ({ visible, onClose }) => {
  const {
    AllNasirangBahay,
    DisplayAllNasirangBahay,
    allTyphoons,
    allMunicipalities,
    allBarangays,
  } = useContext(NasirangBahayContext);

  const [selectedReport, setSelectedReport] = useState(null);
  const [gallery, setGallery] = useState({ visible: false, images: [], index: 0 });

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [selectedTyphoon, setSelectedTyphoon] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchQuery);
    }, 1000); // Ginawa kong 1s para hindi masyadong matagal ang hintay ng user
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    DisplayAllNasirangBahay?.({
      searchText: debouncedSearchTerm,
      municipalityFilter: selectedMunicipality,
      barangayFilter: selectedBarangay,
      typhoonFilter: selectedTyphoon,
    });
  }, [debouncedSearchTerm, selectedMunicipality, selectedBarangay, selectedTyphoon]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedMunicipality("");
    setSelectedBarangay("");
    setSelectedTyphoon("");
  };

  const openGallery = (images, index) => setGallery({ visible: true, images, index });

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // Helpers (Walang binago sa logic o classes)
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-orange-100 text-orange-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved": return "checkmark-circle";
      case "pending": return "time";
      case "rejected": return "close-circle";
      default: return "help-circle";
    }
  };

  const getDamageIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "roof_damage": return "home";
      case "foundation": return "construct";
      case "total": return "warning";
      default: return "alert-circle";
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case "high": return "text-red-600 font-semibold";
      case "medium": return "text-amber-600 font-semibold";
      case "low": return "text-emerald-600 font-semibold";
      default: return "text-slate-600";
    }
  };

  const renderItem = ({ item }) => {
    const statusBadgeClass = getStatusBadgeClass(item.reportStatus);
    const statusIcon = getStatusIcon(item.reportStatus);
    const damageIcon = getDamageIcon(item.damageType);
    const severityClass = getSeverityClass(item.severity);

    return (
      <TouchableOpacity
        className="bg-white rounded-2xl p-4 mx-4 mb-3 border border-slate-200 shadow-sm active:bg-slate-50"
        onPress={() => setSelectedReport(item)}
        activeOpacity={0.7}
      >
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center gap-2">
            <Ionicons name="person-circle" size={24} color="#0f172a" />
            <Text className="text-base font-bold text-slate-900">
              {item.submittedUser?.fullName || "Unknown"}
            </Text>
          </View>
          <View className={`flex-row items-center px-2 py-1 rounded-full gap-1 ${statusBadgeClass}`}>
            <Ionicons name={statusIcon} size={12} color="currentColor" />
            <Text className="text-xs font-bold capitalize">{item.reportStatus || "unknown"}</Text>
          </View>
        </View>

        <View className="mb-3 gap-2">
          <View className="flex-row items-center gap-2">
            <Ionicons name="thunderstorm" size={16} color="#64748b" />
            <Text className="text-sm text-slate-700 flex-1">
              {item.typhoonName || "N/A"} • {formatDate(item.createdAt)}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Ionicons name="location" size={16} color="#64748b" />
            <Text className="text-sm text-slate-700 flex-1" numberOfLines={1}>
              {item.municipality?.municipalityName || "N/A"}
              {item.barangay ? `, ${item.barangay}` : ""}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Ionicons name={damageIcon} size={16} color="#64748b" />
            <Text className="text-sm text-slate-700 flex-1">
              {item.damageType || "Unknown"} • Severity: <Text className={severityClass}>{item.severity || "N/A"}</Text>
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center pt-3 border-t border-slate-100">
          <View className="flex-row items-center gap-1.5 flex-1">
            <Ionicons name="home" size={14} color="#94a3b8" />
            <Text className="text-xs text-slate-500 flex-1" numberOfLines={1}>
              {item.address || "No address provided"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
        </View>
      </TouchableOpacity>
    );
  };

  const ListEmptyComponent = () => (
    <View className="flex-1 justify-center items-center py-16 px-8">
      <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
      <Text className="text-xl font-bold text-slate-700 mt-4 mb-2">No Reports Found</Text>
      <Text className="text-sm text-slate-400 text-center leading-5">
        {searchQuery || selectedMunicipality || selectedBarangay || selectedTyphoon
          ? "Try adjusting your filters or search query."
          : "There are no damaged house reports available at the moment."}
      </Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide">
      <StatusBar barStyle="light-content" />
      <View style={{ backgroundColor: "#0e7490", paddingTop: 24, paddingBottom: 60 }}>
        <SafeAreaView>
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: "900", color: "white" }}>TYPHOON SYSTEM</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        <View style={{
          position: "absolute", bottom: 0, width, height: 40,
          backgroundColor: "white", borderTopLeftRadius: 40, borderTopRightRadius: 40,
        }}/>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {!selectedReport ? (
          <>
            <FilterSection
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              selectedMunicipality={selectedMunicipality}
              setSelectedMunicipality={setSelectedMunicipality}
              selectedBarangay={selectedBarangay}
              setSelectedBarangay={setSelectedBarangay}
              selectedTyphoon={selectedTyphoon}
              setSelectedTyphoon={setSelectedTyphoon}
              clearFilters={clearFilters}
              allMunicipalities={allMunicipalities}
              allBarangays={allBarangays}
              allTyphoons={allTyphoons}
            />
            <FlatList
              data={AllNasirangBahay}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              ListEmptyComponent={ListEmptyComponent}
              contentContainerStyle={{ paddingVertical: 16 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled" // FIX: para hindi mag-dismiss ang keyboard pag-scroll
            />
          </>
        ) : (
          <ReportDetail report={selectedReport} onBack={() => setSelectedReport(null)} onOpenGallery={openGallery} />
        )}
      </KeyboardAvoidingView>

      <ImageGalleryModal
        visible={gallery.visible}
        images={gallery.images}
        currentIndex={gallery.index}
        onClose={() => setGallery({ ...gallery, visible: false })}
        onNext={() => setGallery({ ...gallery, index: gallery.index + 1 })}
        onPrev={() => setGallery({ ...gallery, index: gallery.index - 1 })}
      />
    </Modal>
  );
};

export default ReportHousehold;