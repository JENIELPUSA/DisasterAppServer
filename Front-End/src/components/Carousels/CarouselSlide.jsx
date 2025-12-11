import React from "react";
import { View, Text, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import VideoPlayer from "./VideoPlayer"; // separate component for video

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function CarouselSlide({ slide }) {
  const isVideoSlide = slide.id === 2 || slide.id === 3;

  return (
    <View style={{ width: screenWidth, height: screenHeight, flex: 1 }}>
      <LinearGradient
        colors={slide.gradientColors}
        start={slide.gradientStart}
        end={slide.gradientEnd}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <View style={{ justifyContent: "center", alignItems: "center", marginTop: -screenHeight * 0.05 }}>
          <View style={{ width: 288, height: 288, borderRadius: 144, overflow: "hidden", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,255,255,0.1)" }}>
            {isVideoSlide ? <VideoPlayer slideId={slide.id} /> : <Image source={slide.image} style={{ width: 320, height: 288 }} resizeMode="contain" />}
          </View>
        </View>
        <View style={{ alignItems: "center", marginTop: 16 }}>
          <Text style={{ fontSize: 32, fontWeight: "800", color: slide.textColor, textAlign: "center", marginBottom: 8 }}>
            {slide.title}
          </Text>
          <Text style={{ fontSize: 16, color: slide.textColor, textAlign: "center", lineHeight: 28 }}>
            {slide.description}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}
