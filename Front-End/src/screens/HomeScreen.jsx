import "../../global.css";
import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Components
import Carousel from "../components/Carousel";
import EducationalVideos from "../components/EducationalVideos";
import AnalyticalReportsPreview from "../components/AnalyticalReportsPreview";
import QuickAccessGrid from "../components/QuickAccessGrid";
import { BarangayDisplayContext } from "../contexts/BrgyContext/BarangayContext";

// Modals
import ViewHouseholdsModal from "../components/modals/ViewHouseholdsModal";
import VideosModal from "../components/modals/VideosModal";
import QuickAccessModal from "../components/modals/QuickAccessModal";
import AnalyticalReportsModal from "../components/modals/AnalyticalReportsModal";
import ReportBahaModal from "../components/modals/ReportBahaModal";
import ReportNasirangBahayModal from "../components/modals/ReportNasirangBahayModal";
import Barangay from "../components/modals/Barangay";
import RegisterBarangayForm from "../components/RegisterBarangay";


// Dummy Data
import {
  analyticalReportsData,
  carouselData,
  educationalVideos,
  menuItems,
  barangayData,
  householdData,
} from "../components/data/dummyData";

export default function HomeScreen() {
  const {
    addBarangay,
    barangays,
    updateBarangay,
    deleteBarangay,
    fetchBarangays,
  } = useContext(BarangayDisplayContext);

  // Modal states
  const [analyticalReportsModalVisible, setAnalyticalReportsModalVisible] =
    useState(false);
  const [videosModalVisible, setVideosModalVisible] = useState(false);
  const [quickAccessModalVisible, setQuickAccessModalVisible] = useState(false);
  const [viewHouseholdModalVisible, setViewHouseholdModalVisible] =
    useState(false);
  const [barangayModalVisible, setBarangayModalVisible] = useState(false);
  const [registerBarangayModalVisible, setRegisterBarangayModalVisible] =
    useState(false);

  // Selected items
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [selectedMunicipalityForForm, setSelectedMunicipalityForForm] =
    useState(null);
  const [searchHousehold, setSearchHousehold] = useState("");

  // Flood report states
  const [reportBahaModalVisible, setReportBahaModalVisible] = useState(false);
  const [selectedBahaMedia, setSelectedBahaMedia] = useState([]);
  const [bahaLocation, setBahaLocation] = useState(null);
  const [bahaIpAddress, setBahaIpAddress] = useState("Not available");
  const [bahaData, setBahaData] = useState({
    waterLevel: "",
    waterLevelLabel: "",
    severity: "",
    address: "",
    description: "",
    roadClosed: false,
    floodType: "rain_flood",
    vehiclesStranded: false,
    emergencyNeeded: false,
  });

  // House damage report states
  const [reportNasirangBahayModalVisible, setReportNasirangBahayModalVisible] =
    useState(false);
  const [selectedNasirangBahayMedia, setSelectedNasirangBahayMedia] = useState(
    []
  );
  const [nasirangBahayLocation, setNasirangBahayLocation] = useState(null);
  const [nasirangBahayIpAddress, setNasirangBahayIpAddress] =
    useState("Not available");
  const [nasirangBahayData, setNasirangBahayData] = useState({
    damageType: "",
    damageTypeLabel: "",
    severity: "",
    address: "",
    description: "",
    stillOccupied: false,
    needShelter: false,
    emergencyNeeded: false,
  });
  const handleVideoPress = (video) =>
    console.log("Video pressed:", video.title);

  const handleMenuItemPress = (item) => {
    if (item.title === "View Households") setViewHouseholdModalVisible(true);
    else if (item.title === "Report Baha sa Daan")
      setReportBahaModalVisible(true);
    else if (item.title === "Report Nasirang Bahay")
      setReportNasirangBahayModalVisible(true);
    else if (item.title === "View Barangay") setBarangayModalVisible(true);
    else setQuickAccessModalVisible(false);
  };

  const handleBackToBarangayList = () => {
    setSelectedBarangay(null);
    setSearchHousehold("");
  };

  const resetBahaReportForms = () => {
    setSelectedBahaMedia([]);
    setBahaLocation(null);
    setBahaIpAddress("Not available");
    setBahaData({
      waterLevel: "",
      waterLevelLabel: "",
      severity: "",
      address: "",
      description: "",
      roadClosed: false,
      floodType: "rain_flood",
      vehiclesStranded: false,
      emergencyNeeded: false,
    });
  };

  const resetNasirangBahayReportForms = () => {
    setSelectedNasirangBahayMedia([]);
    setNasirangBahayLocation(null);
    setNasirangBahayIpAddress("Not available");
    setNasirangBahayData({
      damageType: "",
      damageTypeLabel: "",
      severity: "",
      address: "",
      description: "",
      stillOccupied: false,
      needShelter: false,
      emergencyNeeded: false,
    });
  };

  // Handle opening RegisterBarangayForm from Barangay modal
  const handleOpenRegisterForm = (municipality) => {
    if (!municipality) {
      Alert.alert("Error", "Please select a municipality first.");
      return;
    }
    setSelectedMunicipalityForForm(municipality);
    setBarangayModalVisible(false);
    setRegisterBarangayModalVisible(true);
  };

  // Handle registering a new barangay
  const handleRegisterBarangay = (barangayData) => {
    if (addBarangay) {
      addBarangay(barangayData);
      Alert.alert("Success", "Barangay added successfully!");
    }
    // Reset municipality selection after registration
    setSelectedMunicipalityForForm(null);
  };

  return (
    <SafeAreaView className="flex-1">
      {/* Header */}
      <View className="bg-cyan-700 pb-4 pt-10">
        {/* Search Bar - Slim UI */}
        <View className="mx-5 mb-3">
          <View className="flex-row items-center bg-white rounded-xl px-3 py-2 border border-gray-200">
            <Ionicons name="search" size={18} color="#6B7280" />

            <TextInput
              placeholder="Search..."
              className="flex-1 ml-2 text-sm"
              placeholderTextColor="#9CA3AF"
            />

            <TouchableOpacity>
              <Ionicons name="filter" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome Section - nasa ibaba ng search bar */}
        <View className="flex-row items-center justify-between px-5">
          <View className="flex-row items-center">
            <View className="w-14 h-14 bg-white rounded-full justify-center items-center shadow-lg">
              <Text className="text-green-500 text-xl font-bold">P</Text>
            </View>
            <View className="ml-4">
              <Text className="text-green-100 text-sm">Good morning</Text>
              <Text className="text-white text-xl font-bold mt-1">
                Welcome Mr. Pusa
              </Text>
            </View>
          </View>
          <TouchableOpacity className="w-10 h-10 bg-white/20 rounded-full justify-center items-center">
            <Ionicons name="notifications-outline" size={24} color="white" />
            <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main ScrollView */}
      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <QuickAccessGrid
          menuItems={menuItems}
          handleMenuItemPress={handleMenuItemPress}
          setQuickAccessModalVisible={setQuickAccessModalVisible}
        />
        <Carousel data={carouselData} />
        <View className="px-5 mb-6">
          <AnalyticalReportsPreview
            analyticalReportsData={analyticalReportsData}
            setAnalyticalReportsModalVisible={setAnalyticalReportsModalVisible}
          />
        </View>
        <EducationalVideos
          educationalVideos={educationalVideos}
          handleVideoPress={handleVideoPress}
          setVideosModalVisible={setVideosModalVisible}
        />
      </ScrollView>

      {/* Modals */}
      <VideosModal
        visible={videosModalVisible}
        onClose={() => setVideosModalVisible(false)}
        educationalVideos={educationalVideos}
        handleVideoPress={handleVideoPress}
      />
      <QuickAccessModal
        visible={quickAccessModalVisible}
        onClose={() => setQuickAccessModalVisible(false)}
        menuItems={menuItems}
        handleMenuItemPress={handleMenuItemPress}
      />
      <AnalyticalReportsModal
        visible={analyticalReportsModalVisible}
        onClose={() => setAnalyticalReportsModalVisible(false)}
        analyticalReportsData={analyticalReportsData}
      />
      <ViewHouseholdsModal
        viewHouseholdModalVisible={viewHouseholdModalVisible}
        setViewHouseholdModalVisible={setViewHouseholdModalVisible}
        selectedBarangay={selectedBarangay}
        setSelectedBarangay={setSelectedBarangay}
        searchHousehold={searchHousehold}
        setSearchHousehold={setSearchHousehold}
        barangayData={barangayData}
        householdData={householdData}
        handleBackToBarangayList={handleBackToBarangayList}
      />
      <ReportBahaModal
        reportBahaModalVisible={reportBahaModalVisible}
        setReportBahaModalVisible={setReportBahaModalVisible}
        selectedMedia={selectedBahaMedia}
        setSelectedMedia={setSelectedBahaMedia}
        location={bahaLocation}
        setLocation={setBahaLocation}
        ipAddress={bahaIpAddress}
        setIpAddress={setBahaIpAddress}
        bahaData={bahaData}
        setBahaData={setBahaData}
        resetReportForms={resetBahaReportForms}
      />
      <ReportNasirangBahayModal
        reportNasirangBahayModalVisible={reportNasirangBahayModalVisible}
        setReportNasirangBahayModalVisible={setReportNasirangBahayModalVisible}
        selectedMedia={selectedNasirangBahayMedia}
        setSelectedMedia={setSelectedNasirangBahayMedia}
        location={nasirangBahayLocation}
        setLocation={setNasirangBahayLocation}
        ipAddress={nasirangBahayIpAddress}
        setIpAddress={setNasirangBahayIpAddress}
        nasirangBahayData={nasirangBahayData}
        setNasirangBahayData={setNasirangBahayData}
        resetReportForms={resetNasirangBahayReportForms}
      />

      {/* Barangay & Register Form */}
      <Barangay
        visible={barangayModalVisible}
        onClose={() => setBarangayModalVisible(false)}
        onAddBarangay={handleOpenRegisterForm}
        barangays={barangays}
        updateBarangay={updateBarangay}
        deleteBarangay={deleteBarangay}
        fetchBarangays={fetchBarangays}
      />
      <RegisterBarangayForm
        visible={registerBarangayModalVisible}
        onClose={() => {
          setRegisterBarangayModalVisible(false);
          setSelectedMunicipalityForForm(null);
        }}
        addBarangay={handleRegisterBarangay}
        selectedMunicipality={selectedMunicipalityForForm}
      />
    </SafeAreaView>
  );
}
