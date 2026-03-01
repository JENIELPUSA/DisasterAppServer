import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
} from "react-native";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Location from "expo-location";
import MaplibreGL from "@maplibre/maplibre-react-native";
import * as Speech from "expo-speech";

// Import Sidebars
import SidebarHousehold from "./SidebarHousehold";
import BarangaySidebar from "./BarangaySidebar";
import LegendModal from "./LegendModal";
import SidebarEvacuation from "./EvacuationSidebar";
import IncidentSidebar from "./IncidentSidebar";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get("window");
const MAPTILER_KEY = Constants.expoConfig?.extra?.maptilerKey || "YOUR_KEY";
const TILE_URL = `https://api.maptiler.com/maps/streets-v2-dark/256/{z}/{x}/{y}@2x.png?key=${MAPTILER_KEY}`;

MaplibreGL.setAccessToken(null);

// ✅ Optional: Suppress MapLibre "Canceled" warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('Request failed due to a permanent error: Canceled')) {
    return;
  }
  originalWarn(...args);
};

const SEVERITY_COLORS = {
  high: "#ef4444",
  medium: "#f97316",
  low: "#22c55e",
};

// Throttle interval para sa camera updates (milliseconds)
const CAMERA_UPDATE_THROTTLE = 500;
// Threshold para sa off‑road detection (meters)
const OFFROAD_THRESHOLD = 30;

