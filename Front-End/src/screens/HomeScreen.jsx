// HomeScreen.js - Complete with OpenStreetMap Navigation
import "../../global.css";
import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Animated,
  Dimensions,
  Modal,
  Share,
  ActivityIndicator,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

// Components
import Carousel from "../components/Carousel";
import EducationalVideos from "../components/EducationalVideos";
import AnalyticalReportsPreview from "../components/AnalyticalReportsPreview";
import QuickAccessGrid from "../components/QuickAccessGrid";
import Header from "../components/Header";
import ProfilePanel from "../components/modals/Profile/ProfilePanel";
import NotificationPanel from "../components/modals/Notification/NotificationPanel";
import ExpandedQRModal from "../components/modals/QRCode/QRCodePanel";
import EmergencyRescueButton from "../components/modals/EmergencyRescueButton/EmergencyRescueButton";
import { BarangayDisplayContext } from "../contexts/BrgyContext/BarangayContext";
import { AuthContext } from "../contexts/AuthContext";
import { HouseholdContext } from "../contexts/HouseholdLeadContext/HouseholdContext.jsx";
import { HouseHoldMemberContext } from "../contexts/HouseHoldMemberContext/HouseHoldMemberContext.jsx";

// Modals
import ViewHouseholdsModal from "../components/modals/ViewHouseholdsModal";
import VideosModal from "../components/modals/VideosModal";
import QuickAccessModal from "../components/modals/QuickAccessModal";
import AnalyticalReportsModal from "../components/modals/AnalyticalReportsModal";
import ReportBahaModal from "../components/modals/ReportBahaModal";
import ReportNasirangBahayModal from "../components/modals/ReportNasirangBahayModal";
import Barangay from "../components/modals/Barangay";
import RegisterBarangayForm from "../components/RegisterBarangay";
import { ProfileDisplayContext } from "../contexts/ProfileContext/ProfileContext.jsx";

// Dummy Data
import {
  analyticalReportsData,
  carouselData,
  educationalVideos,
  menuItems,
  barangayData,
  householdData,
} from "../components/data/dummyData";

// Import NavigationMap Component
import NavigationMap from "../components/modals/Map/NavigationMap.jsx";

// Dummy Images
const dummyProfileImages = [
  {
    id: 1,
    uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face",
  },
];

