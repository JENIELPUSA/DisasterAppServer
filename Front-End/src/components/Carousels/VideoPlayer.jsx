import React, { useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Video } from "expo-av";

export default function VideoPlayer({ slideId }) {
  const videoRef = useRef(null);

  const source =
    slideId === 2
      ? require("../../../assets/Sagip1.mp4")
      : require("../../../assets/sagip2.mp4");

  useEffect(() => {
    const playVideo = async () => {
      if (videoRef.current) {
        try {
          await videoRef.current.loadAsync(source, { shouldPlay: true, isLooping: true, volume: 0 });
        } catch (error) {
          console.log("Video load error:", error);
        }
      }
    };
    playVideo();
  }, [slideId]);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={source}
        style={styles.video}
        resizeMode="cover"
        isLooping
        shouldPlay
        volume={0}
        useNativeControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", height: "100%" },
  video: { width: "100%", height: "100%" },
});
