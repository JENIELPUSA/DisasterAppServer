import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function LoginForm({ slide, email, setEmail, password, setPassword, handleLogin, isLoading }) {
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  return (
    <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24, paddingBottom: 24, backgroundColor: "#fff" }}>
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <LinearGradient colors={["#4facfe", "#FC563C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 160, height: 160, borderRadius: 80, justifyContent: "center", alignItems: "center" }}>
          <Image source={slide.image} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
        </LinearGradient>

        <Text style={{ fontSize: 24, fontWeight: "800", textAlign: "center", marginVertical: 8, color: "#1F2937" }}>
          {slide.title}
        </Text>
        <Text style={{ fontSize: 16, textAlign: "center", marginBottom: 24, color: "#4B5563" }}>
          {slide.description}
        </Text>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 4, color: "#374151" }}>Email Address</Text>
        <TextInput placeholder="Enter your email" placeholderTextColor="rgba(0,0,0,0.5)" value={email} onChangeText={setEmail} style={{ borderWidth: 2, borderColor: "#D1D5DB", borderRadius: 16, padding: 16, backgroundColor: "#F9FAFB" }} keyboardType="email-address" autoCapitalize="none" />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 4, color: "#374151" }}>Password</Text>
        <TextInput placeholder="Enter your password" placeholderTextColor="rgba(0,0,0,0.5)" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 2, borderColor: "#D1D5DB", borderRadius: 16, padding: 16, backgroundColor: "#F9FAFB" }} />
      </View>

      <TouchableOpacity onPress={handleLogin} style={{ height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center", backgroundColor: "#4facfe" }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>{isLoading ? "Signing In..." : "Sign In"}</Text>
      </TouchableOpacity>
    </View>
  );
}
