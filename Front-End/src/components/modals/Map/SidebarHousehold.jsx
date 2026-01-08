import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  StyleSheet,
  PanResponder,
  TextInput,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width, height } = Dimensions.get("window");
const SIDEBAR_HEIGHT = height * 0.85; // Bahagyang bawasan para sa mas maayos na scroll

const SidebarHousehold = ({
  show,
  onClose,
  household,
  onSelectDestination,
}) => {
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);
  
  const slideAnim = useRef(new Animated.Value(SIDEBAR_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Initialize pan responder for swipe down gesture (handle bar only)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only trigger if swiping down from top area
        return Math.abs(gestureState.dy) > 10 && gestureState.dy > 0;
      },
      onPanResponderGrant: () => {
        // Disable scroll when starting to drag handle
        setIsScrollEnabled(false);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Re-enable scroll after release
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
    if (household?.members) {
      const memberList = Array.isArray(household.members) 
        ? household.members 
        : [];
      setMembers(memberList);
    }
  }, [household]);

  useEffect(() => {
    if (show && household) {
      // Reset scroll state when opening
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
  }, [show, household]);

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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#f97316';
      case 'in_progress':
        return '#eab308';
      case 'rescued':
        return '#22c55e';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Pending Rescue';
      case 'in_progress':
        return 'Rescue in Progress';
      case 'rescued':
        return 'Rescued';
      default:
        return 'Unknown Status';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'alert-circle';
      case 'in_progress':
        return 'progress-clock';
      case 'rescued':
        return 'check-circle';
      default:
        return 'help-circle';
    }
  };

  // Filter members based on search query
  const filteredMembers = searchQuery 
    ? members.filter(member => 
        member?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member?.age?.toString().includes(searchQuery) ||
        member?.gender?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : members;

  if (!show || !household) return null;

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
              <Icon name="home" size={28} color="#3b82f6" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Household Details</Text>
              <Text style={styles.headerSubtitle}>
                {household.householdCode || "HH-NOCODE"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Status Badge */}
          <View style={styles.statusContainer}>
            <View 
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(household.rescueStatus) }
              ]}
            >
              <Icon 
                name={getStatusIcon(household.rescueStatus)} 
                size={16} 
                color="#fff" 
              />
              <Text style={styles.statusText}>
                {getStatusText(household.rescueStatus)}
              </Text>
            </View>
          </View>

          {/* Household Information Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Household Information</Text>
            
            <View style={styles.infoRow}>
              <Icon name="account" size={20} color="#3b82f6" style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Head of Household</Text>
                <Text style={styles.infoValue}>
                  {household.user?.fullName || "Not Available"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="phone" size={20} color="#3b82f6" style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Contact Number</Text>
                <Text style={styles.infoValue}>
                  {household.user?.contactNumber || "Not Available"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="map-marker" size={20} color="#3b82f6" style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>
                  {household.user?.address || "Not Available"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="account-group" size={20} color="#3b82f6" style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Total Members</Text>
                <Text style={styles.infoValue}>
                  {household.totalMembers || members.length || 0}
                </Text>
              </View>
            </View>
          </View>

          {/* Search Members */}
          {members.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Household Members</Text>
              
              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <Icon name="magnify" size={18} color="#9ca3af" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search members..."
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
                      <Icon name="close-circle" size={16} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {searchQuery && (
                <Text style={styles.resultsText}>
                  {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''} found
                </Text>
              )}

              {/* Members List */}
              {filteredMembers.length > 0 ? (
                <View style={styles.membersList}>
                  {filteredMembers.map((item, index) => (
                    <View key={item?._id || item?.id || index} style={styles.memberItem}>
                      <View style={styles.memberHeader}>
                        <Icon name="account-circle" size={24} color="#3b82f6" />
                        <Text style={styles.memberName}>
                          {item?.name || `Member ${index + 1}`}
                        </Text>
                      </View>
                      
                      <View style={styles.memberDetails}>
                        {item?.age && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Age:</Text>
                            <Text style={styles.detailValue}>{item.age}</Text>
                          </View>
                        )}
                        
                        {item?.gender && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Gender:</Text>
                            <Text style={styles.detailValue}>{item.gender}</Text>
                          </View>
                        )}
                        
                        {item?.medicalConditions && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Medical:</Text>
                            <Text style={[styles.detailValue, styles.medicalText]}>
                              {item.medicalConditions}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Icon name="account-off" size={32} color="#6b7280" />
                  <Text style={styles.emptyText}>
                    {searchQuery ? "No members match your search" : "No members found"}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={[
                styles.primaryButton,
                !household.location && styles.disabledButton
              ]}
              onPress={() => {
                if (household.location && onSelectDestination) {
                  onSelectDestination({
                    latitude: household.location.latitude,
                    longitude: household.location.longitude,
                    name: household.user?.fullName || "Household Location"
                  });
                  closeWithAnimation();
                }
              }}
              disabled={!household.location}
            >
              <Icon name="navigation" size={20} color={household.location ? "#fff" : "#6b7280"} />
              <Text style={[
                styles.primaryButtonText,
                !household.location && styles.disabledButtonText
              ]}>
                Navigate
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => {
                // TODO: Implement contact functionality
                console.log("Contact household:", household.user?.contactNumber);
              }}
            >
              <Icon name="phone" size={20} color="#3b82f6" />
              <Text style={styles.secondaryButtonText}>
                Contact
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Created: {household.createdAt ? 
                new Date(household.createdAt).toLocaleDateString('en-PH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : "Not Available"}
            </Text>
            {household.updatedAt && (
              <Text style={styles.footerText}>
                Updated: {new Date(household.updatedAt).toLocaleDateString('en-PH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            )}
          </View>

          {/* Swipe Hint */}
          <View style={styles.swipeHint}>
            <Icon name="gesture-swipe-down" size={14} color="#6b7280" />
            <Text style={styles.swipeHintText}>Swipe handle to close</Text>
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
    height: 44, // Larger touch area for handle
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
    paddingBottom: 60, // Extra padding for better scrolling
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
    fontFamily: "monospace",
  },
  divider: {
    height: 1,
    backgroundColor: "#374151",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoIcon: {
    width: 24,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f2937",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    paddingVertical: 10,
  },
  clearButton: {
    padding: 2,
  },
  resultsText: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 8,
    fontStyle: "italic",
  },
  membersList: {
    marginTop: 8,
  },
  memberItem: {
    backgroundColor: "#1f2937",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  memberHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    marginLeft: 12,
  },
  memberDetails: {
    marginLeft: 36,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: "#9ca3af",
    width: 60,
  },
  detailValue: {
    fontSize: 12,
    color: "#d1d5db",
    flex: 1,
  },
  medicalText: {
    color: "#ef4444",
    fontStyle: "italic",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
    textAlign: "center",
  },
  actionContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    paddingVertical: 14,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: "#374151",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  disabledButtonText: {
    color: "#9ca3af",
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#3b82f6",
    borderRadius: 10,
    paddingVertical: 14,
    gap: 8,
  },
  secondaryButtonText: {
    color: "#3b82f6",
    fontWeight: "bold",
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "#374151",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
    textAlign: 'center',
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

export default SidebarHousehold;