import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const MunicipalitiesView = ({
  municipalities,
  search,
  setSearch,
  loading,
  barangays,
  filteredMunicipalities,
  renderMunicipalityCard,
  handleCancel,
  setSelectedMunicipality,
  displayBarangaysForUser,
}) => {
  // Skeleton Loading Component
  const SkeletonLoading = () => {
    const skeletonItems = Array.from({ length: 8 }, (_, i) => i);

    return (
      <View className="flex-1 bg-cyan-600">
        <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
        
        {/* Cyan Header Skeleton */}
        <SafeAreaView edges={['top']} style={{ flex: 0 }}>
          <View className="flex-row items-center justify-between px-6 py-5">
            <View className="flex-1">
              <View className="h-10 bg-white/30 rounded w-48 mb-3 animate-pulse" />
              <View className="h-4 bg-white/30 rounded w-64 animate-pulse" />
            </View>
            <View className="w-12 h-12 bg-white/30 rounded-full animate-pulse" />
          </View>
        </SafeAreaView>

        {/* Curved White Container Skeleton */}
        <View className="flex-1 bg-white rounded-t-[35px] overflow-hidden">
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 28 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Search Bar Skeleton */}
            <View className="mb-6">
              <View className="h-14 bg-gray-200 rounded-xl animate-pulse" />
            </View>

            {/* Stats Card Skeleton */}
            <View className="mb-6">
              <View className="bg-gray-100 rounded-xl p-5 border border-gray-200">
                <View className="flex-row items-center mb-4">
                  <View className="w-12 h-12 bg-gray-300 rounded-full animate-pulse mr-3" />
                  <View className="h-6 bg-gray-300 rounded w-40 animate-pulse" />
                </View>

                <View className="flex-row justify-between">
                  {[1, 2, 3].map((item) => (
                    <View key={item} className="items-center">
                      <View className="h-8 bg-gray-300 rounded w-14 mb-2 animate-pulse" />
                      <View className="h-4 bg-gray-300 rounded w-20 animate-pulse" />
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Section Title Skeleton */}
            <View className="flex-row justify-between items-center mb-4">
              <View className="h-6 bg-gray-300 rounded w-48 animate-pulse" />
              <View className="h-4 bg-gray-300 rounded w-36 animate-pulse" />
            </View>

            {/* Municipality Cards Skeleton */}
            {skeletonItems.map((item) => (
              <View
                key={item}
                className="p-5 bg-white rounded-xl mb-4 border border-gray-200 animate-pulse"
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-3">
                      <View className="w-12 h-12 bg-gray-300 rounded-full mr-3" />
                      <View className="h-7 bg-gray-300 rounded flex-1" />
                    </View>
                    <View className="ml-12">
                      <View className="bg-gray-200 px-4 py-2 rounded-full self-start mb-1 w-36 h-6" />
                    </View>
                  </View>
                  <View className="bg-gray-100 px-4 py-3 rounded-lg">
                    <View className="flex-row items-center">
                      <View className="h-6 bg-gray-300 rounded w-6" />
                      <View className="h-6 bg-gray-300 rounded w-10 ml-2" />
                    </View>
                    <View className="h-3 bg-gray-300 rounded w-14 mt-1" />
                  </View>
                </View>
              </View>
            ))}

            {/* Footer Text Skeleton */}
            <View className="mt-8">
              <View className="h-4 bg-gray-300 rounded w-64 mx-auto animate-pulse" />
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  const handleMunicipalityPress = async (item) => {
    await displayBarangaysForUser("", 1, item.id);
    setSelectedMunicipality(item);
  };

  if (loading) {
    return <SkeletonLoading />;
  }

  return (
    <View className="flex-1 bg-cyan-700">
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      
      {/* Cyan Header */}
      <SafeAreaView edges={['top']} style={{ flex: 0 }}>
        <View className="flex-row items-center justify-between px-6 py-5">
          <View className="flex-1">
            <Text className="text-3xl font-black text-white leading-tight">
              Municipalities
            </Text>
            <View className="flex-row items-center mt-2">
              <MaterialIcons name="location-city" size={14} color="rgba(255,255,255,0.7)" />
              <Text className="text-white/70 text-xs font-bold ml-1 uppercase tracking-wider">
                Select a municipality to view barangays
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={handleCancel}
            className="bg-white/20 p-3 rounded-full active:bg-white/40"
          >
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* CURVED WHITE CONTAINER */}
      <View className="flex-1 bg-white rounded-t-[35px] overflow-hidden shadow-2xl">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 28 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Search Bar */}
          <View className="mb-6">
            <View className="relative">
              <TextInput
                className="bg-gray-50 p-4 pl-12 rounded-xl border border-gray-200 text-gray-800"
                placeholder="Search municipality..."
                placeholderTextColor="#9CA3AF"
                value={search}
                onChangeText={setSearch}
              />
              <View className="absolute left-4 top-4">
                <MaterialIcons name="search" size={20} color="#6B7280" />
              </View>
            </View>
          </View>

          {/* Stats Card */}
          <View className="bg-cyan-50 rounded-xl p-6 border border-cyan-200 mb-8 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 rounded-full bg-cyan-100 items-center justify-center mr-4 shadow">
                <MaterialIcons name="map" size={26} color="#0891B2" />
              </View>
              <View>
                <Text className="text-xl font-bold text-cyan-800">
                  Biliran Province
                </Text>
                <Text className="text-cyan-600 text-sm font-medium">
                  Eastern Visayas Region
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-3xl font-black text-cyan-700">
                  {municipalities.length}
                </Text>
                <Text className="text-cyan-600 text-sm font-bold uppercase tracking-wider">
                  Municipalities
                </Text>
              </View>

              <View className="items-center">
                <Text className="text-3xl font-black text-cyan-700">
                  {barangays.length}
                </Text>
                <Text className="text-cyan-600 text-sm font-bold uppercase tracking-wider">
                  Barangays
                </Text>
              </View>

              <View className="items-center">
                <Text className="text-3xl font-black text-cyan-700">1</Text>
                <Text className="text-cyan-600 text-sm font-bold uppercase tracking-wider">
                  Province
                </Text>
              </View>
            </View>
          </View>

          {/* Section Header */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-gray-400 font-bold text-xs uppercase tracking-[2px] mb-1">
                Municipalities List
              </Text>
              <Text className="text-lg font-bold text-gray-800">
                {filteredMunicipalities.length} Municipalities
              </Text>
            </View>
            <View className="bg-gray-100 px-3 py-1.5 rounded-full">
              <Text className="text-gray-500 text-xs font-bold">
                Tap to view barangays
              </Text>
            </View>
          </View>

          {/* Municipalities List */}
          {filteredMunicipalities.length === 0 ? (
            <View className="items-center justify-center py-16">
              <View className="bg-gray-100 w-24 h-24 rounded-full items-center justify-center mb-6 shadow-sm">
                <MaterialIcons name="location-off" size={44} color="#9CA3AF" />
              </View>
              <Text className="text-gray-400 font-bold text-xl mb-3">
                No municipalities found
              </Text>
              <Text className="text-gray-300 text-center text-sm">
                Try a different search term or check your spelling
              </Text>
            </View>
          ) : (
            filteredMunicipalities.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleMunicipalityPress(item)}
                activeOpacity={0.7}
                className="p-5 bg-white rounded-2xl mb-4 border border-gray-200 shadow-sm active:bg-gray-50"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-3">
                      <View className="w-12 h-12 rounded-full bg-cyan-100 items-center justify-center mr-4 shadow-sm">
                        <MaterialIcons
                          name="location-city"
                          size={24}
                          color="#0891B2"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-800">
                          {item.name}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          {item.totalBarangays} barangays
                        </Text>
                      </View>
                    </View>

                    {item.name === "Naval (Capital)" && (
                      <View className="ml-16">
                        <View className="bg-yellow-100 px-3 py-1.5 rounded-full self-start">
                          <View className="flex-row items-center">
                            <MaterialIcons name="star" size={12} color="#92400E" />
                            <Text className="text-yellow-800 text-xs font-bold ml-1 uppercase tracking-wider">
                              Provincial Capital
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>

                  <View className="bg-cyan-50 px-4 py-3 rounded-xl border border-cyan-200">
                    <View className="flex-row items-center">
                      <MaterialIcons
                        name="apartment"
                        size={18}
                        color="#0891B2"
                      />
                      <Text className="text-cyan-700 font-black text-lg ml-2">
                        {item.totalBarangays}
                      </Text>
                    </View>
                    <Text className="text-cyan-600 text-xs font-bold mt-1 uppercase tracking-wider">
                      Barangays
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}

          {/* Footer */}
          <View className="mt-8 pt-6 border-t border-gray-100">
            <View className="flex-row items-center justify-center">
              <MaterialIcons name="info" size={14} color="#9CA3AF" />
              <Text className="text-gray-400 text-xs text-center ml-1">
                All {municipalities.length} municipalities of Biliran Province are listed above
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default MunicipalitiesView;