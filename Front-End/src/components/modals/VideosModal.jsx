import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const VideosModal = ({
  visible,
  onClose,
  educationalVideos,
  handleVideoPress,
}) => {
  const videos = educationalVideos || [];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl h-4/5">
          <View className="flex-row justify-between items-center p-6 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-800">
              All Educational Videos
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            <View className="space-y-4">
              {videos.map((video) => (
                <TouchableOpacity
                  key={video.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                  onPress={() => handleVideoPress(video)}
                >
                  <View className="flex-row">
                    <View className="relative">
                      <Image
                        source={video.thumbnail}
                        className="w-32 h-24"
                        resizeMode="cover"
                      />
                      <View className="absolute inset-0 bg-black opacity-10" />
                      <View className="absolute inset-0 items-center justify-center">
                        <View className="w-10 h-10 bg-white rounded-full items-center justify-center opacity-90">
                          <Ionicons name="play" size={20} color="#3B82F6" />
                        </View>
                      </View>
                      <View className="absolute bottom-1 right-1 bg-black bg-opacity-70 px-1 py-0.5 rounded">
                        <Text className="text-white text-xs font-semibold">
                          {video.duration}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-1 p-3">
                      <Text
                        className="text-base font-bold text-gray-800 mb-1"
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
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default VideosModal;