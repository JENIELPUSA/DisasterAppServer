import React, { useContext } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  StatusBar,
  Dimensions 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const QuickAccessModal = ({
  visible,
  onClose,
  menuItems = [],
  handleMenuItemPress,
}) => {
  const { role } = useContext(AuthContext);

  // FILTER BASED ON ROLE
  const filteredItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

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
                Quick Access{"\n"}Services
              </Text>
              <View className="flex-row items-center mt-2">
                <Ionicons name="grid" size={14} color="rgba(255,255,255,0.7)" />
                <Text className="text-white/70 text-xs font-bold ml-1 uppercase tracking-wider">
                  All Available Features
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
              paddingHorizontal: 20, 
              paddingVertical: 28,
              paddingBottom: 40 
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Role Badge */}
            <View className="mb-6 self-start">
              <View className="bg-cyan-100 px-4 py-2 rounded-full">
                <Text className="text-cyan-700 font-bold text-xs uppercase tracking-wider">
                  {role === 'admin' ? 'Administrator' : 
                   role === 'staff' ? 'Staff Member' : 
                   role === 'user' ? 'Regular User' : role}
                </Text>
              </View>
            </View>

            {/* Services Grid */}
            <Text className="text-gray-400 font-bold text-xs uppercase tracking-[2px] mb-4">
              Available Services ({filteredItems.length})
            </Text>
            
            <View className="flex-row flex-wrap justify-between">
              {filteredItems.map((item, index) => (
                <TouchableOpacity
                  key={item.id || index}
                  className="w-[48%] bg-gray-50 rounded-2xl p-5 mb-4 border border-gray-100 items-center active:bg-gray-100"
                  onPress={() => {
                    onClose();
                    setTimeout(() => {
                      handleMenuItemPress(item);
                    }, 300);
                  }}
                  activeOpacity={0.7}
                >
                  {/* Icon Container with gradient effect */}
                  <View 
                    className="w-20 h-20 rounded-2xl justify-center items-center mb-4 shadow-sm"
                    style={{ 
                      backgroundColor: `${item.color}15`,
                      borderWidth: 1,
                      borderColor: `${item.color}30`
                    }}
                  >
                    <View className="absolute w-full h-full rounded-2xl opacity-10" 
                          style={{ backgroundColor: item.color }} />
                    <Ionicons name={item.icon} size={32} color={item.color} />
                  </View>
                  
                  {/* Service Title */}
                  <Text className="text-gray-800 font-bold text-sm text-center leading-5 mb-1">
                    {item.title}
                  </Text>
                  
                  {/* Description if available */}
                  {item.description && (
                    <Text className="text-gray-500 text-xs text-center mt-1">
                      {item.description}
                    </Text>
                  )}
                  
                  {/* Badge for roles if specified */}
                  {item.roles && item.roles.length > 0 && (
                    <View className="mt-2 bg-white/50 px-2 py-1 rounded-full">
                      <Text className="text-gray-400 text-[10px] font-bold">
                        {item.roles.includes('admin') && 'ADMIN'}
                        {item.roles.includes('staff') && 'STAFF'}
                        {item.roles.includes('user') && 'USER'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Empty State */}
            {filteredItems.length === 0 && (
              <View className="items-center justify-center py-16">
                <View className="bg-gray-100 w-24 h-24 rounded-full items-center justify-center mb-4">
                  <Ionicons name="lock-closed" size={40} color="#9CA3AF" />
                </View>
                <Text className="text-gray-400 font-bold text-lg mb-2">
                  No Services Available
                </Text>
                <Text className="text-gray-300 text-center text-sm">
                  There are no services available for your current role.
                  {"\n"}Contact your administrator for access.
                </Text>
              </View>
            )}

            {/* Footer */}
            <View className="mt-8 pt-6 border-t border-gray-100">
              <Text className="text-gray-400 text-center text-xs">
                {filteredItems.length} services available • Tap any service to open
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default QuickAccessModal;