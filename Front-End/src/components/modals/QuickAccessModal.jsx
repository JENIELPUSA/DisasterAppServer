import React, { useContext } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../contexts/AuthContext";

const QuickAccessModal = ({
  visible,
  onClose,
  menuItems = [],
  handleMenuItemPress,
}) => {
  const { role } = useContext(AuthContext);

  // ✅ FILTER BASED ON ROLE
  const filteredItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl h-4/5">
          <View className="flex-row justify-between items-center p-6 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-800">
              All Services
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            <View className="flex-row flex-wrap justify-between">
              {filteredItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className="w-[48%] bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 items-center"
                  onPress={() => handleMenuItemPress(item)}
                >
                  <View
                    className="w-16 h-16 rounded-xl justify-center items-center mb-3"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <Ionicons name={item.icon} size={28} color={item.color} />
                  </View>
                  <Text className="text-gray-800 font-semibold text-sm text-center leading-4">
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredItems.length === 0 && (
              <Text className="text-center text-gray-400 mt-10">
                No services available for your role
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default QuickAccessModal;
