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

const SEVERITY_COLORS = {
  high: "#ef4444",
  medium: "#f97316",
  low: "#22c55e",
};

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

  // --- SPEECH STATES ---
  const [hasAnnouncedStart, setHasAnnouncedStart] = useState(false);
  const [hasAnnouncedNear, setHasAnnouncedNear] = useState(false);
  const [hasAnnouncedArrival, setHasAnnouncedArrival] = useState(false);

  // SPEECH TRACKER: Gumagamit ng Set para hindi paulit-ulit ang salita sa bawat report
  const announcedTypesRef = useRef(new Set());

  const hasDestination = !!(destination?.latitude && destination?.longitude);

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

    const PROXIMITY_THRESHOLD = 0.5; // 500 meters detection
    const nearbyTypes = new Set();

    incidentReports.forEach((report) => {
      const dist = getDistanceInKm(
        userLocation.latitude,
        userLocation.longitude,
        report.location.latitude,
        report.location.longitude,
      );

      // Kapag ang hazard ay pasok sa 500m radius
      if (dist <= PROXIMITY_THRESHOLD) {
        const type = report.reportType?.toLowerCase();
        nearbyTypes.add(type);

        // Magsasalita lang kung hindi pa na-a-announce ang type na ito sa kasalukuyang area
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

    // Reset tracker kapag wala nang malapit na hazard para makapag-alert ulit sa susunod na zone
    if (nearbyTypes.size === 0 && announcedTypesRef.current.size > 0) {
      announcedTypesRef.current.clear();
    }
  }, [userLocation, incidentReports]);

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
      setIsFollowing(false);
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
      setIsFollowing(true);
    }
  };

  useEffect(() => {
    if (cameraRef.current && userLocation && isFollowing) {
      cameraRef.current.setCamera({
        centerCoordinate: [userLocation.longitude, userLocation.latitude],
        zoomLevel: hasDestination ? 18.5 : 15.5,
        pitch: hasDestination ? 65 : 0,
        heading: heading,
        animationDuration: 1000,
      });
    }
  }, [userLocation, heading, isFollowing, hasDestination]);

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
    (async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${userLocation.longitude},${userLocation.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`,
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
        console.error(e);
      }
    })();
  }, [destination, userLocation]);

  const handleStopNavigation = () => {
    setRouteCoordinates([]);
    setInitialDistance(null);
    setIsFollowing(false);
    setHasAnnouncedStart(false);
    setHasAnnouncedNear(false);
    setHasAnnouncedArrival(false);
    announcedTypesRef.current.clear();
    if (onStopNavigation) onStopNavigation();
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
    setIsFollowing(false);
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
        onPress={() => setIsFollowing(false)}
        onRegionWillChange={(e) => {
          if (e.gesture) setIsFollowing(false);
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
              iconAnchor: "bottom",
              iconOffset: [0, -10],
            }}
          />
        </MaplibreGL.ShapeSource>

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
              iconAnchor: "bottom",
            }}
          />
        </MaplibreGL.ShapeSource>

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
              iconAnchor: "bottom",
            }}
          />
        </MaplibreGL.ShapeSource>

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
              style={{
                lineColor: "#3b82f6",
                lineWidth: 6,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            <MaplibreGL.LineLayer
              id="routeZigzag"
              style={{
                lineColor: "rgba(255,255,255,0.5)",
                lineWidth: 2,
                lineDasharray: [2, 2],
                lineCap: "round",
              }}
            />
          </MaplibreGL.ShapeSource>
        )}

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
                iconAnchor: "bottom",
              }}
            />
          </MaplibreGL.ShapeSource>
        )}

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
                iconSize: 0.1,
                iconRotate: heading,
                iconRotationAlignment: "map",
                iconAllowOverlap: true,
              }}
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

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[
            styles.fab,
            { backgroundColor: isFollowing ? "#3b82f6" : "#ffffff" },
          ]}
          onPress={() => setIsFollowing(!isFollowing)}
        >
          <MaterialIcons
            name={isFollowing ? "gps-fixed" : "gps-not-fixed"}
            size={26}
            color={isFollowing ? "white" : "#4b5563"}
          />
        </TouchableOpacity>
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
            setIsFollowing(true);
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