const NavigationMap = ({
  destination,
  evacuations = [],
  onSelectDestination,
  onStopNavigation,
  dropdownhousehold = [],
  displayDropdownInMaps,
  PinpointHousehold = [],
  getHouseholdLeadsByBarangayId,
  incidentReports = [],
}) => {
  const cameraRef = useRef(null);
  const barangayOverlayOpacity = useRef(new Animated.Value(0)).current;


  console.log("PinpointHousehold",PinpointHousehold)

  // Ref para iwasan ang pag-override ng zoom habang nagfo-follow
  const initialFollowSet = useRef(false);
  // Throttle ref para sa camera updates
  const lastCameraUpdate = useRef(0);
  const isCameraLockedRef = useRef(true); 
  const [isCameraLockedState, setIsCameraLockedState] = useState(true);
  // Ref para iwasan ang redundant state updates
  const isFollowingRef = useRef(false);

  const [pulseCircleRadius, setPulseCircleRadius] = useState(0);
  const [pulseCircleOpacity, setPulseCircleOpacity] = useState(0.8);

  const [userLocation, setUserLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: 0 });
  const [initialDistance, setInitialDistance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showBarangaySidebar, setShowBarangaySidebar] = useState(false);
  const [showLegendModal, setShowLegendModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [sidebarType, setSidebarType] = useState(null);

  // --- OFF-ROAD STATE (ginagamit pa rin sa logic pero hindi na ipinapakita) ---
  const [isOffRoad, setIsOffRoad] = useState(false);

  // --- SPEECH STATES ---
  const [hasAnnouncedStart, setHasAnnouncedStart] = useState(false);
  const [hasAnnouncedNear, setHasAnnouncedNear] = useState(false);
  const [hasAnnouncedArrival, setHasAnnouncedArrival] = useState(false);

  // SPEECH TRACKER: Set para hindi paulit-ulit ang salita sa bawat report
  const announcedTypesRef = useRef(new Set());

  // --- ZIGZAG / WINDING ROAD DETECTION ---
  const [windingZones, setWindingZones] = useState([]);             // bagong state
  const announcedWindingRef = useRef(new Set());                    // bagong ref

  const hasDestination = !!(destination?.latitude && destination?.longitude);

  // Sync ref with state para sa guard conditions
  useEffect(() => {
    isFollowingRef.current = isFollowing;
  }, [isFollowing]);

  // ✅ Sync lock ref with state
  useEffect(() => {
    isCameraLockedRef.current = isCameraLockedState;
  }, [isCameraLockedState]);

  // ✅ I-lock ang camera kapag walang destination, i-unlock kapag may destination
  useEffect(() => {
    if (hasDestination) {
      setIsCameraLockedState(false);
      isCameraLockedRef.current = false;
      console.log('🔓 Camera UNLOCKED - Navigation active');
    } else {
      setIsCameraLockedState(true);
      isCameraLockedRef.current = true;
      console.log('🔒 Camera LOCKED - No navigation');
    }
  }, [hasDestination]);

  const setIsFollowingWithLog = (value, source = "unknown") => {
    if (isFollowingRef.current === value) return;
    console.log(`setIsFollowing: ${value} (from: ${source})`);
    setIsFollowing(value);
  };

  const speak = (text) => {
    Speech.speak(text, { language: "tl-PH", pitch: 1.0, rate: 0.9 });
  };

  const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // --- DISTANCE IN METERS (for off‑road detection and winding zones) ---
  const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // --- BAGONG FUNCTIONS PARA SA ZIGZAG DETECTION ---

  // Calculate bearing between two points (degrees)
  const calculateBearing = (lat1, lon1, lat2, lon2) => {
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    return (θ * 180 / Math.PI + 360) % 360;
  };

  // Identify winding sections from route coordinates
  const computeWindingZones = (coords) => {
    if (!coords || coords.length < 3) return [];
    const TURN_ANGLE_THRESHOLD = 30; // degrees
    const ZONE_MERGE_DISTANCE = 200; // meters
    const zones = [];
    let currentZone = null;

    for (let i = 1; i < coords.length - 1; i++) {
      const p1 = coords[i - 1];
      const p2 = coords[i];
      const p3 = coords[i + 1];

      const bearing1 = calculateBearing(p1[1], p1[0], p2[1], p2[0]);
      const bearing2 = calculateBearing(p2[1], p2[0], p3[1], p3[0]);
      let angleDiff = Math.abs(bearing2 - bearing1);
      if (angleDiff > 180) angleDiff = 360 - angleDiff;

      if (angleDiff > TURN_ANGLE_THRESHOLD) {
        // May liko
        const turnPoint = p2;
        if (!currentZone) {
          currentZone = { points: [turnPoint], startIndex: i };
        } else {
          const lastPoint = currentZone.points[currentZone.points.length - 1];
          const dist = getDistanceInMeters(lastPoint[1], lastPoint[0], turnPoint[1], turnPoint[0]);
          if (dist <= ZONE_MERGE_DISTANCE) {
            currentZone.points.push(turnPoint);
          } else {
            // Tapusin ang kasalukuyang zone kung may hindi bababa sa 2 liko
            if (currentZone.points.length >= 2) {
              const avgLon = currentZone.points.reduce((sum, p) => sum + p[0], 0) / currentZone.points.length;
              const avgLat = currentZone.points.reduce((sum, p) => sum + p[1], 0) / currentZone.points.length;
              zones.push({ coordinates: [avgLon, avgLat], points: currentZone.points });
            }
            currentZone = { points: [turnPoint], startIndex: i };
          }
        }
      } else {
        // Hindi liko, tapusin ang kasalukuyang zone kung mayroon
        if (currentZone) {
          if (currentZone.points.length >= 2) {
            const avgLon = currentZone.points.reduce((sum, p) => sum + p[0], 0) / currentZone.points.length;
            const avgLat = currentZone.points.reduce((sum, p) => sum + p[1], 0) / currentZone.points.length;
            zones.push({ coordinates: [avgLon, avgLat], points: currentZone.points });
          }
          currentZone = null;
        }
      }
    }
    // Tapusin ang huling zone
    if (currentZone && currentZone.points.length >= 2) {
      const avgLon = currentZone.points.reduce((sum, p) => sum + p[0], 0) / currentZone.points.length;
      const avgLat = currentZone.points.reduce((sum, p) => sum + p[1], 0) / currentZone.points.length;
      zones.push({ coordinates: [avgLon, avgLat], points: currentZone.points });
    }
    return zones;
  };

  // Compute minimum distance from user to any point on the route
  const distanceToRoute = (pointLonLat, routeCoords) => {
    const [lon, lat] = pointLonLat;
    let minDist = Infinity;
    for (let i = 0; i < routeCoords.length; i++) {
      const [rLon, rLat] = routeCoords[i];
      const dist = getDistanceInMeters(lat, lon, rLat, rLon);
      if (dist < minDist) minDist = dist;
      if (minDist < OFFROAD_THRESHOLD) break;
    }
    return minDist;
  };

  // --- OFF-ROAD DETECTION EFFECT (state lang, walang visual) ---
  useEffect(() => {
    if (!userLocation || routeCoordinates.length === 0) {
      setIsOffRoad(false);
      return;
    }
    const distance = distanceToRoute(
      [userLocation.longitude, userLocation.latitude],
      routeCoordinates
    );
    setIsOffRoad(distance > OFFROAD_THRESHOLD);
  }, [userLocation, routeCoordinates]);

  // --- LOGIC: NAVIGATION PROGRESS SPEECH ---
  useEffect(() => {
    if (!hasDestination || routeInfo.distance <= 0) return;
    const metersLeft = routeInfo.distance;
    if (!hasAnnouncedStart && routeCoordinates.length > 0) {
      speak(`Navigating to ${destination.name || "destination"}.`);
      setHasAnnouncedStart(true);
    }
    if (metersLeft <= 100 && metersLeft > 20 && !hasAnnouncedNear) {
      speak("You are close to your destination.");
      setHasAnnouncedNear(true);
    }
    if (metersLeft <= 15 && !hasAnnouncedArrival) {
      speak("You have arrived at your destination.");
      setHasAnnouncedArrival(true);
    }
  }, [routeInfo.distance, hasDestination, routeCoordinates]);

  // --- LOGIC: HAZARD VOICE ALERTS (LANDSLIDE & FLOOD) ---
  useEffect(() => {
    if (!userLocation || incidentReports.length === 0) return;

    const PROXIMITY_THRESHOLD = 0.5;
    const nearbyTypes = new Set();

    incidentReports.forEach((report) => {
      const dist = getDistanceInKm(
        userLocation.latitude,
        userLocation.longitude,
        report.location.latitude,
        report.location.longitude,
      );

      if (dist <= PROXIMITY_THRESHOLD) {
        const type = report.reportType?.toLowerCase();
        nearbyTypes.add(type);

        if (!announcedTypesRef.current.has(type)) {
          announcedTypesRef.current.add(type);

          if (type === "flood" || type === "baha") {
            speak(
              "Warning: Flood reported in this area. Please proceed with caution.",
            );
          } else if (type === "landslide") {
            speak("Warning: Landslide reported nearby. Please stay alert.");
          } else {
            speak(`Caution: There is a reported ${type} in this area.`);
          }
        }
      }
    });

    if (nearbyTypes.size === 0 && announcedTypesRef.current.size > 0) {
      announcedTypesRef.current.clear();
    }
  }, [userLocation, incidentReports]);

  // --- BAGONG EFFECT: Compute winding zones kapag nagbago ang ruta ---
  useEffect(() => {
    if (routeCoordinates.length > 0) {
      const zones = computeWindingZones(routeCoordinates);
      setWindingZones(zones);
      announcedWindingRef.current.clear(); // i-reset para sa bagong ruta
    } else {
      setWindingZones([]);
    }
  }, [routeCoordinates]);

  // --- BAGONG EFFECT: I-monitor ang lokasyon para mag-voice reminder sa zigzag ---
  useEffect(() => {
    if (!userLocation || windingZones.length === 0 || !hasDestination) return;

    const PROXIMITY_THRESHOLD = 300; // metro
    windingZones.forEach((zone, index) => {
      const dist = getDistanceInMeters(
        userLocation.latitude,
        userLocation.longitude,
        zone.coordinates[1], // latitude
        zone.coordinates[0]  // longitude
      );
      const zoneId = `winding-${index}`;
      if (dist <= PROXIMITY_THRESHOLD && !announcedWindingRef.current.has(zoneId)) {
        speak("Approaching a winding road. Please drive carefully..");
        announcedWindingRef.current.add(zoneId);
      }
    });
  }, [userLocation, windingZones, hasDestination]);

  // --- PULSE ANIMATION ---
  useEffect(() => {
    let frameId;
    let startTime = Date.now();
    const duration = 2000;
    const animate = () => {
      const now = Date.now();
      const progress = ((now - startTime) % duration) / duration;
      setPulseCircleRadius(progress * 35);
      setPulseCircleOpacity(0.8 * (1 - progress));
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const handleNearestIncident = (type) => {
    if (!userLocation || incidentReports.length === 0) {
      Alert.alert("Info", `Walang nakitang data para sa ${type}.`);
      return;
    }
    const filtered = incidentReports.filter(
      (r) => r.reportType?.toLowerCase() === type.toLowerCase(),
    );
    if (filtered.length === 0) {
      Alert.alert(
        "Walang Report",
        `Sa kasalukuyan ay walang reported na ${type}.`,
      );
      return;
    }
    let nearest = null;
    let minDistance = Infinity;
    filtered.forEach((report) => {
      const d = Math.sqrt(
        Math.pow(report.location.latitude - userLocation.latitude, 2) +
          Math.pow(report.location.longitude - userLocation.longitude, 2),
      );
      if (d < minDistance) {
        minDistance = d;
        nearest = report;
      }
    });
    if (nearest && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [
          nearest.location.longitude,
          nearest.location.latitude,
        ],
        zoomLevel: 17,
        animationDuration: 1500,
      });
      setIsFollowingWithLog(false, "handleNearestIncident");
    }
  };

  const handleNearestEvacuation = () => {
    if (!userLocation || evacuations.length === 0) return;
    let nearest = null;
    let minDistance = Infinity;
    evacuations.forEach((evac) => {
      const d = Math.sqrt(
        Math.pow(evac.location.latitude - userLocation.latitude, 2) +
          Math.pow(evac.location.longitude - userLocation.longitude, 2),
      );
      if (d < minDistance) {
        minDistance = d;
        nearest = evac;
      }
    });
    if (nearest) {
      onSelectDestination({
        latitude: nearest.location.latitude,
        longitude: nearest.location.longitude,
        name: nearest.name,
      });
      setIsFollowingWithLog(true, "handleNearestEvacuation");
    }
  };

  // ✅ Camera update logic - ONLY runs when navigation is ACTIVE
  useEffect(() => {
    if (isCameraLockedRef.current) return;
    if (!hasDestination || !isFollowing || !userLocation || !cameraRef.current) {
      initialFollowSet.current = false;
      return;
    }

    const now = Date.now();
    if (now - lastCameraUpdate.current < CAMERA_UPDATE_THROTTLE) return;
    lastCameraUpdate.current = now;

    if (!initialFollowSet.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [userLocation.longitude, userLocation.latitude],
        zoomLevel: hasDestination ? 18.5 : 15.5,
        pitch: hasDestination ? 65 : 0,
        heading: heading,
        animationDuration: 1000,
      });
      initialFollowSet.current = true;
      console.log('📍 Initial camera set - Following GPS');
    } else {
      cameraRef.current.setCamera({
        centerCoordinate: [userLocation.longitude, userLocation.latitude],
        heading: heading,
        animationDuration: 1000,
      });
      console.log('📍 Camera following GPS');
    }
  }, [userLocation, heading, isFollowing, hasDestination]);

  // I-reset ang isFollowing kapag nawala ang destination
  useEffect(() => {
    if (!hasDestination) {
      setIsFollowingWithLog(false, "hasDestination changed");
    }
  }, [hasDestination]);

  // ✅ GPS Watch
  useEffect(() => {
    let locSub, headSub;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      headSub = await Location.watchHeadingAsync((d) =>
        setHeading(d.trueHeading !== -1 ? d.trueHeading : d.magneticHeading),
      );
      locSub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 1 },
        (l) => {
          setUserLocation({
            latitude: l.coords.latitude,
            longitude: l.coords.longitude,
          });
          setLoading(false);
        },
      );
    })();
    return () => {
      locSub?.remove();
      headSub?.remove();
    };
  }, []);

  useEffect(() => {
    if (!hasDestination || !userLocation) return;
    
    const abortController = new AbortController();
    
    (async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${userLocation.longitude},${userLocation.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`,
          { signal: abortController.signal }
        );
        const data = await res.json();
        if (data?.code === "Ok") {
          setRouteCoordinates(data.routes[0].geometry.coordinates);
          setRouteInfo({
            distance: data.routes[0].distance,
            duration: data.routes[0].duration,
          });
          if (initialDistance === null)
            setInitialDistance(data.routes[0].distance);
        }
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error(e);
        }
      }
    })();
    
    return () => {
      abortController.abort();
    };
  }, [destination, userLocation]);

  const handleStopNavigation = () => {
    console.log('🛑 Stop Navigation - BULLETPROOF RESET');
    
    isCameraLockedRef.current = true;
    setIsCameraLockedState(true);
    lastCameraUpdate.current = Date.now();
    setRouteCoordinates([]);
    setInitialDistance(null);
    setRouteInfo({ distance: 0, duration: 0 });
    setIsFollowingWithLog(false, "handleStopNavigation");
    setHasAnnouncedStart(false);
    setHasAnnouncedNear(false);
    setHasAnnouncedArrival(false);
    announcedTypesRef.current.clear();
    announcedWindingRef.current.clear();   // i-clear din ang winding announcements
    initialFollowSet.current = false;
    lastCameraUpdate.current = 0;
    if (onStopNavigation) onStopNavigation();
    
    console.log('✅ Navigation COMPLETELY RESET - Camera LOCKED from GPS');
  };

  const closeSidebar = () => {
    setSelectedData(null);
    setSidebarType(null);
  };

  const openBarangaySidebar = async () => {
    if (displayDropdownInMaps) await displayDropdownInMaps();
    setShowBarangaySidebar(true);
    Animated.timing(barangayOverlayOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeBarangaySidebar = useCallback(() => {
    Animated.timing(barangayOverlayOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowBarangaySidebar(false));
  }, [barangayOverlayOpacity]);

  const handleMapPress = (event) => {
    const feature = event.features[0];
    if (!feature) return;
    setIsFollowingWithLog(false, "handleMapPress");
    const data =
      typeof feature.properties.rawData === "string"
        ? JSON.parse(feature.properties.rawData)
        : feature.properties.rawData;
    if (feature.properties.type === "household") {
      setSidebarType("household");
      setSelectedData(data);
    } else if (feature.properties.type === "evacuation") {
      setSidebarType("evacuation");
      setSelectedData(data);
    } else if (feature.properties.type === "incident") {
      setSidebarType("incident");
      setSelectedData(data);
    }
  };

  // --- DYNAMIC ZOOM CONTROLS ---
  const handleZoomIn = useCallback(async () => {
    if (cameraRef.current) {
      try {
        const currentCam = await cameraRef.current.getCamera();
        const newZoom = (currentCam.zoom || 10) + 1;
        cameraRef.current.setCamera({ zoomLevel: newZoom, animationDuration: 300 });
      } catch (e) {
        console.warn("Failed to get camera for zoom in", e);
      }
    }
  }, []);

  const handleZoomOut = useCallback(async () => {
    if (cameraRef.current) {
      try {
        const currentCam = await cameraRef.current.getCamera();
        const newZoom = Math.max((currentCam.zoom || 10) - 1, 1);
        cameraRef.current.setCamera({ zoomLevel: newZoom, animationDuration: 300 });
      } catch (e) {
        console.warn("Failed to get camera for zoom out", e);
      }
    }
  }, []);

  const householdGeoJSON = {
    type: "FeatureCollection",
    features: (PinpointHousehold || []).map((hh) => ({
      type: "Feature",
      id: hh._id,
      properties: {
        type: "household",
        status: hh.rescueStatus || "none",
        rawData: hh,
      },
      geometry: {
        type: "Point",
        coordinates: [hh.location.longitude, hh.location.latitude],
      },
    })),
  };

  const evacuationGeoJSON = {
    type: "FeatureCollection",
    features: (evacuations || []).map((evac) => ({
      type: "Feature",
      id: evac._id,
      properties: { type: "evacuation", rawData: evac },
      geometry: {
        type: "Point",
        coordinates: [evac.location.longitude, evac.location.latitude],
      },
    })),
  };

  const incidentGeoJSON = {
    type: "FeatureCollection",
    features: (incidentReports || []).map((report) => ({
      type: "Feature",
      id: report._id,
      properties: {
        type: "incident",
        reportType: report.reportType,
        severity: report.severity,
        rawData: report,
      },
      geometry: {
        type: "Point",
        coordinates: [report.location.longitude, report.location.latitude],
      },
    })),
  };

  const progress =
    initialDistance > 0
      ? Math.min(Math.max(1 - routeInfo.distance / initialDistance, 0), 1)
      : 0;

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: "#fff", marginTop: 10 }}>
          Initializing GPS...
        </Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <MaplibreGL.MapView
        style={styles.map}
        logoEnabled={false}
        attributionEnabled={false}
        styleURL={MaplibreGL.StyleURL.Dark}
        onPress={() => setIsFollowingWithLog(false, "MapView onPress")}
        onCameraChanged={(event) => {
          if (event.nativeEvent?.gestures?.length > 0) {
            setIsFollowingWithLog(false, "onCameraChanged gesture");
          }
        }}
      >
        <MaplibreGL.Camera ref={cameraRef} />

        <MaplibreGL.Images
          images={{
            navigation: require("../../../../assets/navigation.png"),
            evacuation: require("../../../../assets/evacuation.png"),
            household_none: require("../../../../assets/none.png"),
            household_pending: require("../../../../assets/pending.png"),
            household_rescued: require("../../../../assets/rescued.png"),
            household_inprogress: require("../../../../assets/inprogress.png"),
            landslide_icon: require("../../../../assets/landslide.png"),
            flood_icon: require("../../../../assets/flood.png"),
            fire_icon: require("../../../../assets/fire.png"),
            accident_icon: require("../../../../assets/accident.png"),
            earthquake_icon: require("../../../../assets/earthquake.png"),
            destination_icon: require("../../../../assets/End.png"),
          }}
        />

        <MaplibreGL.RasterSource id="maptiler" tileUrlTemplates={[TILE_URL]}>
          <MaplibreGL.RasterLayer id="maptilerLayer" />
        </MaplibreGL.RasterSource>

        {/* ✅ OFF-ROAD DOT - TINANGGAL NA (i-uncomment kung gusto mong ibalik) */}
        {/* {isOffRoad && userLocation && (
          <MaplibreGL.ShapeSource
            id="offRoadDotSource"
            shape={{
              type: "FeatureCollection",
              features: [{
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [userLocation.longitude, userLocation.latitude],
                },
              }],
            }}
          >
            <MaplibreGL.CircleLayer
              id="offRoadDot"
              style={{
                circleRadius: 12,
                circleColor: "#ffffff",
                circleOpacity: 0.8,
                circlePitchAlignment: "map",
              }}
            />
          </MaplibreGL.ShapeSource>
        )} */}

        {/* ✅ ROUTE LINES - nasa ilalim ng user marker gamit ang belowLayerID */}
        {routeCoordinates.length > 0 && (
          <MaplibreGL.ShapeSource
            id="routeSource"
            shape={{
              type: "Feature",
              geometry: { type: "LineString", coordinates: routeCoordinates },
            }}
          >
            <MaplibreGL.LineLayer
              id="routeMain"
              belowLayerID="userSymbol"   // 👈 SIGURADONG NASA ILALIM NG USER ICON
              style={{
                lineColor: "#3b82f6",
                lineWidth: 6,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            <MaplibreGL.LineLayer
              id="routeZigzag"
              belowLayerID="userSymbol"   // 👈 SIGURADONG NASA ILALIM DIN
              style={{
                lineColor: "rgba(255,255,255,0.5)",
                lineWidth: 2,
                lineDasharray: [2, 2],
                lineCap: "round",
              }}
            />
          </MaplibreGL.ShapeSource>
        )}

        {/* ✅ INCIDENT ICONS */}
        <MaplibreGL.ShapeSource
          id="incidentSource"
          shape={incidentGeoJSON}
          onPress={handleMapPress}
        >
          <MaplibreGL.CircleLayer
            id="incidentPulse"
            style={{
              circleRadius: pulseCircleRadius,
              circleColor: [
                "match",
                ["get", "severity"],
                "high",
                SEVERITY_COLORS.high,
                "medium",
                SEVERITY_COLORS.medium,
                "low",
                SEVERITY_COLORS.low,
                "#ccc",
              ],
              circleOpacity: pulseCircleOpacity,
              circlePitchAlignment: "map",
            }}
          />
          <MaplibreGL.SymbolLayer
            id="incidentSymbol"
            style={{
              iconImage: [
                "match",
                ["get", "reportType"],
                "landslide",
                "landslide_icon",
                "flood",
                "flood_icon",
                "fire",
                "fire_icon",
                "accident",
                "accident_icon",
                "earthquake",
                "earthquake_icon",
                "household_none",
              ],
              iconSize: 0.10,
              iconAllowOverlap: true,
              iconIgnorePlacement: true,
              iconAnchor: "bottom",
              iconOffset: [0, -10],
            }}
          />
        </MaplibreGL.ShapeSource>

        {/* ✅ EVACUATION ICONS */}
        <MaplibreGL.ShapeSource
          id="evacuationSource"
          shape={evacuationGeoJSON}
          onPress={handleMapPress}
        >
          <MaplibreGL.SymbolLayer
            id="evacuationSymbol"
            style={{
              iconImage: "evacuation",
              iconSize: 0.07,
              iconAllowOverlap: true,
              iconIgnorePlacement: true,
              iconAnchor: "bottom",
            }}
          />
        </MaplibreGL.ShapeSource>

        {/* ✅ HOUSEHOLD ICONS */}
        <MaplibreGL.ShapeSource
          id="householdSource"
          shape={householdGeoJSON}
          onPress={handleMapPress}
        >
          <MaplibreGL.SymbolLayer
            id="householdSymbol"
            style={{
              iconImage: [
                "match",
                ["get", "status"],
                "pending",
                "household_pending",
                "rescued",
                "household_rescued",
                "in_progress",
                "household_inprogress",
                "household_none",
              ],
              iconSize: 0.07,
              iconAllowOverlap: true,
              iconIgnorePlacement: true,
              iconAnchor: "bottom",
            }}
          />
        </MaplibreGL.ShapeSource>

        {/* ✅ DESTINATION PIN */}
        {hasDestination && (
          <MaplibreGL.ShapeSource
            id="destinationPinSource"
            shape={{
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [destination.longitude, destination.latitude],
              },
            }}
          >
            <MaplibreGL.SymbolLayer
              id="destinationPinSymbol"
              style={{
                iconImage: "destination_icon",
                iconSize: 0.08,
                iconAllowOverlap: true,
                iconIgnorePlacement: true,
                iconAnchor: "bottom",
              }}
            />
          </MaplibreGL.ShapeSource>
        )}

        {/* ✅ USER MARKER - NASA PINAKADULO PARA NASA IBABAW NG LAHAT */}
        {userLocation && (
          <MaplibreGL.ShapeSource
            id="userSource"
            shape={{
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [userLocation.longitude, userLocation.latitude],
              },
            }}
          >
            <MaplibreGL.SymbolLayer
              id="userSymbol"
              style={{
                iconImage: "navigation",
                iconSize: 0.15,
                iconRotate: heading,
                iconRotationAlignment: "map",
                iconAllowOverlap: true,
                iconIgnorePlacement: true,
              }}
              // TINANGGAL ANG aboveLayerID - hindi na kailangan dahil ang route lines ang nasa ilalim gamit ang belowLayerID
            />
          </MaplibreGL.ShapeSource>
        )}
      </MaplibreGL.MapView>

      {hasDestination && (
        <View style={[styles.infoBox, isCollapsed && styles.infoBoxCollapsed]}>
          <View style={styles.panelHeader}>
            <View style={styles.statusHeader}>
              <View
                style={[
                  styles.liveDot,
                  { backgroundColor: isFollowing ? "#22c55e" : "#ff9800" },
                ]}
              />
              <Text
                style={[
                  styles.liveText,
                  { color: isFollowing ? "#22c55e" : "#ff9800" },
                ]}
              >
                {isFollowing ? "FOLLOWING" : "MANUAL"}
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              {!isCollapsed && (
                <TouchableOpacity
                  style={styles.stopBtn}
                  onPress={handleStopNavigation}
                >
                  <MaterialIcons name="close" size={14} color="#fff" />
                  <Text style={styles.stopText}>STOP</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => {
                  LayoutAnimation.easeInEaseOut();
                  setIsCollapsed(!isCollapsed);
                }}
              >
                <Ionicons
                  name={isCollapsed ? "chevron-down" : "chevron-up"}
                  size={22}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>
          {!isCollapsed && (
            <View>
              <View style={styles.infoContent}>
                <View>
                  <Text style={styles.label}>Est. Time</Text>
                  <Text style={styles.timeText}>
                    {Math.round(routeInfo.duration / 60)} min
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.label}>Distance</Text>
                  <Text style={styles.distanceText}>
                    {(routeInfo.distance / 1000).toFixed(1)} km
                  </Text>
                </View>
              </View>
              <View style={styles.progressBarWrapper}>
                <View style={styles.progressBackground} />
                <View
                  style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
              </View>
            </View>
          )}
        </View>
      )}

      {/* Zoom Controls */}
      <View style={styles.zoomContainer}>
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
          <MaterialIcons name="remove" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.fabContainer}>
        {/* GPS FOLLOW BUTTON - visible only during navigation */}
        {hasDestination && (
          <TouchableOpacity
            style={[
              styles.fab,
              { backgroundColor: isFollowing ? "#3b82f6" : "#ffffff" },
            ]}
            onPress={() => {
              isCameraLockedRef.current = false;
              setIsCameraLockedState(false);
              setIsFollowingWithLog(!isFollowing, "FAB toggle");
            }}
          >
            <MaterialIcons
              name={isFollowing ? "gps-fixed" : "gps-not-fixed"}
              size={26}
              color={isFollowing ? "white" : "#4b5563"}
            />
          </TouchableOpacity>
        )}

        {/* Other FABs - visible only when no navigation */}
        {!hasDestination && (
          <>
            <TouchableOpacity
              style={[styles.fab, { backgroundColor: "#78350f" }]}
              onPress={() => handleNearestIncident("landslide")}
            >
              <FontAwesome5 name="mountain" size={18} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.fab, { backgroundColor: "#1e40af" }]}
              onPress={() => handleNearestIncident("flood")}
            >
              <FontAwesome5 name="water" size={18} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.fab, { backgroundColor: "#facc15" }]}
              onPress={handleNearestEvacuation}
            >
              <MaterialIcons name="near-me" size={28} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.fab, { backgroundColor: "#059669" }]}
              onPress={openBarangaySidebar}
            >
              <MaterialIcons name="map" size={26} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.fab, { backgroundColor: "#4b5563" }]}
              onPress={() => setShowLegendModal(true)}
            >
              <MaterialIcons name="legend-toggle" size={26} color="white" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Sidebars */}
      {sidebarType === "incident" && selectedData && (
        <IncidentSidebar
          show={true}
          onClose={closeSidebar}
          report={selectedData}
          onNavigate={(r) => {
            onSelectDestination({
              latitude: r.location.latitude,
              longitude: r.location.longitude,
              name: r.address,
            });
            isCameraLockedRef.current = false;
            setIsCameraLockedState(false);
            setIsFollowingWithLog(true, "IncidentSidebar onNavigate");
            closeSidebar();
          }}
        />
      )}
      {sidebarType === "household" && selectedData && (
        <SidebarHousehold
          show={true}
          onClose={closeSidebar}
          household={selectedData}
          onSelectDestination={(h) => {
            onSelectDestination(h);
            isCameraLockedRef.current = false;
            setIsCameraLockedState(false);
            closeSidebar();
          }}
        />
      )}
      {sidebarType === "evacuation" && selectedData && (
        <SidebarEvacuation
          show={true}
          onClose={closeSidebar}
          selectedHouse={selectedData}
          onSelectDestination={(h) => {
            onSelectDestination(h);
            isCameraLockedRef.current = false;
            setIsCameraLockedState(false);
            closeSidebar();
          }}
        />
      )}
      {showBarangaySidebar && (
        <>
          <Animated.View
            style={[styles.overlay, { opacity: barangayOverlayOpacity }]}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={closeBarangaySidebar}
            />
          </Animated.View>
          <BarangaySidebar
            show={true}
            onClose={closeBarangaySidebar}
            barangays={dropdownhousehold}
            onSelectBarangay={(b) => {
              getHouseholdLeadsByBarangayId(b._id);
              closeBarangaySidebar();
            }}
            sidebarWidth={width * 0.9}
          />
        </>
      )}
      <LegendModal
        visible={showLegendModal}
        onClose={() => setShowLegendModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  map: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 80,
  },
  infoBox: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "rgba(20, 20, 20, 0.95)",
    borderRadius: 15,
    padding: 18,
    zIndex: 10,
    borderWidth: 1,
    borderColor: "#444",
  },
  infoBoxCollapsed: { paddingVertical: 10 },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusHeader: { flexDirection: "row", alignItems: "center" },
  liveDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  liveText: { fontSize: 10, fontWeight: "900" },
  stopBtn: {
    backgroundColor: "#ef4444",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stopText: { color: "#fff", fontSize: 10, fontWeight: "bold", marginLeft: 4 },
  infoContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  label: { color: "#999", fontSize: 10 },
  timeText: { color: "#3b82f6", fontSize: 24, fontWeight: "800" },
  distanceText: { color: "#fff", fontSize: 24, fontWeight: "800" },
  progressBarWrapper: {
    height: 6,
    backgroundColor: "#333",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#3b82f6" },
  progressBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#333",
  },
  zoomContainer: {
    position: "absolute",
    left: 15,
    bottom: 100,
    gap: 10,
    zIndex: 70,
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#444",
  },
  fabContainer: {
    position: "absolute",
    right: 15,
    bottom: 100,
    gap: 12,
    zIndex: 70,
  },
  fab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default NavigationMap;