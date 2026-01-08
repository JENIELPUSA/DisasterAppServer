import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Header = ({ 
  userProfile, 
  handleProfileLogoPress, 
  handleNotificationBellPress 
}) => {
  return (
    <View className="bg-cyan-700 pb-4 pt-10">
      {/* Search Bar - Slim UI */}
      <View className="mx-5 mb-3">
        <View className="flex-row items-center bg-white rounded-xl px-3 py-2 border border-gray-200">
          <Ionicons name="search" size={18} color="#6B7280" />

          <TextInput
            placeholder="Search..."
            className="flex-1 ml-2 text-sm"
            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity>
            <Ionicons name="filter" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Welcome Section - nasa ibaba ng search bar */}
      <View className="flex-row items-center justify-between px-5">
        <View className="flex-row items-center">
          {/* Profile Image - now clickable to open LEFT panel */}
          <TouchableOpacity
            onPress={handleProfileLogoPress}
            activeOpacity={0.8}
          >
            <View className="relative">
              {/* Profile Image with border */}
              <Image
                source={{ uri: userProfile.profileImage }}
                className="w-14 h-14 rounded-full border-2 border-white shadow-lg"
                resizeMode="cover"
              />
              {/* Online status indicator */}
              <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            </View>
          </TouchableOpacity>
          <View className="ml-4">
            <Text className="text-green-100 text-sm">Good morning</Text>
            <Text className="text-white text-xl font-bold mt-1">
              Welcome {userProfile.name.split(" ")[0]}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          className="relative w-10 h-10 bg-white/20 rounded-full justify-center items-center"
          onPress={handleNotificationBellPress}
        >
          <Ionicons name="notifications-outline" size={24} color="white" />
          <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white">
            <Text className="text-white text-xs text-center font-bold">
              3
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;