import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl h-4/5">
          <View className="flex-row justify-between items-center p-6 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-800">
              Detailed Analytical Reports
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
              <Text className="text-lg font-bold text-gray-800 mb-3">
                Evacuation Summary
              </Text>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600">Total Evacuated</Text>
                <Text className="text-green-600 font-bold text-lg">
                  {data.evacuationSummary?.totalEvacuated || 0}
                </Text>
              </View>

              <Text className="text-gray-700 font-semibold mt-4 mb-2">
                Barangay Breakdown:
              </Text>
              {evacuationBarangays.map((barangay, index) => (
                <View
                  key={index}
                  className="flex-row justify-between items-center py-2 border-b border-gray-100"
                >
                  <Text className="text-gray-600 flex-1">{barangay.name}</Text>
                  <Text className="text-gray-800 font-semibold">
                    {barangay.evacuated}/{barangay.capacity}
                  </Text>
                </View>
              ))}
            </View>

            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
              <Text className="text-lg font-bold text-gray-800 mb-3">
                Damage Summary
              </Text>
              <View className="flex-row justify-between mb-4">
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-red-600">
                    {data.damageSummary?.fullyDamaged || 0}
                  </Text>
                  <Text className="text-gray-600 text-xs text-center">
                    Fully Damaged
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-yellow-600">
                    {data.damageSummary?.partiallyDamaged || 0}
                  </Text>
                  <Text className="text-gray-600 text-xs text-center">
                    Partially Damaged
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-blue-600">
                    {data.damageSummary?.totalHouses || 0}
                  </Text>
                  <Text className="text-gray-600 text-xs text-center">
                    Total Houses
                  </Text>
                </View>
              </View>

              <Text className="text-gray-700 font-semibold mt-4 mb-2">
                Barangay Damage Breakdown:
              </Text>
              {damageBarangays.map((barangay, index) => (
                <View
                  key={index}
                  className="border border-gray-200 rounded-lg p-3 mb-2"
                >
                  <Text className="font-semibold text-gray-800 mb-1">
                    {barangay.name}
                  </Text>
                  <View className="flex-row justify-between">
                    <Text className="text-red-600 text-sm">
                      Fully: {barangay.fullyDamaged}
                    </Text>
                    <Text className="text-yellow-600 text-sm">
                      Partial: {barangay.partiallyDamaged}
                    </Text>
                    <Text className="text-blue-600 text-sm">
                      Total: {barangay.totalHouses}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
              <Text className="text-lg font-bold text-gray-800 mb-3">
                Road Passability
              </Text>
              <View className="flex-row justify-between mb-4">
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-green-600">
                    {data.roadPassability?.passable || 0}
                  </Text>
                  <Text className="text-gray-600 text-xs text-center">
                    Passable Roads
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-red-600">
                    {data.roadPassability?.notPassable || 0}
                  </Text>
                  <Text className="text-gray-600 text-xs text-center">
                    Not Passable
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-blue-600">
                    {data.roadPassability?.totalRoads || 0}
                  </Text>
                  <Text className="text-gray-600 text-xs text-center">
                    Total Roads
                  </Text>
                </View>
              </View>

              <Text className="text-gray-700 font-semibold mt-4 mb-2">
                Critical Roads Status:
              </Text>
              {roadBarangays.map((barangay, index) => (
                <View key={index} className="mb-3">
                  <Text className="font-semibold text-gray-800 mb-1">
                    {barangay.name}
                  </Text>
                  {(barangay.criticalRoads || []).map((road, roadIndex) => (
                    <View
                      key={roadIndex}
                      className="flex-row justify-between items-center py-1"
                    >
                      <Text className="text-gray-600 flex-1">{road.name}</Text>
                      <View
                        className={`px-2 py-1 rounded ${
                          road.status === "passable"
                            ? "bg-green-100"
                            : "bg-red-100"
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            road.status === "passable"
                              ? "text-green-800"
                              : "text-red-800"
                          }`}
                        >
                          {road.status === "passable"
                            ? "Passable"
                            : "Not Passable"}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>

            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
              <Text className="text-lg font-bold text-gray-800 mb-3">
                Relief Distribution
              </Text>
              <View className="flex-row justify-between mb-4">
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-purple-600">
                    {data.reliefDistribution?.totalFamiliesServed || 0}
                  </Text>
                  <Text className="text-gray-600 text-xs text-center">
                    Families Served
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-orange-600">
                    {data.reliefDistribution?.totalReliefPacks || 0}
                  </Text>
                  <Text className="text-gray-600 text-xs text-center">
                    Relief Packs
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-green-600">
                    {data.reliefDistribution?.distributionCenters || 0}
                  </Text>
                  <Text className="text-gray-600 text-xs text-center">
                    Centers
                  </Text>
                </View>
              </View>

              <Text className="text-gray-700 font-semibold mt-4 mb-2">
                Distribution by Barangay:
              </Text>
              {reliefBarangays.map((barangay, index) => (
                <View
                  key={index}
                  className="border border-gray-200 rounded-lg p-3 mb-2"
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="font-semibold text-gray-800">
                      {barangay.name}
                    </Text>
                    <View
                      className={`px-2 py-1 rounded ${
                        barangay.distributionStatus === "completed"
                          ? "bg-green-100"
                          : barangay.distributionStatus === "in-progress"
                          ? "bg-yellow-100"
                          : "bg-red-100"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          barangay.distributionStatus === "completed"
                            ? "text-green-800"
                            : barangay.distributionStatus === "in-progress"
                            ? "text-yellow-800"
                            : "text-red-800"
                        }`}
                      >
                        {barangay.distributionStatus}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-gray-600 text-sm">
                    Served: {barangay.familiesServed}/{barangay.totalFamilies}{" "}
                    families
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    Last Distribution: {barangay.lastDistribution}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default AnalyticalReportsModal;