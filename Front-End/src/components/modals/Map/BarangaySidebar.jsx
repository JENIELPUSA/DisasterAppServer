import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  TextInput,
  Dimensions,
  PanResponder,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { height, width } = Dimensions.get("window");
const SIDEBAR_HEIGHT = height * 0.8; // Height for slide-up sidebar

const BarangaySidebar = ({
  show,
  onClose,
  barangays,
  onSelectBarangay,
  sidebarWidth = width * 0.9,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const slideAnim = useRef(new Animated.Value(SIDEBAR_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Helper function to safely get barangay name
  const getBarangayName = (item) => {
    if (!item) return "Unnamed Barangay";
    
    // Try multiple possible property names for barangay name
    return item.name || 
           item.barangayName || 
           item.barangay || 
           item.Name || 
           "Unnamed Barangay";
  };

  // Initialize pan responder for swipe down gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          closeWithAnimation();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (show) {
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
  }, [show]);

  const closeWithAnimation = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: SIDEBAR_HEIGHT,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onClose();
    });
  };

  // Safe filtering function
  const filteredBarangays = barangays?.filter((barangay) => {
    if (!barangay) return false;
    
    const name = getBarangayName(barangay);
    
    // Ensure name is a string before calling toLowerCase
    if (typeof name !== 'string') return false;
    
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Validate barangays data
  const isValidBarangays = barangays && Array.isArray(barangays);
  const barangaysCount = isValidBarangays ? barangays.length : 0;
  const filteredCount = filteredBarangays ? filteredBarangays.length : 0;

  if (!show) return null;

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
          styles.sidebar,
          { 
            transform: [{ translateY: slideAnim }],
            height: SIDEBAR_HEIGHT 
          }
        ]}
        {...panResponder.panHandlers}
      >
        {/* Handle Bar */}
        <View style={styles.handleBarContainer}>
          <View style={styles.handleBar} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
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
              <Icon name="map-marker-multiple" size={28} color="#3b82f6" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Select Barangay</Text>
              <Text style={styles.headerSubtitle}>
                {barangaysCount} barangays available
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Icon name="magnify" size={20} color="#9ca3af" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search barangay..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  onPress={() => setSearchQuery("")}
                  style={styles.clearButton}
                >
                  <Icon name="close-circle" size={18} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Results Count */}
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>
              {filteredCount} results found
            </Text>
          </View>

          {/* Barangay List */}
          {!isValidBarangays ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Icon name="alert-circle-outline" size={48} color="#6b7280" />
              </View>
              <Text style={styles.emptyTitle}>Invalid Data</Text>
              <Text style={styles.emptyText}>
                No valid barangay data available
              </Text>
            </View>
          ) : filteredBarangays && filteredBarangays.length > 0 ? (
            <FlatList
              data={filteredBarangays}
              keyExtractor={(item) => item?._id || Math.random().toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.barangayItem,
                    index === filteredBarangays.length - 1 && styles.lastItem
                  ]}
                  onPress={() => {
                    if (item) {
                      onSelectBarangay(item);
                      closeWithAnimation();
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemLeft}>
                    <View style={styles.itemIconContainer}>
                      <Icon name="map-marker" size={20} color="#3b82f6" />
                    </View>
                    <View style={styles.itemTextContainer}>
                      <Text style={styles.barangayName} numberOfLines={1}>
                        {getBarangayName(item)}
                      </Text>
                      {item?.municipality && (
                        <Text style={styles.barangayDetails} numberOfLines={1}>
                          {item.municipality}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Icon name="chevron-right" size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Icon name="map-marker-off" size={48} color="#6b7280" />
              </View>
              <Text style={styles.emptyTitle}>No barangays found</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 
                  `No results for "${searchQuery}"` : 
                  "No barangays available"}
              </Text>
            </View>
          )}

          {/* Info Section */}
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Icon name="information" size={16} color="#6b7280" />
              <Text style={styles.infoText}>
                Select a barangay to view households
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Swipe Hint */}
        <View style={styles.swipeHint}>
          <Text style={styles.swipeHintText}>Swipe down to close</Text>
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
  },
  handleBarContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
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
    paddingBottom: 20,
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 14,
  },
  clearButton: {
    padding: 4,
  },
  resultsContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 8,
  },
  barangayItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
    backgroundColor: "#111827",
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  barangayName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  barangayDetails: {
    fontSize: 14,
    color: "#9ca3af",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(107, 114, 128, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 20,
  },
  infoContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
  },
  swipeHint: {
    alignItems: "center",
    paddingBottom: 12,
  },
  swipeHintText: {
    fontSize: 12,
    color: "#6b7280",
  },
});

export default BarangaySidebar;