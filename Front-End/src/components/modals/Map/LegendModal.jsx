import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { height } = Dimensions.get('window');
const LEGEND_HEIGHT = height * 0.9; // Height para sa slide-up legend

const LegendModal = ({ visible, onClose }) => {
  // Animation refs
  const slideAnim = useRef(new Animated.Value(LEGEND_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);

  // Initialize pan responder for swipe down gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only trigger if swiping down from top area
        return Math.abs(gestureState.dy) > 10 && gestureState.dy > 0;
      },
      onPanResponderGrant: () => {
        // Disable scroll when starting to drag
        setIsScrollEnabled(false);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Re-enable scroll
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
        // Re-enable scroll if gesture is terminated
        setIsScrollEnabled(true);
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      // Reset scroll enabled state when opening
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
  }, [visible]);

  const closeWithAnimation = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: LEGEND_HEIGHT,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onClose();
    });
  };

  // Legend items
  const evacuationLegend = [
    { color: '#6200ee', label: 'Evacuation Center', icon: 'shield-home' },
    { color: '#2ecc71', label: 'Household Shelter', icon: 'home' },
  ];

  const householdStatusLegend = [
    { color: '#f97316', label: 'Pending Rescue', icon: 'alert-circle', status: 'pending' },
    { color: '#eab308', label: 'In Progress', icon: 'progress-clock', status: 'in_progress' },
    { color: '#22c55e', label: 'Rescued', icon: 'check-circle', status: 'rescued' },
    { color: '#6b7280', label: 'Unknown', icon: 'help-circle', status: 'unknown' },
  ];

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Overlay */}
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: overlayOpacity }
        ]}
      >
        <TouchableOpacity 
          style={styles.overlayTouchable}
          onPress={closeWithAnimation}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Slide-up Panel */}
      <Animated.View 
        style={[
          styles.legendContent,
          { 
            transform: [{ translateY: slideAnim }],
            height: LEGEND_HEIGHT 
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
          // Add this to handle scroll conflicts
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
              <Icon name="information" size={28} color="#3b82f6" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Color Coding Legend</Text>
              <Text style={styles.headerSubtitle}>
                Map symbols and color guide
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Evacuation Center Legend */}
          <View style={styles.legendSection}>
            <View style={styles.sectionHeader}>
              <Icon name="shield-home" size={20} color="#3b82f6" />
              <Text style={styles.sectionTitle}>Evacuation Centers</Text>
            </View>
            {evacuationLegend.map((item, index) => (
              <View key={`evac-${index}`} style={styles.legendItem}>
                <View style={styles.legendItemLeft}>
                  <View 
                    style={[
                      styles.legendColorBox, 
                      { 
                        backgroundColor: item.color,
                        borderColor: `${item.color}80`
                      }
                    ]}
                  >
                    <Icon name={item.icon} size={18} color="#fff" />
                  </View>
                  <Text style={styles.legendLabel}>{item.label}</Text>
                </View>
                <Icon name="chevron-right" size={16} color="#6b7280" />
              </View>
            ))}
          </View>

          {/* Household Status Legend */}
          <View style={styles.legendSection}>
            <View style={styles.sectionHeader}>
              <Icon name="account-group" size={20} color="#3b82f6" />
              <Text style={styles.sectionTitle}>Household Rescue Status</Text>
            </View>
            {householdStatusLegend.map((item, index) => (
              <View key={`status-${index}`} style={styles.legendItem}>
                <View style={styles.legendItemLeft}>
                  <View 
                    style={[
                      styles.legendColorBox, 
                      { 
                        backgroundColor: item.color,
                        borderColor: `${item.color}80`
                      }
                    ]}
                  >
                    <Icon name={item.icon} size={18} color="#fff" />
                  </View>
                  <Text style={styles.legendLabel}>{item.label}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Route Legend */}
          <View style={styles.legendSection}>
            <View style={styles.sectionHeader}>
              <Icon name="map-marker-path" size={20} color="#3b82f6" />
              <Text style={styles.sectionTitle}>Route Information</Text>
            </View>
            
            <View style={styles.legendItem}>
              <View style={styles.legendItemLeft}>
                <View style={styles.routeBox}>
                  <View style={[styles.routeLine, { backgroundColor: '#fbbf24' }]} />
                </View>
                <Text style={styles.legendLabel}>Highway Route (Truck Path)</Text>
              </View>
              <Icon name="truck" size={16} color="#fbbf24" />
            </View>

            <View style={styles.legendItem}>
              <View style={styles.legendItemLeft}>
                <View style={styles.routeBox}>
                  <View style={[styles.routeLine, { backgroundColor: '#3b82f6' }]} />
                </View>
                <Text style={styles.legendLabel}>Regular Route</Text>
              </View>
              <Icon name="road" size={16} color="#3b82f6" />
            </View>

            <View style={styles.legendItem}>
              <View style={styles.legendItemLeft}>
                <View style={styles.routeBox}>
                  <View style={styles.dashedLineContainer}>
                    <View style={styles.dashedLine} />
                  </View>
                </View>
                <Text style={styles.legendLabel}>Off-road Path</Text>
              </View>
              <Icon name="terrain" size={16} color="#fff" />
            </View>
          </View>

          {/* Map Symbols */}
          <View style={styles.legendSection}>
            <View style={styles.sectionHeader}>
              <Icon name="map-legend" size={20} color="#3b82f6" />
              <Text style={styles.sectionTitle}>Map Symbols</Text>
            </View>
            
            <View style={styles.legendItem}>
              <View style={styles.legendItemLeft}>
                <View style={[styles.legendColorBox, { backgroundColor: '#3b82f6' }]}>
                  <Icon name="map-marker" size={18} color="#fff" />
                </View>
                <Text style={styles.legendLabel}>User Location</Text>
              </View>
              <Icon name="navigation" size={16} color="#3b82f6" />
            </View>

            <View style={styles.legendItem}>
              <View style={styles.legendItemLeft}>
                <View style={[styles.legendColorBox, { backgroundColor: '#ef4444' }]}>
                  <Icon name="flag-checkered" size={18} color="#fff" />
                </View>
                <Text style={styles.legendLabel}>Destination</Text>
              </View>
              <Icon name="target" size={16} color="#ef4444" />
            </View>

            <View style={styles.legendItem}>
              <View style={styles.legendItemLeft}>
                <View style={[styles.legendColorBox, { backgroundColor: '#000' }]}>
                  <Icon name="truck-delivery" size={18} color="#fff" />
                </View>
                <Text style={styles.legendLabel}>Rescue Truck</Text>
              </View>
              <Icon name="speedometer" size={16} color="#fff" />
            </View>

            <View style={styles.legendItem}>
              <View style={styles.legendItemLeft}>
                <View style={[styles.legendColorBox, { 
                  backgroundColor: '#000',
                  position: 'relative'
                }]}>
                  <Icon name="truck-delivery" size={18} color="#fbbf24" />
                  <View style={styles.simulationBadge}>
                    <Text style={styles.simulationText}>SIM</Text>
                  </View>
                </View>
                <Text style={styles.legendLabel}>Truck in Simulation</Text>
              </View>
              <Icon name="play" size={16} color="#fbbf24" />
            </View>
          </View>

          {/* Info Section */}
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Icon name="lightbulb-on" size={16} color="#6b7280" />
              <Text style={styles.infoText}>
                Tap markers on map for more details
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Swipe Hint */}
        <View style={styles.swipeHint}>
          <Icon name="gesture-swipe-down" size={14} color="#6b7280" />
          <Text style={styles.swipeHintText}>Swipe handle to close</Text>
        </View>
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
  legendContent: {
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
    // Make handle area more touchable
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
    backgroundColor: 'transparent',
  },
  scrollViewContent: {
    paddingBottom: 60, // Extra padding for scroll
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#9ca3af",
  },
  divider: {
    height: 1,
    backgroundColor: "#374151",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  legendSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  legendItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legendColorBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 2,
  },
  legendLabel: {
    fontSize: 15,
    color: '#fff',
    flex: 1,
    lineHeight: 20,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
  },
  routeBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  routeLine: {
    width: 26,
    height: 4,
    borderRadius: 2,
  },
  dashedLineContainer: {
    width: 26,
    height: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashedLine: {
    width: 26,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
    opacity: 0.8,
  },
  simulationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  simulationText: {
    fontSize: 8,
    color: '#000',
    fontWeight: 'bold',
  },
  infoContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
    fontStyle: 'italic',
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
  },
  swipeHintText: {
    fontSize: 12,
    color: "#6b7280",
  },
});

export default LegendModal;