export default function HomeScreen() {
  const {
    addBarangay,
    SpecificMunicipalitiesBarangay,
    updateBarangay,
    deleteBarangay,
    fetchBarangays,
    displayBarangaysForUser,
    dropdownhousehold,
    displayDropdownInMaps,
  } = useContext(BarangayDisplayContext);
  const { requestRescue } = useContext(HouseHoldMemberContext);
  const { profile, fetchProfile } = useContext(ProfileDisplayContext);
  const { NotifyLeadRescue, getHouseholdLeadsSendNotification, loading } =
    useContext(HouseholdContext);
  const { role } = useContext(AuthContext);

  // ==================== REFS FOR TRACKING ====================
  const renderCount = useRef(0);
  const notificationPressedRef = useRef(false);
  const locationUpdateIntervalRef = useRef(null);
  const locationSubscriptionRef = useRef(null);

  // ==================== MODAL STATES ====================
  const [analyticalReportsModalVisible, setAnalyticalReportsModalVisible] =
    useState(false);
  const [videosModalVisible, setVideosModalVisible] = useState(false);
  const [quickAccessModalVisible, setQuickAccessModalVisible] = useState(false);
  const [viewHouseholdModalVisible, setViewHouseholdModalVisible] =
    useState(false);
  const [barangayModalVisible, setBarangayModalVisible] = useState(false);
  const [registerBarangayModalVisible, setRegisterBarangayModalVisible] =
    useState(false);

  // ==================== PANEL STATES ====================
  const [notificationPanelVisible, setNotificationPanelVisible] =
    useState(false);
  const [profilePanelVisible, setProfilePanelVisible] = useState(false);
  const [qrExpanded, setQrExpanded] = useState(false);

  // ==================== MAP & NAVIGATION STATES ====================
  const [selectedRescuedHousehold, setSelectedRescuedHousehold] =
    useState(null);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationDestination, setNavigationDestination] = useState(null);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 11.6245,
    longitude: 124.7708,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [locationPermission, setLocationPermission] = useState(null);
  const [routeProgress, setRouteProgress] = useState({
    distanceRemaining: 0,
    estimatedTime: 0,
    progressPercentage: 0,
  });

  // ==================== SELECTED ITEMS ====================
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [selectedMunicipalityForForm, setSelectedMunicipalityForForm] =
    useState(null);
  const [searchHousehold, setSearchHousehold] = useState("");

  // ==================== FLOOD REPORT STATES ====================
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

  // ==================== HOUSE DAMAGE REPORT STATES ====================
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

  // ==================== ANIMATION VALUES ====================
  const { width } = Dimensions.get("window");
  const notificationPanelTranslateX = useRef(new Animated.Value(width)).current;
  const profilePanelTranslateX = useRef(new Animated.Value(-width)).current;
  const mainContentTranslateX = useRef(new Animated.Value(0)).current;
  const mainContentScale = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // ==================== USER PERMISSIONS ====================
  const canSeeEmergencyRescue = useMemo(
    () => ["household_lead", "brgy_captain", "household_member"].includes(role),
    [role]
  );

  const canSeeAnalyticalReports = useMemo(
    () =>
      !["household_lead", "brgy_captain", "household_member"].includes(role),
    [role]
  );

  // ==================== USER PROFILE FROM ACTUAL DATA ====================
  const userProfile = useMemo(() => {
    if (!profile) {
      return {
        name: "Loading...",
        address: "",
        contactNumber: "",
        email: "",
        birthdate: "",
        role: role || "N/A",
        barangay: "",
        municipality: "",
        accountCreated: "",
        lastLogin: "",
        userId: "",
        qrData: "",
        profileImage: dummyProfileImages[0].uri,
      };
    }

    // Format date to readable string
    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    return {
      name: profile?.fullName || "N/A",
      address: profile?.address || "N/A",
      contactNumber: profile?.contactNumber || "N/A",
      email: profile?.username || "N/A",
      birthdate: profile?.householdMember?.birthDate
        ? formatDate(profile.householdMember.birthDate)
        : "N/A",
      role: profile?.role || "N/A",
      barangay: "",
      municipality: "",
      accountCreated: profile?.createdAt
        ? formatDate(profile.createdAt)
        : "N/A",
      lastLogin: profile?.updatedAt
        ? formatDate(profile.updatedAt)
        : "Recently",
      userId: profile?._id || "N/A",
      qrData:
        profile?.householdMember?.verificationCode || profile?._id || "N/A",
      profileImage: dummyProfileImages[0].uri,
      verificationCode: profile?.householdMember?.verificationCode || "N/A",
      householdCode: profile?.householdLead?.householdCode || "N/A",
      rescueStatus: profile?.householdLead?.rescueStatus || "N/A",
      relationship: profile?.householdMember?.relationship || "N/A",
    };
  }, [profile, role]);

  // ==================== MEMOIZED RESCUED HOUSEHOLDS DATA ====================
  const rescuedHouseholdsData = useMemo(() => {
    if (!NotifyLeadRescue || !Array.isArray(NotifyLeadRescue)) {
      return [];
    }

    const generateConsistentCoordinates = (household, index) => {
      if (household?.location?.latitude && household?.location?.longitude) {
        return {
          latitude: household.location.latitude,
          longitude: household.location.longitude,
        };
      }

      // Fallback to generated coordinates
      const idString = household._id || household.id || index.toString();
      let hash = 0;
      for (let i = 0; i < idString.length; i++) {
        hash = idString.charCodeAt(i) + ((hash << 5) - hash);
      }

      const latOffset = (hash % 100) * 0.0001;
      const lngOffset = Math.floor(Math.abs(hash / 100) % 100) * 0.0001;

      return {
        latitude: 11.623 + latOffset,
        longitude: 124.771 + lngOffset,
      };
    };

    return NotifyLeadRescue.map((hh, index) => {
      const coords = generateConsistentCoordinates(hh, index);

      const addressParts = (hh.address || "")
        .split(",")
        .map((part) => part.trim());
      const barangay = addressParts[0] || "Unknown";
      const municipality = addressParts[1] || hh.municipality || "Unknown";
      const province = addressParts[2] || hh.province || "Unknown";

      return {
        id: hh._id || hh.id,
        householdName: hh.name || hh.householdCode || `Household ${index + 1}`,
        barangay: barangay,
        municipality: municipality,
        province: province,
        address: hh.address || "No address provided",
        rescuedDate: hh.rescuedDate || new Date().toISOString().split("T")[0],
        rescuedTime:
          hh.rescuedTime ||
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
        rescuedBy: hh.rescuedBy || "Rescue Team",
        status: hh.status || "Pending",
        priority: hh.isFull ? "High" : "Medium",
        members: hh.members || 1,
        maxMembers: hh.maxMembers || 5,
        latitude: coords.latitude,
        longitude: coords.longitude,
        needs: hh.needs || ["Food", "Water", "Medical"],
        contact: hh.contact || "No contact",
        householdCode: hh.householdCode,
        rescueStatus: hh.rescueStatus,
        isFull: hh.isFull,
      };
    });
  }, [NotifyLeadRescue]);

  // ==================== LOCATION FUNCTIONS ====================
  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === "granted");

      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const newLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        };

        setCurrentLocation(newLocation);
        return true;
      }
      return false;
    } catch (error) {
      console.log("Error getting location permission:", error);
      return false;
    }
  }, []);

  const startLocationTracking = useCallback(async () => {
    try {
      const hasPermission = await requestLocationPermission();

      if (!hasPermission) {
        Alert.alert(
          "Location Permission",
          "Location permission is required for live tracking."
        );
        return null;
      }

      // Subscribe to location updates
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 1,
          timeInterval: 1000,
        },
        (location) => {
          const newLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          };

          setCurrentLocation(newLocation);
        }
      );

      locationSubscriptionRef.current = subscription;
      return subscription;
    } catch (error) {
      console.log("Error starting location tracking:", error);
      return null;
    }
  }, [requestLocationPermission]);

  const stopLocationTracking = useCallback(() => {
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }
  }, []);

  // ==================== NAVIGATION FUNCTIONS ====================
  const openRouteInMap = useCallback(
    async (household) => {
      if (!household?.latitude || !household?.longitude) {
        Alert.alert(
          "Invalid Location",
          "This household has no valid GPS coordinates for navigation."
        );
        return;
      }

      setSelectedRescuedHousehold(household);
      setNavigationDestination({
        latitude: household.latitude,
        longitude: household.longitude,
        name: household.householdName,
        barangay: household.barangay,
      });

      setMapModalVisible(true);
      closeAllPanels();
    },
    [closeAllPanels]
  );

  const handleRouteButtonPress = useCallback(
    (household) => {
      Alert.alert(
        "Navigate to Rescue Location",
        `Start navigation to ${household.householdName} in ${household.barangay}, ${household.municipality}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Start Navigation",
            onPress: () => {
              openRouteInMap(household);
            },
          },
        ]
      );
    },
    [openRouteInMap]
  );

  const startNavigation = useCallback(async () => {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      Alert.alert(
        "Location Permission",
        "Location permission is needed for navigation."
      );
      return;
    }

    setIsNavigating(true);
    await startLocationTracking();

    Alert.alert(
      "Navigation Started",
      `Now navigating to ${navigationDestination?.name}\n\nFollow the route on the map.`,
      [{ text: "OK" }]
    );
  }, [requestLocationPermission, startLocationTracking, navigationDestination]);

  const stopNavigation = useCallback(() => {
    Alert.alert(
      "Stop Navigation",
      "Are you sure you want to stop navigation?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Stop Navigation",
          style: "destructive",
          onPress: () => {
            setIsNavigating(false);
            stopLocationTracking();
            Alert.alert("Navigation Stopped", "Navigation has been stopped.");
          },
        },
      ]
    );
  }, [stopLocationTracking]);

  const handleArrival = useCallback(() => {
    Alert.alert(
      "🎉 Destination Reached!",
      "You have arrived at the household location.",
      [
        {
          text: "OK",
          onPress: () => {
            setIsNavigating(false);
            setNavigationDestination(null);
            setMapModalVisible(false);
            stopLocationTracking();
            // Mark household as rescued here if needed
          },
        },
      ]
    );
  }, [stopLocationTracking]);

  // ==================== PANEL FUNCTIONS ====================
  const toggleNotificationPanel = useCallback(() => {
    if (notificationPanelVisible) {
      Animated.parallel([
        Animated.timing(notificationPanelTranslateX, {
          toValue: width,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(mainContentTranslateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(mainContentScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setNotificationPanelVisible(false);
        if (profilePanelVisible) {
          setProfilePanelVisible(false);
        }
      });
    } else {
      if (profilePanelVisible) {
        closeProfilePanel();
      }

      setNotificationPanelVisible(true);
      Animated.parallel([
        Animated.timing(notificationPanelTranslateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(mainContentTranslateX, {
          toValue: -width * 0.4,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(mainContentScale, {
          toValue: 0.9,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [
    notificationPanelVisible,
    profilePanelVisible,
    width,
    notificationPanelTranslateX,
    mainContentTranslateX,
    mainContentScale,
    overlayOpacity,
  ]);

  const toggleProfilePanel = useCallback(() => {
    if (profilePanelVisible) {
      Animated.parallel([
        Animated.timing(profilePanelTranslateX, {
          toValue: -width,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(mainContentTranslateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(mainContentScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setProfilePanelVisible(false);

        if (notificationPanelVisible) {
          setNotificationPanelVisible(false);
        }
      });
    } else {
      if (notificationPanelVisible) {
        closeNotificationPanel();
      }

      setProfilePanelVisible(true);
      Animated.parallel([
        Animated.timing(profilePanelTranslateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(mainContentTranslateX, {
          toValue: width * 0.4,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(mainContentScale, {
          toValue: 0.9,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [
    profilePanelVisible,
    notificationPanelVisible,
    width,
    profilePanelTranslateX,
    mainContentTranslateX,
    mainContentScale,
    overlayOpacity,
  ]);

  const closeNotificationPanel = useCallback(() => {
    Animated.parallel([
      Animated.timing(notificationPanelTranslateX, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(mainContentTranslateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(mainContentScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setNotificationPanelVisible(false);
    });
  }, [
    notificationPanelTranslateX,
    mainContentTranslateX,
    mainContentScale,
    overlayOpacity,
  ]);

  const closeProfilePanel = useCallback(() => {
    Animated.parallel([
      Animated.timing(profilePanelTranslateX, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(mainContentTranslateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(mainContentScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setProfilePanelVisible(false);
    });
  }, [
    profilePanelTranslateX,
    mainContentTranslateX,
    mainContentScale,
    overlayOpacity,
  ]);

  const closeAllPanels = useCallback(() => {
    if (notificationPanelVisible) {
      closeNotificationPanel();
    }
    if (profilePanelVisible) {
      closeProfilePanel();
    }
  }, [
    notificationPanelVisible,
    profilePanelVisible,
    closeNotificationPanel,
    closeProfilePanel,
  ]);

  const handleNotificationBellPress = useCallback(() => {
    if (notificationPressedRef.current) return;

    notificationPressedRef.current = true;
    toggleNotificationPanel();

    setTimeout(() => {
      if (getHouseholdLeadsSendNotification) {
        getHouseholdLeadsSendNotification();
      }
      notificationPressedRef.current = false;
    }, 500);
  }, [toggleNotificationPanel, getHouseholdLeadsSendNotification]);

  const handleProfileLogoPress = useCallback(async () => {
    toggleProfilePanel();
    fetchProfile();
  }, [toggleProfilePanel]);

  // ==================== QR CODE FUNCTIONS ====================
  const handleQRPress = useCallback(() => {
    if (profilePanelVisible) {
      closeProfilePanel();
      setTimeout(() => {
        setQrExpanded(true);
      }, 300);
    } else {
      setQrExpanded(true);
    }
  }, [profilePanelVisible, closeProfilePanel]);

  const handleCloseExpandedQR = useCallback(() => {
    setQrExpanded(false);
  }, []);

  const handleShareQR = useCallback(async () => {
    try {
      await Share.share({
        message: `User Profile QR Code\nName: ${profile?.fullName}\nVerification Code: ${profile?.householdMember?.verificationCode}\nContact: ${profile?.contactNumber}\nAddress: ${profile?.address}`,
        title: "Share Profile QR Code",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share QR code");
    }
  }, [profile]);

  const handleSaveQR = useCallback(() => {
    Alert.alert("Save QR Code", "QR code saved to gallery", [{ text: "OK" }]);
  }, []);

  // ==================== MENU & MODAL FUNCTIONS ====================
  const handleVideoPress = useCallback((video) => {
    console.log("Video pressed:", video.title);
  }, []);

  const handleMenuItemPress = useCallback((item) => {
    if (item.title === "View Households") setViewHouseholdModalVisible(true);
    else if (item.title === "Report Baha sa Daan")
      setReportBahaModalVisible(true);
    else if (item.title === "Report Nasirang Bahay")
      setReportNasirangBahayModalVisible(true);
    else if (item.title === "View Barangay") setBarangayModalVisible(true);
    else setQuickAccessModalVisible(false);
  }, []);

  const handleEmergencyRescuePress = useCallback(() => {
    Alert.alert(
      "⚠️ Emergency Rescue Request",
      "Are you sure you need immediate rescue assistance? This will alert emergency responders.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes, Request Rescue",
          style: "destructive",
          onPress: async () => {
            try {
              await requestRescue("pending");

              Alert.alert(
                "Emergency Alert Sent",
                "Emergency responders have been notified. Stay calm and follow instructions.",
                [{ text: "OK" }]
              );
            } catch (err) {
              Alert.alert(
                "Request Failed",
                err.message || "Unable to send rescue request.",
                [{ text: "OK" }]
              );
            }
          },
        },
      ]
    );
  }, [requestRescue]);

  const handleBackToBarangayList = useCallback(() => {
    setSelectedBarangay(null);
    setSearchHousehold("");
  }, []);

  const resetBahaReportForms = useCallback(() => {
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
  }, []);

  const resetNasirangBahayReportForms = useCallback(() => {
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
  }, []);

  const handleOpenRegisterForm = useCallback((municipality) => {
    if (!municipality) {
      Alert.alert("Error", "Please select a municipality first.");
      return;
    }
    setSelectedMunicipalityForForm(municipality);
    setBarangayModalVisible(false);
    setRegisterBarangayModalVisible(true);
  }, []);

  const handleRegisterBarangay = useCallback(
    (barangayData) => {
      if (addBarangay) {
        addBarangay(barangayData);
        Alert.alert("Success", "Barangay added successfully!");
      }
      setSelectedMunicipalityForForm(null);
    },
    [addBarangay]
  );

  const generateRouteNotification = useCallback(
    (household) => {
      Alert.alert(
        "📍 Route Available",
        `A new rescue route is available for ${household.householdName} in ${household.barangay}`,
        [
          {
            text: "View Details",
            style: "default",
            onPress: () => {
              setSelectedRescuedHousehold(household);
              setNotificationPanelVisible(false);
            },
          },
          {
            text: "Start Navigation",
            style: "destructive",
            onPress: () => handleRouteButtonPress(household),
          },
          {
            text: "Later",
            style: "cancel",
          },
        ]
      );
    },
    [handleRouteButtonPress]
  );

  // ==================== CLEANUP EFFECTS ====================
  useEffect(() => {
    return () => {
      stopLocationTracking();
      if (locationUpdateIntervalRef.current) {
        clearInterval(locationUpdateIntervalRef.current);
        locationUpdateIntervalRef.current = null;
      }
    };
  }, []);

  // ==================== RENDER DEBUGGING ====================
  useEffect(() => {
    renderCount.current += 1;
    console.log(`HomeScreen render #${renderCount.current}`);
  });

  return (
    <SafeAreaView className="flex-1">
      {/* Main Content with Animation */}
      <Animated.View
        className="flex-1"
        style={{
          transform: [
            { translateX: mainContentTranslateX },
            { scale: mainContentScale },
          ],
        }}
      >
        {/* Header Component */}
        <Header
          userProfile={userProfile}
          handleProfileLogoPress={handleProfileLogoPress}
          handleNotificationBellPress={handleNotificationBellPress}
        />

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

          {/* Emergency Rescue Button Component */}
          <EmergencyRescueButton
            canSeeEmergencyRescue={canSeeEmergencyRescue}
            handleEmergencyRescuePress={handleEmergencyRescuePress}
          />

          <Carousel data={carouselData} />

          {/* Analytical Reports Preview - CONDITIONAL RENDERING */}
          {canSeeAnalyticalReports && (
            <View className="px-5 mb-6">
              <AnalyticalReportsPreview
                analyticalReportsData={analyticalReportsData}
                setAnalyticalReportsModalVisible={
                  setAnalyticalReportsModalVisible
                }
              />
            </View>
          )}

          <EducationalVideos
            educationalVideos={educationalVideos}
            handleVideoPress={handleVideoPress}
            setVideosModalVisible={setVideosModalVisible}
          />
        </ScrollView>
      </Animated.View>

      {/* Overlay when any panel is open */}
      {(notificationPanelVisible || profilePanelVisible) && (
        <Animated.View
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        >
          <TouchableOpacity
            className="flex-1"
            onPress={closeAllPanels}
            activeOpacity={1}
          />
        </Animated.View>
      )}

      {/* Profile Panel Component */}
      <ProfilePanel
        profilePanelVisible={profilePanelVisible}
        closeProfilePanel={closeProfilePanel}
        handleQRPress={handleQRPress}
        handleShareQR={handleShareQR}
        handleSaveQR={handleSaveQR}
        profilePanelTranslateX={profilePanelTranslateX}
        profile={profile}
      />

      {/* Notification Panel Component */}
      <NotificationPanel
        notificationPanelVisible={notificationPanelVisible}
        closeNotificationPanel={closeNotificationPanel}
        notificationPanelTranslateX={notificationPanelTranslateX}
        handleRouteButtonPress={handleRouteButtonPress}
        generateRouteNotification={generateRouteNotification}
        rescuedHouseholdsData={rescuedHouseholdsData}
        loading={loading}
      />

      {/* Expanded QR Modal Component */}
      <ExpandedQRModal
        qrExpanded={qrExpanded}
        handleCloseExpandedQR={handleCloseExpandedQR}
        userProfile={userProfile}
        handleShareQR={handleShareQR}
      />

      {/* MAP MODAL WITH NAVIGATION MAP */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={mapModalVisible}
        onRequestClose={() => {
          setMapModalVisible(false);
          setNavigationDestination(null);
          setIsNavigating(false);
          stopLocationTracking();
        }}
      >
        <SafeAreaView className="flex-1 bg-white">
          {/* Map Header */}
          <View className="bg-cyan-700 px-5 py-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => {
                  setMapModalVisible(false);
                  setNavigationDestination(null);
                  setIsNavigating(false);
                  stopLocationTracking();
                }}
                className="mr-4"
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <View>
                <Text className="text-white text-xl font-bold">
                  {navigationDestination ? "Navigation" : "Rescue Map"}
                </Text>
                <Text className="text-cyan-100 text-sm">
                  {navigationDestination?.name || "Interactive Navigation Map"}
                </Text>
              </View>
            </View>

            {navigationDestination && (
              <TouchableOpacity
                className="bg-white/20 p-2 rounded-full"
                onPress={() => {
                  setMapModalVisible(false);
                  setNavigationDestination(null);
                  setIsNavigating(false);
                  stopLocationTracking();
                }}
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>

          {/* Navigation Info */}
          {navigationDestination && (
            <View className="bg-cyan-50 border-b border-cyan-200 px-5 py-3">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-cyan-800 font-bold text-lg">
                    {navigationDestination.name}
                  </Text>
                  <Text className="text-cyan-600 text-sm">
                    {navigationDestination.barangay}
                  </Text>
                </View>
                <View className="bg-cyan-100 rounded-lg px-3 py-2">
                  <Text className="text-cyan-800 font-semibold">
                    {isNavigating ? "Navigating..." : "Ready to Navigate"}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Navigation Map Component */}
          <NavigationMap
            destination={navigationDestination}
            onArrival={handleArrival}
            showControls={true}
            style={{ flex: 1 }}
          />
        </SafeAreaView>
      </Modal>

      {/* Existing Modals */}
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
        role={role}
      />

      {/* Analytical Reports Modal */}
      {canSeeAnalyticalReports && (
        <AnalyticalReportsModal
          visible={analyticalReportsModalVisible}
          onClose={() => setAnalyticalReportsModalVisible(false)}
          analyticalReportsData={analyticalReportsData}
        />
      )}

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
        barangays={SpecificMunicipalitiesBarangay}
        updateBarangay={updateBarangay}
        deleteBarangay={deleteBarangay}
        fetchBarangays={fetchBarangays}
        displayBarangaysForUser={displayBarangaysForUser}
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
