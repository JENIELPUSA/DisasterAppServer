import "../../global.css";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  Ionicons,
} from "@expo/vector-icons";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

// Import Components
import Carousel from "../components/Carousel";
import EducationalVideos from "../components/EducationalVideos";
import AnalyticalReportsPreview from "../components/AnalyticalReportsPreview";
import QuickAccessGrid from "../components/QuickAccessGrid";

// Import Modals
import ViewHouseholdsModal from "../components/modals/ViewHouseholdsModal";
import VideosModal from "../components/modals/VideosModal";
import QuickAccessModal from "../components/modals/QuickAccessModal";
import AnalyticalReportsModal from "../components/modals/AnalyticalReportsModal";
import ReportBahaModal from "../components/modals/ReportBahaModal";
import ReportNasirangBahayModal from "../components/modals/ReportNasirangBahayModal";

// Import Data
import {
  analyticalReportsData,
  carouselData,
  educationalVideos,
  menuItems,
  barangayData,
  householdData,
} from "../components/data/dummyData";

export default function HomeScreen() {
  const [analyticalReportsModalVisible, setAnalyticalReportsModalVisible] =
    useState(false);
  const [videosModalVisible, setVideosModalVisible] = useState(false);
  const [quickAccessModalVisible, setQuickAccessModalVisible] = useState(false);
  const [viewHouseholdModalVisible, setViewHouseholdModalVisible] =
    useState(false);
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [searchHousehold, setSearchHousehold] = useState("");

  // Flood Report States
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

  // House Damage Report States
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

  const handleVideoPress = (video) => {
    console.log("Video pressed:", video.title);
  };

  const handleMenuItemPress = (item) => {
    console.log("Menu item pressed:", item.title);

    if (item.title === "View Households") {
      setViewHouseholdModalVisible(true);
    } else if (item.title === "Report Baha sa Daan") {
      setReportBahaModalVisible(true);
    } else if (item.title === "Report Nasirang Bahay") {
      setReportNasirangBahayModalVisible(true);
    } else {
      setQuickAccessModalVisible(false);
    }
  };

  const handleBackToBarangayList = () => {
    setSelectedBarangay(null);
    setSearchHousehold("");
  };

  // Reset function for flood report forms
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

  // Reset function for house damage report forms
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header Section */}
      <View className="h-40 bg-blue-500 flex-row justify-between items-center px-6 mb-2">
        <View className="flex-row items-center flex-1">
          <View className="w-16 h-16 bg-white rounded-full justify-center items-center shadow-lg">
            <Text className="text-green-500 text-xl font-bold">P</Text>
          </View>

          <View className="ml-4 flex-1">
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

      {/* Search Bar */}
      <View className="mx-5 -mt-10  z-10">
        <View className="flex-row items-center bg-white rounded-2xl px-4 py-4 shadow-lg border border-gray-100">
          <Ionicons name="search" size={22} color="#6B7280" />
          <TextInput
            placeholder="Search services, reports..."
            className="flex-1 ml-3 text-base"
            placeholderTextColor="#9CA3AF"
          />
          <View className="w-px h-6 bg-gray-200 mx-2" />
          <Ionicons name="filter" size={22} color="#6B7280" />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 20 }}
      >
        {/* Quick Access Grid */}
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

        <View className="px-5 mb-20">
          <Text className="text-gray-800 text-xl font-bold mb-4">
            Emergency
          </Text>
          <TouchableOpacity className="bg-red-500 rounded-2xl p-5 flex-row items-center shadow-lg">
            <View className="w-12 h-12 bg-white/20 rounded-xl justify-center items-center">
              <Ionicons name="alert-circle" size={28} color="white" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-white text-lg font-bold">
                Emergency Report
              </Text>
              <Text className="text-white/80 text-sm mt-1">
                Report immediate dangers or emergencies
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* All Modals */}
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

      {/* Flood Report Modal */}
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

      {/* House Damage Report Modal */}
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
    </SafeAreaView>
  );
}