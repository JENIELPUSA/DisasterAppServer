import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const EducationalVideos = ({
  educationalVideos,
  handleVideoPress,
  setVideosModalVisible,
}) => {
  const videos = educationalVideos || [];

  return (
    <View className="mb-6 px-5">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">
          Educational Videos
        </Text>
        <TouchableOpacity onPress={() => setVideosModalVisible(true)}>
          <Text className="text-blue-600 font-semibold">See All</Text>
        </TouchableOpacity>
      </View>

      <View>
        {videos.slice(0, 2).map((video) => (
          <TouchableOpacity
            key={video.id}
            className="mb-4 bg-white rounded-2xl shadow-lg overflow-hidden"
            onPress={() => handleVideoPress(video)}
          >
            <View className="relative">
              <Image
                source={video.thumbnail}
                style={{ width: "100%", height: 180 }}
                resizeMode="cover"
              />
              <View className="absolute inset-0 bg-black opacity-20" />
              <View className="absolute inset-0 items-center justify-center">
                <View className="w-14 h-14 bg-white rounded-full items-center justify-center opacity-90">
                  <Ionicons name="play" size={28} color="#3B82F6" />
                </View>
              </View>
              <View className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded">
                <Text className="text-white text-xs font-semibold">
                  {video.duration}
                </Text>
              </View>
            </View>

            <View className="p-4">
              <Text
                className="text-lg font-bold text-gray-800 mb-1"
                numberOfLines={2}
              >
                {video.title}
              </Text>
              <Text className="text-gray-600 text-sm mb-1">
                {video.channel}
              </Text>
              <Text className="text-gray-500 text-xs">
                {video.views} views • {video.uploadDate}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default EducationalVideos;