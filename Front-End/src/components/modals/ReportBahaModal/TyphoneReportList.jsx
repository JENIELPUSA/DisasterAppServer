import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  SafeAreaView,
  TextInput,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ReportListItem from "./typhone-report/ReportListItem";
import ReportDetailModal from "./typhone-report/ReportDetailModal";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

// --- Skeleton Loading Component ---
const SkeletonLoading = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startShimmer = () => {
      shimmerAnim.setValue(0);
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => startShimmer());
    };
    startShimmer();
    return () => shimmerAnim.stopAnimation();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <View className="flex-1 bg-cyan-700">
      {/* Added pt-12 para hindi dikit sa notch */}
      <View className="px-6 pb-6 pt-12">
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-1">
            <View className="bg-white/30 h-8 w-3/5 rounded-lg mb-2" />
            <View className="bg-white/30 h-4 w-2/5 rounded" />
          </View>
          <View className="w-10 h-10 rounded-full bg-white/20" />
        </View>
        <View className="h-12 bg-white rounded-2xl mb-6" />
        <View className="flex-row space-x-3">
          <View className="flex-1 h-12 rounded-xl bg-white/30" />
          <View className="flex-1 h-12 rounded-xl bg-white/30" />
        </View>
      </View>
      <View className="flex-1 bg-white rounded-t-[30px] mt-2" />
    </View>
  );
};

// --- Main Component ---
const TyphoonReportList = ({
  visible,
  onClose,
  onAddReport,
  Uploadreports,
  fetchMyUploads,
  isLoading,
  setIsLoading,
}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(Uploadreports);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchData();
    } else {
      // Reset animations
      Animated.parallel([
        Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        setSearchQuery("");
      });
    }
  }, [visible]);

  useEffect(() => {
    setFilteredData(Uploadreports);
  }, [Uploadreports]);

  const fetchData = async () => {
    setIsFetching(true);
    setIsLoading(true);
    try {
      await fetchMyUploads();
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetching(false);
      setIsLoading(false);
      // Trigger Slide Up Animation
      Animated.parallel([
        Animated.timing(backdropAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start(() => onClose?.());
  }, [onClose]);

  return (
    <>
      <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose} statusBarTranslucent>
        <View className="flex-1">
          <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
          
          {/* Backdrop Shadow */}
          <Animated.View 
            className="absolute inset-0 bg-black/60" 
            style={{ opacity: backdropAnim }}
          />

          {/* Sliding Container */}
          <Animated.View 
            className="flex-1"
            style={{ transform: [{ translateY: slideAnim }] }}
          >
            <View className="flex-1 bg-cyan-700">
              {isFetching ? (
                <SkeletonLoading />
              ) : (
                <>
                  <SafeAreaView>
                    {/* Header Container - Added pt-8 para bumaba ang text */}
                    <View className="px-6 pb-6 pt-8">
                      <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-1">
                          <Text className="text-3xl font-black text-white leading-tight">
                            Damage{"\n"}Reports
                          </Text>
                          <View className="flex-row items-center mt-2">
                            <MaterialIcons name="analytics" size={16} color="rgba(255,255,255,0.8)" />
                            <Text className="ml-2 text-sm text-white/80 font-medium">
                              {filteredData?.length || 0} reports • Today
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity 
                          onPress={handleClose} 
                          className="p-3 rounded-full bg-white/20 active:bg-white/40"
                        >
                          <MaterialIcons name="close" size={24} color="white" />
                        </TouchableOpacity>
                      </View>

                      {/* Search Bar */}
                      <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 mb-6 shadow-sm">
                        <MaterialIcons name="search" size={22} color="#6B7280" />
                        <TextInput
                          className="flex-1 ml-3 text-gray-900 text-base"
                          placeholder="Search reports..."
                          placeholderTextColor="#9CA3AF"
                          value={searchQuery}
                          onChangeText={setSearchQuery}
                        />
                      </View>

                      {/* Action Buttons */}
                      <View className="flex-row space-x-3">
                        <TouchableOpacity 
                          onPress={() => { handleClose(); setTimeout(onAddReport, 400); }}
                          className="flex-1 flex-row items-center justify-center bg-cyan-700 py-4 rounded-2xl shadow-md active:opacity-90"
                        >
                          <MaterialIcons name="add-circle-outline" size={22} color="white" />
                          <Text className="text-white font-bold ml-2">Add Report</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-orange-500 py-4 rounded-2xl shadow-md active:opacity-90">
                          <MaterialIcons name="summarize" size={22} color="white" />
                          <Text className="text-white font-bold ml-2">Generate</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </SafeAreaView>

                  {/* List Content Area */}
                  <View className="flex-1 bg-white rounded-t-[35px] overflow-hidden shadow-2xl">
                    <KeyboardAvoidingView 
                      className="flex-1" 
                      behavior={Platform.OS === "ios" ? "padding" : undefined}
                    >
                      {isLoading ? (
                        <View className="flex-1 justify-center items-center">
                          <ActivityIndicator size="large" color="#06b6d4" />
                          <Text className="mt-3 text-gray-500 font-medium">Updating list...</Text>
                        </View>
                      ) : (
                        <FlatList
                          data={filteredData}
                          keyExtractor={(item) => item._id || String(Math.random())}
                          renderItem={({ item }) => (
                            <ReportListItem item={item} onPress={(rep) => { setSelectedReport(rep); setDetailModalVisible(true); }} />
                          )}
                          contentContainerStyle={{ paddingVertical: 20, paddingBottom: 40 }}
                          showsVerticalScrollIndicator={false}
                          ListHeaderComponent={filteredData?.length > 0 && (
                            <View className="px-6 mb-2">
                              <Text className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                                All Submissions
                              </Text>
                            </View>
                          )}
                        />
                      )}
                    </KeyboardAvoidingView>
                  </View>
                </>
              )}
            </View>
          </Animated.View>
        </View>
      </Modal>

      <ReportDetailModal 
        visible={detailModalVisible} 
        report={selectedReport} 
        onClose={() => setDetailModalVisible(false)} 
      />
    </>
  );
};

export default TyphoonReportList;