import React from "react";
import { View, TouchableOpacity } from "react-native";

export default function DotIndicator({ currentSlide, totalSlides, onDotPress }) {
  return (
    <View style={{ position: "absolute", bottom: 32, left: 0, right: 0, flexDirection: "row", justifyContent: "center" }}>
      {Array.from({ length: totalSlides }).map((_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onDotPress(index)}
          style={{
            marginHorizontal: 4,
            borderRadius: 8,
            width: currentSlide === index ? 20 : 8,
            height: 8,
            backgroundColor: currentSlide === index ? "#fff" : "rgba(255,255,255,0.4)",
          }}
        />
      ))}
    </View>
  );
}
