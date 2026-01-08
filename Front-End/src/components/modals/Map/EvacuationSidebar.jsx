import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const SidebarEvacuation = ({
  selectedHouse,
  onSelectDestination,
  show, // Dagdag ng show prop
  onClose, // Palitan ng onClose
}) => {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();

  // Dynamic height based on screen size and content
  const SLIDE_UP_HEIGHT = screenHeight * 0.85;
  const [contentHeight, setContentHeight] = useState(0);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);

  const slideAnim = useRef(new Animated.Value(SLIDE_UP_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Initialize pan responder for swipe down gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10 && gestureState.dy > 0;
      },
      onPanResponderGrant: () => {
        setIsScrollEnabled(false);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsScrollEnabled(true);
        
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          closeWithAnimation();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        setIsScrollEnabled(true);
      },
    })
  ).current;

  useEffect(() => {
    if (show && selectedHouse) {
      setIsScrollEnabled(true);
      
      // Open animation
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0.7,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 70,
          friction: 8,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [show, selectedHouse]);

  const closeWithAnimation = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: SLIDE_UP_HEIGHT,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => {
      if (onClose) {
        onClose();
      }
    });
  };

  if (!show || !selectedHouse) return null;

  const occupancyRate =
    selectedHouse.evacuationCapacity > 0
      ? (selectedHouse.currentEvacuees || 0) / selectedHouse.evacuationCapacity
      : 0;

  const getProgressBarColor = () => {
    if (occupancyRate > 0.8) return "#ef4444";
    if (occupancyRate > 0.5) return "#f59e0b";
    return "#10b981";
  };

  const getIconColor = () => {
    return selectedHouse.type === "evacuation" ? "#8b5cf6" : "#22c55e";
  };

  const getResponsiveFontSize = () => {
    if (screenHeight < 600)
      return {
        title: 16,
        subtitle: 12,
        label: 10,
        value: 14,
        capacity: 24,
        button: 14,
      };
    if (screenHeight < 800)
      return {
        title: 18,
        subtitle: 13,
        label: 11,
        value: 15,
        capacity: 28,
        button: 16,
      };
    return {
      title: 20,
      subtitle: 14,
      label: 12,
      value: 16,
      capacity: 32,
      button: 18,
    };
  };

  const fontSize = getResponsiveFontSize();

  return (
    <View style={styles.container}>
      {/* Overlay */}
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <TouchableOpacity 
          style={styles.overlayTouchable}
          onPress={closeWithAnimation}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Slide-up Panel */}
      <Animated.View
        style={[
          styles.sidebar,
          { 
            transform: [{ translateY: slideAnim }],
            height: SLIDE_UP_HEIGHT 
          }
        ]}
      >
        {/* Handle Bar with PanResponder */}
        <View style={styles.handleBarContainer} {...panResponder.panHandlers}>
          <View style={styles.handleBar} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollViewContent}
          scrollEnabled={isScrollEnabled}
          bounces={true}
          nestedScrollEnabled={true}
          onScrollBeginDrag={() => setIsScrollEnabled(true)}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={closeWithAnimation}
          >
            <Icon name="close" size={22} color="#9ca3af" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIconContainer}>
              <Icon
                name={selectedHouse.type === "evacuation" ? "shield-home" : "home"}
                size={28}
                color={getIconColor()}
              />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, { fontSize: fontSize.title }]}>
                {selectedHouse.evacuationName ||
                  selectedHouse.name ||
                  "Evacuation Center"}
              </Text>
              <Text style={[styles.headerSubtitle, { fontSize: fontSize.subtitle }]}>
                {selectedHouse.type === "evacuation"
                  ? "Evacuation Center"
                  : "Household Shelter"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Information Section */}
          <View style={styles.content}>
            {/* Barangay */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { fontSize: fontSize.label }]}>
                Barangay
              </Text>
              <View style={styles.infoCard}>
                <Icon name="map-marker" size={16} color="#9ca3af" />
                <Text style={[styles.infoValue, { fontSize: fontSize.value }]}>
                  {selectedHouse.barangay?.barangayName || "N/A"}
                </Text>
              </View>
            </View>

            {/* Address */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { fontSize: fontSize.label }]}>
                Address
              </Text>
              <View style={styles.infoCard}>
                <Icon name="home-map-marker" size={16} color="#9ca3af" />
                <Text style={[styles.infoValue, { fontSize: fontSize.value }]}>
                  {selectedHouse.location?.address || "No address provided"}
                </Text>
              </View>
            </View>

            {/* Contact Person */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { fontSize: fontSize.label }]}>
                Contact Person
              </Text>
              <View style={styles.infoCard}>
                <View style={styles.contactRow}>
                  <Icon name="account" size={16} color="#9ca3af" />
                  <Text style={[styles.contactName, { fontSize: fontSize.value }]}>
                    {selectedHouse.contactPerson?.name || "N/A"}
                  </Text>
                </View>
                {selectedHouse.contactPerson?.contactNumber && (
                  <View style={styles.contactRow}>
                    <Icon name="phone" size={14} color="#9ca3af" />
                    <Text style={[styles.contactNumber, { fontSize: fontSize.value - 2 }]}>
                      {selectedHouse.contactPerson.contactNumber}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Capacity Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { fontSize: fontSize.label }]}>
                Capacity
              </Text>
              <View style={styles.capacityCard}>
                <View style={styles.capacityRow}>
                  <View style={styles.capacityItem}>
                    <Text style={[styles.capacityLabel, { fontSize: fontSize.label }]}>
                      Occupied
                    </Text>
                    <Text style={[styles.capacityValue, { fontSize: fontSize.capacity }]}>
                      {selectedHouse.currentEvacuees || 0}
                    </Text>
                  </View>

                  <View style={styles.dividerVertical} />

                  <View style={styles.capacityItem}>
                    <Text style={[styles.capacityLabel, { fontSize: fontSize.label }]}>
                      Max Capacity
                    </Text>
                    <Text style={[styles.capacityValue, { fontSize: fontSize.capacity }]}>
                      {selectedHouse.evacuationCapacity || 0}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                {selectedHouse.evacuationCapacity > 0 && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                      <Text style={[styles.progressLabel, { fontSize: fontSize.label }]}>
                        Occupancy
                      </Text>
                      <Text style={[styles.progressPercent, { fontSize: fontSize.label }]}>
                        {Math.round(occupancyRate * 100)}% Full
                      </Text>
                    </View>
                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { 
                            width: `${Math.min(100, occupancyRate * 100)}%`,
                            backgroundColor: getProgressBarColor()
                          }
                        ]}
                      />
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Additional Info if available */}
            {selectedHouse.description && (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { fontSize: fontSize.label }]}>
                  Description
                </Text>
                <View style={styles.infoCard}>
                  <Text style={[styles.description, { fontSize: fontSize.value - 1 }]}>
                    {selectedHouse.description}
                  </Text>
                </View>
              </View>
            )}

            {/* Navigation Button */}
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={() => {
                if (selectedHouse.location && onSelectDestination) {
                  onSelectDestination({
                    latitude: selectedHouse.location.latitude,
                    longitude: selectedHouse.location.longitude,
                    name: selectedHouse.evacuationName || "Evacuation Center"
                  });
                  closeWithAnimation();
                }
              }}
              disabled={!selectedHouse.location}
            >
              <Icon name="navigation-variant" size={20} color="#fff" />
              <Text style={[styles.navigateButtonText, { fontSize: fontSize.button }]}>
                START NAVIGATION
              </Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.footerDivider} />
              <View style={styles.footerContent}>
                <Text style={[styles.footerText, { fontSize: fontSize.label - 1 }]}>
                  Last updated: Today
                </Text>
                <View style={styles.footerInfo}>
                  <Icon name="information-outline" size={14} color="#6b7280" />
                  <Text style={[styles.footerText, { fontSize: fontSize.label - 1 }]}>
                    Information
                  </Text>
                </View>
              </View>
            </View>

            {/* Swipe Hint */}
            <View style={styles.swipeHint}>
              <Icon name="gesture-swipe-down" size={14} color="#6b7280" />
              <Text style={[styles.swipeHintText, { fontSize: fontSize.label - 1 }]}>
                Swipe handle to close
              </Text>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
  },
  overlayTouchable: {
    flex: 1,
  },
  sidebar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "#333",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    overflow: 'hidden',
  },
  handleBarContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
    height: 44,
    justifyContent: 'center',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#4b5563",
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 60,
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 16,
    zIndex: 10,
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    borderRadius: 20,
    padding: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#9ca3af",
  },
  divider: {
    height: 1,
    backgroundColor: "#374151",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: "#111827",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  infoValue: {
    fontWeight: "600",
    color: "#fff",
    marginLeft: 12,
    flex: 1,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  contactName: {
    fontWeight: "600",
    color: "#fff",
    marginLeft: 12,
  },
  contactNumber: {
    color: "#d1d5db",
    marginLeft: 12,
  },
  capacityCard: {
    backgroundColor: "#111827",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#374151",
  },
  capacityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  capacityItem: {
    alignItems: "center",
    flex: 1,
  },
  capacityLabel: {
    color: "#9ca3af",
    marginBottom: 4,
  },
  capacityValue: {
    fontWeight: "bold",
    color: "#fff",
  },
  dividerVertical: {
    width: 1,
    height: 32,
    backgroundColor: "#374151",
    marginHorizontal: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    color: "#9ca3af",
  },
  progressPercent: {
    fontWeight: "600",
    color: "#fff",
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "#374151",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  description: {
    color: "#d1d5db",
    lineHeight: 20,
  },
  navigateButton: {
    backgroundColor: "#3b82f6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
    marginBottom: 24,
  },
  navigateButtonText: {
    color: "#fff",
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  footer: {
    marginBottom: 20,
  },
  footerDivider: {
    height: 1,
    backgroundColor: "#1f2937",
    marginBottom: 12,
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    color: "#6b7280",
  },
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  swipeHint: {
    alignItems: "center",
    paddingBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  swipeHintText: {
    color: "#6b7280",
  },
});

export default SidebarEvacuation;