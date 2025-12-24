import React from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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
    <View className="flex-1 justify-center px-6 pb-6 bg-white">
      <View className="items-center mb-6">
        <LinearGradient
          colors={["#4facfe", "#FC563C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-40 h-40 rounded-full justify-center items-center"
        >
          <Image
            source={slide.image}
            className="w-full h-full"
            resizeMode="contain"
          />
        </LinearGradient>

        <Text className="text-2xl font-extrabold text-center my-2 text-gray-800">
          {slide.title}
        </Text>
        <Text className="text-base text-center mb-6 text-gray-600">
          {slide.description}
        </Text>
      </View>

      <View className="mb-4">
        <Text className="text-sm font-semibold mb-1 text-gray-700">
          Email Address
        </Text>
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="rgba(0,0,0,0.5)"
          value={email}
          onChangeText={setEmail}
          className="border-2 border-gray-300 rounded-2xl p-4 bg-gray-50"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View className="mb-6">
        <Text className="text-sm font-semibold mb-1 text-gray-700">
          Password
        </Text>
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor="rgba(0,0,0,0.5)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="border-2 border-gray-300 rounded-2xl p-4 bg-gray-50"
        />
      </View>

      <TouchableOpacity
        onPress={handleLogin}
        className="h-14 rounded-3xl justify-center items-center bg-blue-400 mb-3"
        disabled={isLoading}
      >
        <Text className="text-base font-bold text-white">
          {isLoading ? "Signing In..." : "Sign In"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onRegisterPress}
        className="p-4 items-center"
      >
        <Text className="text-sm text-blue-400 font-semibold">
          Don't have an account?{" "}
          <Text className="font-bold underline">Register here</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;