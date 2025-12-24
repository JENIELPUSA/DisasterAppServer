import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Animated,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
  ScrollView,
  StyleSheet
} from "react-native";
import { WebView } from "react-native-webview";
import { BarangayDisplayContext } from "../contexts/BrgyContext/BarangayContext";
import { EvacuationDisplayContext } from "../contexts/EvacuationContext/EvacuationContext";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const { width, height } = Dimensions.get('window');

// Define styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#dbeafe',
    borderTopColor: '#2563eb',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  loadingSubtext: {
    color: '#6b7280',
    marginTop: 8,
  },
  legendButton: {
    position: 'absolute',
    top: 48,
    right: 16,
    zIndex: 50,
    backgroundColor: 'white',
    borderRadius: 9999,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalSubtitle: {
    color: '#6b7280',
    fontSize: 14,
  },
  closeButton: {
    padding: 8,
  },
  scrollViewContent: {
    padding: 16,
  },
  householdCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusBadgeActive: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeInactive: {
    backgroundColor: '#f3f4f6',
  },
  statusTextActive: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextInactive: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  viewOnMap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  statsHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -8,
  },
  statBox: {
    width: '50%',
    padding: 8,
  },
  statBoxInner: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mapInfoBox: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  controlPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  collapseHeader: {
    backgroundColor: '#f0f9ff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  collapseText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flex: 1,
    padding: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  fullButton: {
    borderRadius: 12,
    marginHorizontal: 6,
    paddingVertical: 16,
    backgroundColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    marginHorizontal: 6,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonBlue: {
    backgroundColor: '#3b82f6',
  },
  buttonOrange: {
    backgroundColor: '#f97316',
  },
  buttonEmerald: {
    backgroundColor: '#10b981',
  },
  buttonViolet: {
    backgroundColor: '#8b5cf6',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  countBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 1,
  },
  legendPreview: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    padding: 4,
  },
  collapsedContent: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 20,
  },
});

