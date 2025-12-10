import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";

const AnalyticalReportsPreview = ({
  analyticalReportsData,
  setAnalyticalReportsModalVisible,
}) => {
  const evacuationData = analyticalReportsData?.evacuationSummary || {
    totalEvacuated: 0,
  };
  const damageData = analyticalReportsData?.damageSummary || {
    fullyDamaged: 0,
    partiallyDamaged: 0,
    totalHouses: 0,
  };
  const roadData = analyticalReportsData?.roadPassability || {
    passable: 0,
    notPassable: 0,
    totalRoads: 0,
  };
  const reliefData = analyticalReportsData?.reliefDistribution || {
    totalFamiliesServed: 0,
    totalReliefPacks: 0,
    remainingPacks: 0,
    distributionCenters: 0,
  };

  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">
          Analytical Reports
        </Text>
        <TouchableOpacity
          onPress={() => setAnalyticalReportsModalVisible(true)}
        >
          <Text className="text-blue-600 font-semibold">View All</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-lg font-bold text-gray-800">
              Evacuation Summary
            </Text>
            <Text className="text-gray-600 text-sm">
              Real-time evacuation data
            </Text>
          </View>
          <View className="bg-green-100 px-3 py-2 rounded-full">
            <Text className="text-green-800 font-bold text-lg">
              {evacuationData.totalEvacuated}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between mb-2">
          <View className="items-center flex-1">
            <Text className="text-2xl font-bold text-red-600">
              {damageData.fullyDamaged}
            </Text>
            <Text className="text-gray-600 text-xs text-center">
              Fully Damaged Houses
            </Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-2xl font-bold text-yellow-600">
              {damageData.partiallyDamaged}
            </Text>
            <Text className="text-gray-600 text-xs text-center">
              Partially Damaged
            </Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-2xl font-bold text-blue-600">
              {damageData.totalHouses}
            </Text>
            <Text className="text-gray-600 text-xs text-center">
              Total Houses
            </Text>
          </View>
        </View>

        <View className="border-t border-gray-200 pt-3 mt-2">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-lg font-bold text-gray-800">
                Road Passability
              </Text>
              <Text className="text-gray-600 text-sm">
                Current road conditions
              </Text>
            </View>
            <View className="bg-blue-100 px-3 py-2 rounded-full">
              <Text className="text-blue-800 font-bold text-lg">
                {roadData.passable}/{roadData.totalRoads}
              </Text>
            </View>
          </View>
          <View className="flex-row justify-between mt-2">
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-green-600">
                {roadData.passable}
              </Text>
              <Text className="text-gray-600 text-xs text-center">
                Passable
              </Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-red-600">
                {roadData.notPassable}
              </Text>
              <Text className="text-gray-600 text-xs text-center">
                Not Passable
              </Text>
            </View>
          </View>
        </View>

        <View className="border-t border-gray-200 pt-3 mt-2">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-lg font-bold text-gray-800">
                Relief Distribution
              </Text>
              <Text className="text-gray-600 text-sm">
                Aid distribution status
              </Text>
            </View>
            <View className="bg-purple-100 px-3 py-2 rounded-full">
              <Text className="text-purple-800 font-bold text-lg">
                {reliefData.totalFamiliesServed}
              </Text>
            </View>
          </View>
          <View className="flex-row justify-between mt-2">
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-purple-600">
                {reliefData.totalReliefPacks}
              </Text>
              <Text className="text-gray-600 text-xs text-center">
                Relief Packs
              </Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-orange-600">
                {reliefData.remainingPacks}
              </Text>
              <Text className="text-gray-600 text-xs text-center">
                Remaining
              </Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-green-600">
                {reliefData.distributionCenters}
              </Text>
              <Text className="text-gray-600 text-xs text-center">Centers</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          className="bg-cyan-600  py-3 rounded-xl mt-4"
          onPress={() => setAnalyticalReportsModalVisible(true)}
        >
          <Text className="text-white text-center font-semibold">
            View Detailed Reports
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AnalyticalReportsPreview;