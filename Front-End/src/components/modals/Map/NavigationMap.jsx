import React, { useState, useEffect, useRef } from "react";
import { View, Text, ActivityIndicator, Animated, Dimensions } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width, height } = Dimensions.get("window");

const NavigationMapLibre = ({ destination }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gpsHeading, setGpsHeading] = useState(0);

  const animatedHeading = useRef(new Animated.Value(0)).current;

  const mapRef = useRef(null);

  // --- Helper Functions ---
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const updateHeading = (newHeading) => {
    Animated.timing(animatedHeading, {
      toValue: newHeading,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const zoomBasedOnDistance = (distanceKm) => {
    let zoom = 15;
    if (distanceKm < 0.5) zoom = 18;
    else if (distanceKm < 2) zoom = 16;
    else if (distanceKm < 5) zoom = 15;
    else zoom = 14;

    if (mapRef.current && userLocation) {
      mapRef.current.setCamera({
        centerCoordinate: [userLocation.longitude, userLocation.latitude],
        zoomLevel: zoom,
        animationDuration: 500,
      });
    }
  };

  const fetchRoute = async () => {
    if (!userLocation || !destination) return;
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.longitude},${userLocation.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.code === "Ok") {
        const coords = data.routes[0].geometry.coordinates.map(c => [c[0], c[1]]);
        setRouteCoordinates(coords);
      }
    } catch (e) {
      console.error("Route fetch error:", e);
    }
  };

  // --- Location ---
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const initial = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
      setUserLocation({ latitude: initial.coords.latitude, longitude: initial.coords.longitude });
      setGpsHeading(initial.coords.heading || 0);
      setIsLoading(false);

      await fetchRoute();

      // Watch user location
      await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 2 },
        (loc) => {
          const curr = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          setUserLocation(curr);
          setGpsHeading(loc.coords.heading || 0);
          updateHeading(loc.coords.heading || 0);

          if (destination) {
            const dist = calculateDistance(curr.latitude, curr.longitude, destination.latitude, destination.longitude);
            zoomBasedOnDistance(dist);
          }
        }
      );
    })();
  }, []);

  if (isLoading || !userLocation) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text>Loading MapLibre...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapLibreGL.MapView
        ref={mapRef}
        style={{ flex: 1 }}
        styleURL={MapLibreGL.StyleURL.Street} // OSM default
        compassEnabled={true}
        zoomEnabled={true}
      >
        <MapLibreGL.Camera
          centerCoordinate={[userLocation.longitude, userLocation.latitude]}
          zoomLevel={15}
        />

        {/* Route Polyline */}
        {routeCoordinates.length > 0 && (
          <MapLibreGL.ShapeSource
            id="routeSource"
            shape={{
              type: "Feature",
              geometry: { type: "LineString", coordinates: routeCoordinates },
            }}
          >
            <MapLibreGL.LineLayer id="routeLine" style={{ lineColor: "#3b82f6", lineWidth: 4 }} />
          </MapLibreGL.ShapeSource>
        )}

        {/* User Marker */}
        <MapLibreGL.PointAnnotation
          id="userMarker"
          coordinate={[userLocation.longitude, userLocation.latitude]}
        >
          <Animated.View style={{
            transform:[{
              rotate: animatedHeading.interpolate({
                inputRange: [0,360],
                outputRange: ["0deg","360deg"]
              })
            }]
          }}>
            <Icon name="navigation" size={30} color="#3b82f6" />
          </Animated.View>
        </MapLibreGL.PointAnnotation>

        {/* Destination Marker */}
        {destination && (
          <MapLibreGL.PointAnnotation
            id="destinationMarker"
            coordinate={[destination.longitude, destination.latitude]}
          >
            <Icon name="flag-checkered" size={25} color="#fff" />
          </MapLibreGL.PointAnnotation>
        )}
      </MapLibreGL.MapView>
    </View>
  );
};

export default NavigationMapLibre;
