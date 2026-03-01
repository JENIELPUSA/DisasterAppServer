import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { height } = Dimensions.get("window");

const LoginScreen = ({
  slide,
  email,
  setEmail,
  password,
  setPassword,
  handleLogin,
  isLoading,
  onRegisterPress,
}) => {
  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Section: Logo & Titles */}
        <View
          // 1. Tinaasan ang height (height * 0.45) at dinagdagan ng padding-top (pt-16)
          style={{ height: height * 0.47 }}
          className="justify-center items-center px-8 pt-10" 
        >
          {/* Logo Container */}
          <View className="w-64 h-64 justify-center items-center"> 
            <Image
              source={slide.image}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>

          {/* Titles */}
          <View className="items-center">
            <Text className="text-3xl font-black text-gray-800 tracking-tight">
              {slide.title}
            </Text>
            <Text className="text-sm text-gray-500 text-center mt-2 px-4">
              {slide.description}
            </Text>
          </View>
        </View>

        {/* Bottom Section: Form */}
        <View className="flex-1 bg-white px-8 pt-6 pb-10">
          {/* Email Input */}
          <View className="mb-5">
            <Text className="text-xs font-bold mb-2 ml-1 text-cyan-700 uppercase tracking-widest">
              Email Address
            </Text>
            <TextInput
              placeholder="name@email.com"
              placeholderTextColor="#A0AEC0"
              value={email}
              onChangeText={setEmail}
              className="h-14 px-5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 font-medium"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View className="mb-8">
            <Text className="text-xs font-bold mb-2 ml-1 text-cyan-700 uppercase tracking-widest">
              Password
            </Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#A0AEC0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="h-14 px-5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 font-medium"
            />
          </View>

     {/* Sign In Button with Custom Border Radius */}
<TouchableOpacity
  onPress={handleLogin}
  disabled={isLoading}
  activeOpacity={0.8}
  // Dinagdagan ng rounded-2xl para sa border radius
  className={`shadow-lg shadow-cyan-600/30 rounded-2xl overflow-hidden ${isLoading ? "opacity-70" : "opacity-100"}`}
>
  <LinearGradient
    colors={["#06b6d4", "#0891b2"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    // Pinalitan ang rounded-full ng rounded-2xl para maging rectangular na may kanto
    className="h-14 rounded-2xl justify-center items-center flex-row"
  >
    {isLoading ? (
      <ActivityIndicator size="small" color="#ffffff" />
    ) : (
      <Text className="text-base font-black text-white uppercase tracking-[2px]">
        Sign In
      </Text>
    )}
  </LinearGradient>
</TouchableOpacity>

          {/* Register Link */}
          <View className="mt-auto pt-8 items-center">
            <TouchableOpacity onPress={onRegisterPress}>
              <Text className="text-gray-500 font-medium">
                Don't have an account?{" "}
                <Text className="text-cyan-600 font-bold">Register here</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LoginScreen;