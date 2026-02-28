import React from "react";
import { View, Text, Modal, TouchableOpacity, FlatList } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

const SelectionModal = ({ visible, onClose, title, data, onSelect, labelKey }) => (
  <Modal visible={visible} animationType="slide" transparent={true}>
    <View className="flex-1 bg-black/50 justify-end">
      <View className="bg-white h-[70%] rounded-t-3xl shadow-xl">
        <View className="flex-row items-center justify-between p-5 border-b border-gray-100">
          <Text className="text-xl font-bold text-gray-800">{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={28} color="black" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={data}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="p-5 border-b border-gray-50 active:bg-blue-50"
              onPress={() => onSelect(item)}
            >
              <Text className="text-lg text-gray-700">{item[labelKey]}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="p-10 items-center">
              <Ionicons name="search-outline" size={40} color="#D1D5DB" />
              <Text className="text-gray-400 mt-2 text-center">Walang mahanap na data.</Text>
            </View>
          }
        />
      </View>
    </View>
  </Modal>
);

export default SelectionModal;