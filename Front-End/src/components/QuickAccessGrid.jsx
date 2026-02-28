import React, { useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../contexts/AuthContext";

const QuickAccessGrid = ({
  menuItems = [],
  handleMenuItemPress,
  setQuickAccessModalVisible,
}) => {
  const { role } = useContext(AuthContext);

  // FILTER MENU BASED ON ROLE
  const filteredItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <View className="px-5 mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-gray-800 text-xl font-bold">
          Quick Access
        </Text>

        {filteredItems.length > 0 && (
          <TouchableOpacity onPress={() => setQuickAccessModalVisible(true)}>
            <Text className="text-cyan-700 font-semibold">View All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        <View className="flex-row space-x-4 pr-4">
          {filteredItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="w-28 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 items-center"
              onPress={() => handleMenuItemPress(item)}
            >
              <View
                className="w-12 h-12 rounded-xl justify-center items-center mb-2"
                style={{ backgroundColor: `${item.color}15` }}
              >
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <Text className="text-gray-800 font-semibold text-xs text-center leading-4">
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {filteredItems.length === 0 && (
        <Text className="text-gray-400 text-sm mt-2">
          No quick access available for your role
        </Text>
      )}
    </View>
  );
};

export default QuickAccessGrid;
