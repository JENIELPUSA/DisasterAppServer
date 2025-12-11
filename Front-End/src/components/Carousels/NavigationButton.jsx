import React from "react";
import { View, TouchableOpacity, Text } from "react-native";

export default function NavigationButtons({ currentSlide, totalSlides, onSkip, onNext }) {
  if (currentSlide === totalSlides - 1) return null;

  return (
    <View style={{ position: "absolute", bottom: 64, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 24 }}>
      <TouchableOpacity onPress={onSkip}>
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#fff" }}>Skip</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onNext} style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, backgroundColor: "#fff" }}>
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#FC563C" }}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}