export default function MapsScreen() {
  const { evacuations } = useContext(EvacuationDisplayContext);
  const { barangays } = useContext(BarangayDisplayContext);
  const webViewRef = useRef(null);
  const [selectedView, setSelectedView] = useState("both");
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showHouseholdModal, setShowHouseholdModal] = useState(false);
  const [showMapLegend, setShowMapLegend] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);

  const slideAnim = useRef(new Animated.Value(300)).current;
  const arrowRotate = useRef(new Animated.Value(0)).current;

  // Household data (same as your original data)
  const householdData = [
    {
      "isActive": false,
      "_id": "694224f13c3278bbe1de3d37",
      "userId": {
        "_id": "694224ef3c3278bbe1de3d34",
        "fullName": "Elizabeth A Pusa",
        "contactNumber": "8678",
        "address": "gergregreg"
      },
      "familyMembers": 5,
      "barangayId": "6932bb4fbae4d3a1204b24f5",
      "totalMembers": 5,
      "isFull": true,
      "createdAt": "2025-12-17T03:35:13.094Z",
      "updatedAt": "2025-12-17T03:35:13.094Z",
      "householdCode": "HH-WSIKJNFYA",
      "__v": 0,
      "members": [
        {
          "_id": "693ade73da190b9d60b4a1d8",
          "userId": {
            "_id": "693ade73da190b9d60b4a1d5",
            "fullName": "JENIEL A PUSA",
            "contactNumber": "09356358408"
          },
          "householdLeadId": "694224f13c3278bbe1de3d37",
          "relationship": "Parent",
          "isVerified": false,
          "verificationCode": "G5Q594",
          "disability": "",
          "birthDate": "1997-09-17T00:00:00.000Z",
          "createdAt": "2025-12-11T15:08:35.844Z",
          "updatedAt": "2025-12-21T04:42:02.805Z",
          "__v": 0,
          "isActive": true,
          "isApproved": true
        },
        {
          "_id": "6944ff08908c0c61ceabf7ad",
          "userId": {
            "_id": "6944ff07908c0c61ceabf7aa",
            "fullName": "Mark dave A  Pusa",
            "contactNumber": "09356358408"
          },
          "householdLeadId": "694224f13c3278bbe1de3d37",
          "relationship": "Son",
          "isVerified": false,
          "verificationCode": "MV4BOD",
          "disability": "",
          "birthDate": "2025-09-17T00:00:00.000Z",
          "createdAt": "2025-12-19T07:30:16.756Z",
          "updatedAt": "2025-12-21T04:41:56.405Z",
          "__v": 0,
          "isActive": true,
          "isApproved": true
        },
        {
          "_id": "69450016908c0c61ceabf7c4",
          "userId": {
            "_id": "69450015908c0c61ceabf7c1",
            "fullName": "ANGELICA A PUSA",
            "contactNumber": "09356358408"
          },
          "householdLeadId": "694224f13c3278bbe1de3d37",
          "relationship": "Daughter",
          "isVerified": false,
          "verificationCode": "0PEH3E",
          "disability": "",
          "birthDate": "2000-12-19T00:00:00.000Z",
          "createdAt": "2025-12-19T07:34:46.517Z",
          "updatedAt": "2025-12-21T04:41:50.403Z",
          "__v": 0,
          "isActive": true,
          "isApproved": true
        },
        {
          "_id": "69450151908c0c61ceabf7e1",
          "userId": {
            "_id": "69450150908c0c61ceabf7de",
            "fullName": "Danilo A  Pusa",
            "contactNumber": "09356358407"
          },
          "householdLeadId": "694224f13c3278bbe1de3d37",
          "relationship": "Son",
          "isVerified": false,
          "verificationCode": "VPDQ1L",
          "disability": "",
          "birthDate": "1931-12-19T00:00:00.000Z",
          "createdAt": "2025-12-19T07:40:01.187Z",
          "updatedAt": "2025-12-21T04:41:44.934Z",
          "__v": 0,
          "isActive": true,
          "isApproved": true
        },
        {
          "_id": "6945043c908c0c61ceabf7fe",
          "userId": {
            "_id": "6945043b908c0c61ceabf7fb",
            "fullName": "Neil A  Pusa",
            "contactNumber": "09356358409"
          },
          "householdLeadId": "694224f13c3278bbe1de3d37",
          "relationship": "Grandchild",
          "isVerified": false,
          "verificationCode": "9T8F23",
          "disability": "",
          "birthDate": "1950-12-05T00:00:00.000Z",
          "createdAt": "2025-12-19T07:52:28.548Z",
          "updatedAt": "2025-12-21T04:32:37.925Z",
          "__v": 0,
          "isActive": true,
          "isApproved": true
        }
      ]
    },
    {
      "isActive": false,
      "_id": "69423402d3dd200ba1993222",
      "userId": {
        "_id": "69423402d3dd200ba199321f",
        "fullName": "JHONY PUSONG",
        "contactNumber": "09356358408",
        "address": "ASUG CAIBIRAN BILIRAN"
      },
      "familyMembers": 5,
      "barangayId": "6932bb4fbae4d3a1204b24f5",
      "totalMembers": 2,
      "isFull": false,
      "createdAt": "2025-12-17T04:39:30.981Z",
      "updatedAt": "2025-12-17T04:39:30.981Z",
      "householdCode": "HH-DI2EE4ISL",
      "__v": 0,
      "members": [
        {
          "_id": "694781ea2e5a97e0ac0014f3",
          "userId": {
            "_id": "694781e92e5a97e0ac0014f0",
            "fullName": "JENIEL PUSA",
            "contactNumber": "09356358408"
          },
          "householdLeadId": "69423402d3dd200ba1993222",
          "relationship": "Son",
          "isApproved": false,
          "isActive": false,
          "verificationCode": "HU9Q8I",
          "disability": "",
          "birthDate": "2025-12-02T00:00:00.000Z",
          "createdAt": "2025-12-21T05:13:14.529Z",
          "updatedAt": "2025-12-21T05:13:14.529Z",
          "__v": 0
        }
      ]
    },
    {
      "location": {
        "latitude": 37.4219983,
        "longitude": -122.084
      },
      "_id": "6947b9d61c329c68dc789c47",
      "userId": {
        "_id": "6947b9d51c329c68dc789c44",
        "fullName": "gegerge",
        "contactNumber": "0967676",
        "address": "Amphitheatre Parkway, Santa Clara County, Mountain View, California, United States, 94043"
      },
      "isActive": true,
      "familyMembers": 12,
      "barangayId": "6932bb4fbae4d3a1204b24f5",
      "totalMembers": 1,
      "emergencyContact": "0967676",
      "isFull": false,
      "createdAt": "2025-12-21T09:11:50.057Z",
      "updatedAt": "2025-12-21T09:11:50.057Z",
      "householdCode": "HH-HBUY7MTG6",
      "__v": 0,
      "members": []
    },
    {
      "location": {
        "latitude": 37.4219983,
        "longitude": -122.084
      },
      "_id": "6947bb1e791a4ea6b97928e6",
      "userId": {
        "_id": "6947bb1c791a4ea6b97928e3",
        "fullName": "gegerge",
        "contactNumber": "0967676",
        "address": "Amphitheatre Parkway, Santa Clara County, Mountain View, California, United States, 94043"
      },
      "isActive": true,
      "familyMembers": 12,
      "barangayId": "6932bb4fbae4d3a1204b24f5",
      "totalMembers": 1,
      "emergencyContact": "0967676",
      "isFull": false,
      "createdAt": "2025-12-21T09:17:18.424Z",
      "updatedAt": "2025-12-21T09:17:18.424Z",
      "householdCode": "HH-6A8VL2TAT",
      "__v": 0,
      "members": []
    },
    {
      "location": {
        "latitude": 37.4219983,
        "longitude": -122.084
      },
      "_id": "6947be02208d32aed1643612",
      "userId": {
        "_id": "6947be01208d32aed164360f",
        "fullName": "Serrr",
        "contactNumber": "094398493",
        "address": "Amphitheatre Parkway, Santa Clara County, Mountain View, California, United States, 94043"
      },
      "isActive": true,
      "familyMembers": 4,
      "barangayId": "6932bb4fbae4d3a1204b24f5",
      "totalMembers": 1,
      "emergencyContact": "094398493",
      "isFull": false,
      "createdAt": "2025-12-21T09:29:38.950Z",
      "updatedAt": "2025-12-21T09:29:38.950Z",
      "householdCode": "HH-3LLW090M8",
      "__v": 0,
      "members": []
    }
  ];

  // Filter household data na may location
  const householdsWithLocation = householdData.filter(household => 
    household.location && 
    household.location.latitude && 
    household.location.longitude
  );

  useEffect(() => {
    if (barangays.length > 0 && evacuations.length > 0) {
      setIsInitialized(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [barangays, evacuations]);

  const toggleCollapse = () => {
    if (!isInitialized) return;

    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        300,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity
      )
    );

    Animated.timing(arrowRotate, {
      toValue: isCollapsed ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setIsCollapsed(!isCollapsed);
  };

  const handleMunicipalitiesPress = () => {
    if (!isInitialized) return;
    console.log("Municipalities button pressed");
    setSelectedView("municipalities");
    setShowHouseholdModal(false);
    
    // Send data to map
    const data = {
      view: "municipalities",
      municipalities: barangays,
      evacuations: evacuations,
      roads: [],
      household: householdsWithLocation,
      municipalitiesVisible: true,
      evacuationsVisible: false,
      roadsVisible: false,
      householdVisible: false,
      iconType: "professional"
    };
    
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify(data));
    }
  };

  const handleEvacuationsPress = () => {
    if (!isInitialized) return;
    console.log("Evacuations button pressed");
    setSelectedView("evacuations");
    setShowHouseholdModal(false);
    
    // Send data to map
    const data = {
      view: "evacuations",
      municipalities: barangays,
      evacuations: evacuations,
      roads: [],
      household: householdsWithLocation,
      municipalitiesVisible: false,
      evacuationsVisible: true,
      roadsVisible: false,
      householdVisible: false,
      iconType: "professional"
    };
    
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify(data));
    }
  };

  const handleRoadsPress = () => {
    if (!isInitialized) return;
    console.log("Roads button pressed");
    setSelectedView("roads");
    setShowHouseholdModal(false);
    
    // Send data to map
    const data = {
      view: "roads",
      municipalities: barangays,
      evacuations: evacuations,
      roads: [],
      household: householdsWithLocation,
      municipalitiesVisible: false,
      evacuationsVisible: false,
      roadsVisible: true,
      householdVisible: false,
      iconType: "professional"
    };
    
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify(data));
    }
  };

  const handleHouseholdPress = () => {
    if (!isInitialized) return;
    console.log("Household button pressed");
    setSelectedView("household");
    setShowHouseholdModal(true);
    
    // Send data to map
    const data = {
      view: "household",
      municipalities: barangays,
      evacuations: evacuations,
      roads: [],
      household: householdsWithLocation,
      municipalitiesVisible: false,
      evacuationsVisible: false,
      roadsVisible: false,
      householdVisible: true,
      iconType: "professional"
    };
    
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify(data));
    }
  };

  const handleBothPress = () => {
    if (!isInitialized) return;
    console.log("Show All button pressed");
    setSelectedView("both");
    setShowHouseholdModal(false);
    
    // Send data to map
    const data = {
      view: "both",
      municipalities: barangays,
      evacuations: evacuations,
      roads: [],
      household: householdsWithLocation,
      municipalitiesVisible: true,
      evacuationsVisible: true,
      roadsVisible: false,
      householdVisible: true,
      iconType: "professional"
    };
    
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify(data));
    }
  };

  useEffect(() => {
    if (webViewRef.current && isInitialized) {
      const data = {
        view: selectedView,
        municipalities: barangays,
        evacuations: evacuations,
        roads: [],
        household: householdsWithLocation,
        municipalitiesVisible: selectedView === "municipalities" || selectedView === "both",
        evacuationsVisible: selectedView === "evacuations" || selectedView === "both",
        roadsVisible: selectedView === "roads" || selectedView === "both",
        householdVisible: selectedView === "household" || selectedView === "both",
        iconType: "professional"
      };
      webViewRef.current.postMessage(JSON.stringify(data));
    }
  }, [selectedView, barangays, evacuations, isInitialized]);

  const arrowRotation = arrowRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  // Panel height based on collapsed state
  const panelHeight = isCollapsed ? 150 : 270;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      {/* Map Loading Indicator */}
      {mapLoading && (
        <View style={styles.loadingContainer}>
          <View style={{ alignItems: 'center' }}>
            <View style={styles.loadingSpinner} />
            <Text style={styles.loadingText}>Loading Map...</Text>
            <Text style={styles.loadingSubtext}>Preparing professional map view</Text>
          </View>
        </View>
      )}

      {/* Map Legend Toggle Button */}
      <TouchableOpacity
        style={styles.legendButton}
        onPress={() => setShowMapLegend(!showMapLegend)}
      >
        <FontAwesome5 name="map-signs" size={22} color="#3b82f6" />
      </TouchableOpacity>

      <WebView
        ref={webViewRef}
        source={require("../../assets/map.html")}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onLoad={() => {
          console.log("Map loaded successfully");
          setMapLoading(false);
          if (isInitialized) {
            const data = {
              view: "both",
              municipalities: barangays,
              evacuations: evacuations,
              roads: [],
              household: householdsWithLocation,
              municipalitiesVisible: true,
              evacuationsVisible: true,
              roadsVisible: false,
              householdVisible: true,
              iconType: "professional"
            };
            webViewRef.current.postMessage(JSON.stringify(data));
          }
        }}
        onLoadStart={() => setMapLoading(true)}
        onLoadEnd={() => setMapLoading(false)}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
          setMapLoading(false);
        }}
      />

      {/* Household Data Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showHouseholdModal}
        onRequestClose={() => setShowHouseholdModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Household Data</Text>
                <Text style={styles.modalSubtitle}>
                  {householdData.length} total households • {householdsWithLocation.length} with location
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowHouseholdModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
              {/* Households with Location */}
              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <FontAwesome5 name="home" size={20} color="#8b5cf6" />
                  <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginLeft: 8 }}>
                    Households with Location ({householdsWithLocation.length})
                  </Text>
                </View>
                <Text style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>
                  These households have precise latitude and longitude coordinates
                </Text>
                
                {householdsWithLocation.map((household, index) => (
                  <TouchableOpacity 
                    key={household._id} 
                    style={styles.householdCard}
                    onPress={() => {
                      // Send data to focus on this household
                      const data = {
                        view: "household",
                        municipalities: [],
                        evacuations: [],
                        roads: [],
                        household: [household],
                        municipalitiesVisible: false,
                        evacuationsVisible: false,
                        roadsVisible: false,
                        householdVisible: true,
                        focusOn: household._id,
                        iconType: "professional"
                      };
                      
                      if (webViewRef.current) {
                        webViewRef.current.postMessage(JSON.stringify(data));
                      }
                      setShowHouseholdModal(false);
                    }}
                  >
                    <View style={styles.cardHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[
                          { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
                          household.isActive ? { backgroundColor: '#22c55e' } : { backgroundColor: '#9ca3af' }
                        ]} />
                        <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#1f2937' }}>
                          {household.userId?.fullName || 'No Name'}
                        </Text>
                      </View>
                      <View style={[
                        styles.statusBadge,
                        household.isActive ? styles.statusBadgeActive : styles.statusBadgeInactive
                      ]}>
                        <Text style={household.isActive ? styles.statusTextActive : styles.statusTextInactive}>
                          {household.isActive ? 'Active' : 'Inactive'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={{ marginBottom: 12 }}>
                      <View style={styles.infoRow}>
                        <FontAwesome5 name="hashtag" size={12} color="#6b7280" />
                        <Text style={{ color: '#6b7280', fontSize: 14, marginLeft: 8 }}>
                          <Text style={{ fontWeight: '600' }}>Code:</Text> {household.householdCode}
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <FontAwesome5 name="phone" size={12} color="#6b7280" />
                        <Text style={{ color: '#6b7280', fontSize: 14, marginLeft: 8 }}>
                          <Text style={{ fontWeight: '600' }}>Contact:</Text> {household.userId?.contactNumber || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <FontAwesome5 name="users" size={12} color="#6b7280" />
                        <Text style={{ color: '#6b7280', fontSize: 14, marginLeft: 8 }}>
                          <Text style={{ fontWeight: '600' }}>Members:</Text> {household.totalMembers || 0}/{household.familyMembers || 0}
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <FontAwesome5 name="map-marker-alt" size={12} color="#6b7280" />
                        <Text style={{ color: '#6b7280', fontSize: 14, marginLeft: 8 }}>
                          <Text style={{ fontWeight: '600' }}>Location:</Text> {household.location?.latitude.toFixed(6)}, {household.location?.longitude.toFixed(6)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.cardFooter}>
                      <Text style={{ fontSize: 12, color: '#6b7280' }}>
                        Created: {formatDate(household.createdAt)}
                      </Text>
                      <View style={styles.viewOnMap}>
                        <FontAwesome5 name="map-marker-alt" size={14} color="#8b5cf6" />
                        <Text style={{ fontSize: 12, color: '#8b5cf6', marginLeft: 4, fontWeight: '600' }}>View on Map</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* All Households Summary */}
              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <FontAwesome5 name="chart-bar" size={20} color="#3b82f6" />
                  <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginLeft: 8 }}>
                    Household Summary
                  </Text>
                </View>
                
                <View style={styles.statsContainer}>
                  <View style={[styles.statsHeader, { backgroundColor: '#eff6ff' }]}>
                    <Text style={{ fontWeight: '600', color: '#374151' }}>Statistics Overview</Text>
                  </View>
                  
                  <View style={{ padding: 16 }}>
                    <View style={styles.statsGrid}>
                      <View style={styles.statBox}>
                        <View style={styles.statBoxInner}>
                          <FontAwesome5 name="home" size={24} color="#3b82f6" />
                          <Text style={styles.statNumber}>{householdData.length}</Text>
                          <Text style={styles.statLabel}>Total Households</Text>
                        </View>
                      </View>
                      <View style={styles.statBox}>
                        <View style={[styles.statBoxInner, { backgroundColor: '#ecfdf5' }]}>
                          <FontAwesome5 name="map-marker-alt" size={24} color="#10b981" />
                          <Text style={[styles.statNumber, { color: '#10b981' }]}>{householdsWithLocation.length}</Text>
                          <Text style={styles.statLabel}>With Location</Text>
                        </View>
                      </View>
                      <View style={styles.statBox}>
                        <View style={[styles.statBoxInner, { backgroundColor: '#f5f3ff' }]}>
                          <FontAwesome5 name="check-circle" size={24} color="#8b5cf6" />
                          <Text style={[styles.statNumber, { color: '#8b5cf6' }]}>
                            {householdData.filter(h => h.isActive).length}
                          </Text>
                          <Text style={styles.statLabel}>Active</Text>
                        </View>
                      </View>
                      <View style={styles.statBox}>
                        <View style={[styles.statBoxInner, { backgroundColor: '#fff7ed' }]}>
                          <FontAwesome5 name="exclamation-circle" size={24} color="#f97316" />
                          <Text style={[styles.statNumber, { color: '#f97316' }]}>
                            {householdData.filter(h => h.isFull).length}
                          </Text>
                          <Text style={styles.statLabel}>Full</Text>
                        </View>
                      </View>
                    </View>
                    
                    {/* Sample Member Preview */}
                    {householdData[0]?.members && householdData[0].members.length > 0 && (
                      <View style={{ marginTop: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                          <FontAwesome5 name="users" size={16} color="#6b7280" />
                          <Text style={{ fontWeight: '600', color: '#374151', marginLeft: 8 }}>Sample Household Members:</Text>
                        </View>
                        {householdData[0].members.slice(0, 3).map((member, index) => (
                          <View key={member._id} style={styles.memberItem}>
                            <View style={styles.memberAvatar}>
                              <FontAwesome5 name="user" size={16} color="#8b5cf6" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontWeight: '500', color: '#1f2937' }}>{member.userId?.fullName}</Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                <Text style={{ fontSize: 12, color: '#6b7280', marginRight: 12 }}>{member.relationship}</Text>
                                <View style={[
                                  { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
                                  member.isActive ? { backgroundColor: '#dcfce7' } : { backgroundColor: '#f3f4f6' }
                                ]}>
                                  <Text style={[
                                    { fontSize: 12 },
                                    member.isActive ? { color: '#166534' } : { color: '#374151' }
                                  ]}>
                                    {member.isActive ? 'Active' : 'Inactive'}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>
              
              {/* Map Controls Info */}
              <View style={styles.mapInfoBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <FontAwesome5 name="map" size={18} color="#3b82f6" />
                  <Text style={{ fontWeight: '600', color: '#1e40af', marginLeft: 8 }}>Map Controls</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                  <FontAwesome5 name="check-circle" size={14} color="#3b82f6" style={{ marginTop: 2 }} />
                  <Text style={{ color: '#1d4ed8', fontSize: 14, marginLeft: 8, flex: 1 }}>
                    Tap on household cards above to view precise location on map
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                  <FontAwesome5 name="check-circle" size={14} color="#3b82f6" style={{ marginTop: 2 }} />
                  <Text style={{ color: '#1d4ed8', fontSize: 14, marginLeft: 8, flex: 1 }}>
                    Use the buttons below to switch between different map views
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <FontAwesome5 name="check-circle" size={14} color="#3b82f6" style={{ marginTop: 2 }} />
                  <Text style={{ color: '#1d4ed8', fontSize: 14, marginLeft: 8, flex: 1 }}>
                    Collapse the control panel for full-screen map view
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bottom Control Panel */}
      <Animated.View
        style={[
          styles.controlPanel,
          {
            transform: [{ translateY: slideAnim }],
            height: panelHeight,
          }
        ]}
      >
        {/* Collapse Header */}
        <TouchableOpacity
          style={styles.collapseHeader}
          onPress={toggleCollapse}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={30}
                color="#3b82f6"
              />
            </Animated.View>
            <Text style={styles.collapseText}>
              {isCollapsed ? "Tap to Show Controls" : "Tap to Hide Controls"}
            </Text>
          </View>
        </TouchableOpacity>

        {!isInitialized ? (
          <View style={styles.loadingDataContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <MaterialIcons name="sync" size={28} color="#3b82f6" />
              <Text style={{ color: '#3b82f6', fontSize: 16, fontWeight: '600', marginLeft: 12 }}>
                Loading map data...
              </Text>
            </View>
            <View style={{ backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
              <Text style={{ color: '#6b7280', fontSize: 14, fontWeight: '500' }}>
                Municipalities: {barangays.length} | Evacuations: {evacuations.length} | Households: {householdData.length}
              </Text>
            </View>
          </View>
        ) : (
          <>
            {/* Expanded State - Only show when not collapsed */}
            {!isCollapsed && (
              <View style={styles.buttonContainer}>
                {/* Show All Button */}
                <TouchableOpacity
                  style={[styles.fullButton, { marginBottom: 16 }]}
                  onPress={handleBothPress}
                  activeOpacity={0.8}
                >
                  <View style={styles.buttonContent}>
                    <MaterialIcons name="layers" size={20} color="#ffffff" />
                    <Text style={styles.buttonText}>
                      Show All Layers
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* First row of buttons */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonBlue]}
                    onPress={handleMunicipalitiesPress}
                    disabled={!isInitialized}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.buttonContent, { position: 'relative' }]}>
                      <MaterialIcons
                        name="location-city"
                        size={22}
                        color="#ffffff"
                      />
                      <Text style={styles.buttonText}>
                        Municipalities
                      </Text>
                      <View style={[styles.countBadge, { borderColor: '#bfdbfe' }]}>
                        <Text style={{ color: '#2563eb', fontSize: 12, fontWeight: '800' }}>{barangays.length}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.buttonOrange]}
                    onPress={handleEvacuationsPress}
                    disabled={!isInitialized}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.buttonContent, { position: 'relative' }]}>
                      <MaterialIcons
                        name="place"
                        size={22}
                        color="#ffffff"
                      />
                      <Text style={styles.buttonText}>
                        Evacuations
                      </Text>
                      <View style={[styles.countBadge, { borderColor: '#fed7aa' }]}>
                        <Text style={{ color: '#ea580c', fontSize: 12, fontWeight: '800' }}>{evacuations.length}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Second row of buttons */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonEmerald]}
                    onPress={handleRoadsPress}
                    disabled={!isInitialized}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.buttonContent, { position: 'relative' }]}>
                      <MaterialIcons
                        name="directions"
                        size={22}
                        color="#ffffff"
                      />
                      <Text style={styles.buttonText}>
                        Roads
                      </Text>
                      <View style={[styles.countBadge, { borderColor: '#a7f3d0' }]}>
                        <Text style={{ color: '#059669', fontSize: 12, fontWeight: '800' }}>0</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.buttonViolet]}
                    onPress={handleHouseholdPress}
                    disabled={!isInitialized}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.buttonContent, { position: 'relative' }]}>
                      <MaterialIcons
                        name="home"
                        size={22}
                        color="#ffffff"
                      />
                      <Text style={styles.buttonText}>
                        Households
                      </Text>
                      <View style={[styles.countBadge, { borderColor: '#ddd6fe' }]}>
                        <Text style={{ color: '#7c3aed', fontSize: 12, fontWeight: '800' }}>{householdData.length}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Collapsed State - Only show when collapsed */}
            {isCollapsed && (
              <View style={styles.collapsedContent}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 8, marginBottom: 4 }}>
                    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#3b82f6', marginRight: 4, alignItems: 'center', justifyContent: 'center' }}>
                      <MaterialIcons name="location-city" size={10} color="white" />
                    </View>
                    <Text style={{ color: '#1f2937', fontSize: 14, fontWeight: '600' }}>
                      M: {barangays.length}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 8, marginBottom: 4 }}>
                    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#f97316', marginRight: 4, alignItems: 'center', justifyContent: 'center' }}>
                      <MaterialIcons name="place" size={10} color="white" />
                    </View>
                    <Text style={{ color: '#1f2937', fontSize: 14, fontWeight: '600' }}>
                      E: {evacuations.length}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 8, marginBottom: 4 }}>
                    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#10b981', marginRight: 4, alignItems: 'center', justifyContent: 'center' }}>
                      <MaterialIcons name="directions" size={10} color="white" />
                    </View>
                    <Text style={{ color: '#1f2937', fontSize: 14, fontWeight: '600' }}>R</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 8, marginBottom: 4 }}>
                    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#8b5cf6', marginRight: 4, alignItems: 'center', justifyContent: 'center' }}>
                      <MaterialIcons name="home" size={10} color="white" />
                    </View>
                    <Text style={{ color: '#1f2937', fontSize: 14, fontWeight: '600' }}>
                      H: {householdData.length}
                    </Text>
                  </View>
                </View>
                <View style={{ backgroundColor: '#eff6ff', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 }}>
                  <Text style={{ color: '#6b7280', fontSize: 12, fontWeight: '500' }}>
                    Tap arrow ↑ to show controls
                  </Text>
                </View>
              </View>
            )}
          </>
        )}
      </Animated.View>
    </View>
  );
}