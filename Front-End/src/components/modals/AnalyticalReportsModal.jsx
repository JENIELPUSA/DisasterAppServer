import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const AnalyticalReportsModal = ({
  visible,
  onClose,
  analyticalReportsData,
}) => {
  const data = analyticalReportsData || {};

  const evacuationBarangays = data.evacuationSummary?.barangays || [];
  const damageBarangays = data.damageSummary?.barangays || [];
  const roadBarangays = data.roadPassability?.barangays || [];
  const reliefBarangays = data.reliefDistribution?.barangays || [];

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Cyan background container */}
      <View className="flex-1 bg-cyan-700">
        <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
        
        {/* Header Section */}
        <SafeAreaView edges={['top']} style={{ flex: 0 }}>
          <View className="flex-row items-center justify-between px-6 py-5">
            <View className="flex-1">
              <Text className="text-3xl font-black text-white leading-tight">
                Analytical{"\n"}Reports
              </Text>
              <View className="flex-row items-center mt-2">
                <Ionicons name="analytics" size={14} color="rgba(255,255,255,0.7)" />
                <Text className="text-white/70 text-xs font-bold ml-1 uppercase tracking-wider">
                  Detailed Analysis & Insights
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={onClose}
              className="bg-white/20 p-3 rounded-full active:bg-white/40"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* CURVED WHITE CONTAINER */}
        <View className="flex-1 bg-white rounded-t-[35px] overflow-hidden shadow-2xl">
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ 
              paddingHorizontal: 24, 
              paddingVertical: 28,
              paddingBottom: 40 
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Stats Summary Cards */}
            <View className="mb-6">
              <Text className="text-gray-400 font-bold text-xs uppercase tracking-[2px] mb-4">
                Disaster Overview
              </Text>
              
              <View className="flex-row justify-between mb-3">
                <View className="w-[23%] bg-green-50 rounded-xl p-3 items-center border border-green-100">
                  <Ionicons name="people" size={20} color="#059669" />
                  <Text className="text-2xl font-black text-green-700 mt-2">
                    {data.evacuationSummary?.totalEvacuated || 0}
                  </Text>
                  <Text className="text-green-600 text-[10px] font-bold uppercase tracking-wider text-center">
                    Evacuated
                  </Text>
                </View>
                
                <View className="w-[23%] bg-red-50 rounded-xl p-3 items-center border border-red-100">
                  <Ionicons name="home" size={20} color="#DC2626" />
                  <Text className="text-2xl font-black text-red-700 mt-2">
                    {(data.damageSummary?.fullyDamaged || 0) + (data.damageSummary?.partiallyDamaged || 0)}
                  </Text>
                  <Text className="text-red-600 text-[10px] font-bold uppercase tracking-wider text-center">
                    Damaged
                  </Text>
                </View>
                
                <View className="w-[23%] bg-blue-50 rounded-xl p-3 items-center border border-blue-100">
                  <Ionicons name="road" size={20} color="#2563EB" />
                  <Text className="text-2xl font-black text-blue-700 mt-2">
                    {data.roadPassability?.passable || 0}
                  </Text>
                  <Text className="text-blue-600 text-[10px] font-bold uppercase tracking-wider text-center">
                    Passable
                  </Text>
                </View>
                
                <View className="w-[23%] bg-purple-50 rounded-xl p-3 items-center border border-purple-100">
                  <Ionicons name="basket" size={20} color="#7C3AED" />
                  <Text className="text-2xl font-black text-purple-700 mt-2">
                    {data.reliefDistribution?.totalFamiliesServed || 0}
                  </Text>
                  <Text className="text-purple-600 text-[10px] font-bold uppercase tracking-wider text-center">
                    Served
                  </Text>
                </View>
              </View>
            </View>

            {/* Evacuation Summary Card */}
            <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-lg bg-green-100 items-center justify-center mr-3">
                  <Ionicons name="people" size={22} color="#059669" />
                </View>
                <Text className="text-xl font-bold text-gray-800">
                  Evacuation Summary
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-600 font-medium">Total Evacuated</Text>
                <View className="bg-green-50 px-4 py-2 rounded-lg">
                  <Text className="text-green-700 font-black text-lg">
                    {data.evacuationSummary?.totalEvacuated || 0}
                  </Text>
                </View>
              </View>

              <Text className="text-gray-700 font-semibold mb-3">Barangay Breakdown:</Text>
              {evacuationBarangays.length > 0 ? (
                evacuationBarangays.map((barangay, index) => (
                  <View
                    key={index}
                    className="flex-row justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <Text className="text-gray-700 flex-1">{barangay.name}</Text>
                    <View className="bg-gray-50 px-3 py-1.5 rounded-lg">
                      <Text className="text-gray-800 font-bold">
                        {barangay.evacuated}/{barangay.capacity}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text className="text-gray-400 text-center py-4">No data available</Text>
              )}
            </View>

            {/* Damage Summary Card */}
            <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-lg bg-red-100 items-center justify-center mr-3">
                  <Ionicons name="home" size={22} color="#DC2626" />
                </View>
                <Text className="text-xl font-bold text-gray-800">
                  Damage Summary
                </Text>
              </View>
              
              <View className="flex-row justify-between mb-6">
                <View className="items-center flex-1">
                  <Text className="text-3xl font-black text-red-600">
                    {data.damageSummary?.fullyDamaged || 0}
                  </Text>
                  <Text className="text-gray-600 text-xs font-bold uppercase tracking-wider mt-1">
                    Fully Damaged
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-3xl font-black text-yellow-600">
                    {data.damageSummary?.partiallyDamaged || 0}
                  </Text>
                  <Text className="text-gray-600 text-xs font-bold uppercase tracking-wider mt-1">
                    Partially Damaged
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-3xl font-black text-blue-600">
                    {data.damageSummary?.totalHouses || 0}
                  </Text>
                  <Text className="text-gray-600 text-xs font-bold uppercase tracking-wider mt-1">
                    Total Houses
                  </Text>
                </View>
              </View>

              <Text className="text-gray-700 font-semibold mb-3">Barangay Damage Breakdown:</Text>
              {damageBarangays.length > 0 ? (
                damageBarangays.map((barangay, index) => (
                  <View
                    key={index}
                    className="border border-gray-200 rounded-xl p-4 mb-3"
                  >
                    <Text className="font-bold text-gray-800 mb-2">{barangay.name}</Text>
                    <View className="flex-row justify-between">
                      <View className="items-center">
                        <Text className="text-red-600 font-bold">{barangay.fullyDamaged}</Text>
                        <Text className="text-gray-500 text-xs">Fully</Text>
                      </View>
                      <View className="items-center">
                        <Text className="text-yellow-600 font-bold">{barangay.partiallyDamaged}</Text>
                        <Text className="text-gray-500 text-xs">Partial</Text>
                      </View>
                      <View className="items-center">
                        <Text className="text-blue-600 font-bold">{barangay.totalHouses}</Text>
                        <Text className="text-gray-500 text-xs">Total</Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text className="text-gray-400 text-center py-4">No data available</Text>
              )}
            </View>

            {/* Road Passability Card */}
            <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-lg bg-blue-100 items-center justify-center mr-3">
                  <Ionicons name="road" size={22} color="#2563EB" />
                </View>
                <Text className="text-xl font-bold text-gray-800">
                  Road Passability
                </Text>
              </View>
              
              <View className="flex-row justify-between mb-6">
                <View className="items-center flex-1">
                  <Text className="text-3xl font-black text-green-600">
                    {data.roadPassability?.passable || 0}
                  </Text>
                  <Text className="text-gray-600 text-xs font-bold uppercase tracking-wider mt-1">
                    Passable
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-3xl font-black text-red-600">
                    {data.roadPassability?.notPassable || 0}
                  </Text>
                  <Text className="text-gray-600 text-xs font-bold uppercase tracking-wider mt-1">
                    Not Passable
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-3xl font-black text-blue-600">
                    {data.roadPassability?.totalRoads || 0}
                  </Text>
                  <Text className="text-gray-600 text-xs font-bold uppercase tracking-wider mt-1">
                    Total Roads
                  </Text>
                </View>
              </View>

              <Text className="text-gray-700 font-semibold mb-3">Critical Roads Status:</Text>
              {roadBarangays.length > 0 ? (
                roadBarangays.map((barangay, index) => (
                  <View key={index} className="mb-4 last:mb-0">
                    <Text className="font-bold text-gray-800 mb-2">{barangay.name}</Text>
                    {(barangay.criticalRoads || []).map((road, roadIndex) => (
                      <View
                        key={roadIndex}
                        className="flex-row justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <Text className="text-gray-700 flex-1">{road.name}</Text>
                        <View
                          className={`px-3 py-1.5 rounded-lg ${
                            road.status === "passable"
                              ? "bg-green-100"
                              : "bg-red-100"
                          }`}
                        >
                          <Text
                            className={`font-bold text-xs ${
                              road.status === "passable"
                                ? "text-green-800"
                                : "text-red-800"
                            }`}
                          >
                            {road.status === "passable" ? "Passable" : "Not Passable"}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ))
              ) : (
                <Text className="text-gray-400 text-center py-4">No data available</Text>
              )}
            </View>

            {/* Relief Distribution Card */}
            <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-lg bg-purple-100 items-center justify-center mr-3">
                  <Ionicons name="basket" size={22} color="#7C3AED" />
                </View>
                <Text className="text-xl font-bold text-gray-800">
                  Relief Distribution
                </Text>
              </View>
              
              <View className="flex-row justify-between mb-6">
                <View className="items-center flex-1">
                  <Text className="text-3xl font-black text-purple-600">
                    {data.reliefDistribution?.totalFamiliesServed || 0}
                  </Text>
                  <Text className="text-gray-600 text-xs font-bold uppercase tracking-wider mt-1">
                    Families Served
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-3xl font-black text-orange-600">
                    {data.reliefDistribution?.totalReliefPacks || 0}
                  </Text>
                  <Text className="text-gray-600 text-xs font-bold uppercase tracking-wider mt-1">
                    Relief Packs
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-3xl font-black text-green-600">
                    {data.reliefDistribution?.distributionCenters || 0}
                  </Text>
                  <Text className="text-gray-600 text-xs font-bold uppercase tracking-wider mt-1">
                    Centers
                  </Text>
                </View>
              </View>

              <Text className="text-gray-700 font-semibold mb-3">Distribution by Barangay:</Text>
              {reliefBarangays.length > 0 ? (
                reliefBarangays.map((barangay, index) => (
                  <View
                    key={index}
                    className="border border-gray-200 rounded-xl p-4 mb-3"
                  >
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="font-bold text-gray-800">{barangay.name}</Text>
                      <View
                        className={`px-3 py-1.5 rounded-lg ${
                          barangay.distributionStatus === "completed"
                            ? "bg-green-100"
                            : barangay.distributionStatus === "in-progress"
                            ? "bg-yellow-100"
                            : "bg-red-100"
                        }`}
                      >
                        <Text
                          className={`font-bold text-xs ${
                            barangay.distributionStatus === "completed"
                              ? "text-green-800"
                              : barangay.distributionStatus === "in-progress"
                              ? "text-yellow-800"
                              : "text-red-800"
                          }`}
                        >
                          {barangay.distributionStatus?.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <View className="space-y-2">
                      <Text className="text-gray-600 text-sm">
                        <Text className="font-bold">Served:</Text> {barangay.familiesServed}/{barangay.totalFamilies} families
                      </Text>
                      <Text className="text-gray-600 text-sm">
                        <Text className="font-bold">Last Distribution:</Text> {barangay.lastDistribution || 'N/A'}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text className="text-gray-400 text-center py-4">No data available</Text>
              )}
            </View>

            {/* Footer */}
            <View className="mt-6 pt-6 border-t border-gray-100">
              <Text className="text-gray-400 text-xs text-center">
                Last updated: {new Date().toLocaleDateString()}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default AnalyticalReportsModal;