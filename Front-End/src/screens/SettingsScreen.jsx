import { View, Text, TouchableOpacity } from "react-native";
import { useAuth } from "../contexts/AuthContext"; 

export default function SettingsScreen() {
  const { logout } = useAuth();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-black mb-6">Settings Screen</Text>

      <TouchableOpacity
        onPress={logout}
        className="bg-red-500 px-6 py-3 rounded"
      >
        <Text className="text-white font-bold text-lg">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
