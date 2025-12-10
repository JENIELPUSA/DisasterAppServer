import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
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
}) => {
  
  // Skeleton Loading Component
  const SkeletonLoading = () => {
    const skeletonItems = Array.from({ length: 8 }, (_, i) => i);
    
    return (
      <>
        {/* Header Skeleton */}
        <View className="px-6 pt-4 pb-3 border-b border-gray-100 bg-white">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="h-8 bg-gray-200 rounded w-40 mb-2 animate-pulse" />
              <View className="h-4 bg-gray-200 rounded w-60 animate-pulse" />
            </View>
            <View className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse ml-4" />
          </View>
        </View>

        {/* Search Bar Skeleton */}
        <View className="px-6 py-4">
          <View className="h-14 bg-gray-200 rounded-xl animate-pulse" />
        </View>

        {/* Stats Card Skeleton */}
        <View className="px-6">
          <View className="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-gray-200 rounded-full animate-pulse mr-3" />
              <View className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
            </View>

            <View className="flex-row justify-between">
              {[1, 2, 3].map((item) => (
                <View key={item} className="items-center">
                  <View className="h-8 bg-gray-200 rounded w-12 mb-2 animate-pulse" />
                  <View className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                </View>
              ))}
            </View>
          </View>

          {/* Section Title Skeleton */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
            <View className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
          </View>

          {/* Municipality Cards Skeleton */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          >
            {skeletonItems.map((item) => (
              <View
                key={item}
                className="p-5 bg-white rounded-xl mb-4 border border-gray-100 shadow-sm animate-pulse"
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <View className="w-10 h-10 bg-gray-200 rounded-full mr-3" />
                      <View className="h-6 bg-gray-200 rounded flex-1" />
                    </View>
                    <View className="ml-12">
                      <View className="bg-gray-200 px-4 py-1 rounded-full self-start mb-1 w-32 h-6" />
                    </View>
                  </View>
                  <View className="bg-gray-100 px-4 py-2 rounded-lg">
                    <View className="flex-row items-center">
                      <View className="h-5 bg-gray-200 rounded w-5" />
                      <View className="h-6 bg-gray-200 rounded w-8 ml-2" />
                    </View>
                    <View className="h-3 bg-gray-200 rounded w-12 mt-1" />
                  </View>
                </View>
              </View>
            ))}

            {/* Footer Text Skeleton */}
            <View className="mt-6">
              <View className="h-3 bg-gray-200 rounded w-64 mx-auto animate-pulse" />
            </View>
          </ScrollView>
        </View>
      </>
    );
  };

  return (
    <>
      {loading ? (
        <SkeletonLoading />
      ) : (
        <>
          <View className="px-6 pt-4 pb-3 border-b border-gray-100 bg-white">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-800">
                  Municipalities
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Select a municipality to view barangays
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleCancel}
                className="p-2 rounded-lg bg-gray-50 ml-4"
              >
                <MaterialIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="px-6 py-4">
            <View className="relative">
              <MaterialIcons
                name="search"
                size={20}
                color="#9CA3AF"
                style={{ position: 'absolute', left: 16, top: 16, zIndex: 10 }}
              />
              <TextInput
                className="bg-white p-4 pl-12 rounded-xl border border-gray-200 text-base"
                placeholder="Search municipalities..."
                placeholderTextColor="#9ca3af"
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearch("")}
                  className="absolute right-4 top-4"
                >
                  <MaterialIcons name="cancel" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 30 }}
          >
            <View className="bg-cyan-50 rounded-xl p-5 border border-cyan-200 mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-cyan-100 items-center justify-center mr-3">
                  <MaterialIcons name="map" size={22} color="#0891B2" />
                </View>
                <Text className="text-lg font-semibold text-cyan-800">
                  Biliran Province
                </Text>
              </View>

              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-cyan-700">
                    {municipalities.length}
                  </Text>
                  <Text className="text-cyan-600 text-sm font-medium">Municipalities</Text>
                </View>

                <View className="items-center">
                  <Text className="text-2xl font-bold text-cyan-700">
                    {barangays.length}
                  </Text>
                  <Text className="text-cyan-600 text-sm font-medium">Barangays</Text>
                </View>

                <View className="items-center">
                  <Text className="text-2xl font-bold text-cyan-700">1</Text>
                  <Text className="text-cyan-600 text-sm font-medium">Province</Text>
                </View>
              </View>
            </View>

            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-700">
                Municipalities ({filteredMunicipalities.length})
              </Text>
              <Text className="text-gray-500 text-sm">
                Tap to view barangays
              </Text>
            </View>

            {filteredMunicipalities.length === 0 ? (
              <View className="items-center justify-center py-10">
                <MaterialIcons name="location-off" size={48} color="#D1D5DB" />
                <Text className="text-gray-400 text-lg font-medium mt-4">
                  No municipalities found
                </Text>
                <Text className="text-gray-400 text-center mt-2">
                  Try a different search term
                </Text>
              </View>
            ) : (
              filteredMunicipalities.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelectedMunicipality(item)}
                  activeOpacity={0.7}
                  className="p-5 bg-white rounded-xl mb-4 border border-gray-100 shadow-sm"
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <View className="w-10 h-10 rounded-full bg-cyan-100 items-center justify-center mr-3">
                          <MaterialIcons name="location-city" size={22} color="#0891B2" />
                        </View>
                        <Text className="text-lg font-semibold text-gray-800">
                          {item.name}
                        </Text>
                      </View>

                      {item.name === "Naval (Capital)" && (
                        <View className="ml-12">
                          <View className="bg-yellow-100 px-2 py-1 rounded-full self-start mb-1">
                            <Text className="text-yellow-800 text-xs font-medium">Provincial Capital</Text>
                          </View>
                        </View>
                      )}
                    </View>

                    <View className="bg-cyan-50 px-4 py-2 rounded-lg border border-cyan-200">
                      <View className="flex-row items-center">
                        <MaterialIcons name="apartment" size={16} color="#0891B2" />
                        <Text className="text-cyan-700 font-bold text-base ml-2">
                          {item.totalBarangays}
                        </Text>
                      </View>
                      <Text className="text-cyan-600 text-xs font-medium mt-1">
                        Barangays
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}

            <View className="mt-6">
              <Text className="text-gray-400 text-xs text-center">
                All 8 municipalities of Biliran Province are listed above
              </Text>
            </View>
          </ScrollView>
        </>
      )}
    </>
  );
};

export default MunicipalitiesView;