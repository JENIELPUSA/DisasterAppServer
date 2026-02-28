import React from "react";
import { Modal, View, Image, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const ImageGalleryModal = ({ visible, images, currentIndex, onClose, onNext, onPrev }) => {
  if (!images || images.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" }}>
        <Image
          source={{ uri: images[currentIndex]?.uri }}
          style={{ width: width - 40, height: height / 2, resizeMode: "contain" }}
        />
        
        <TouchableOpacity
          onPress={onClose}
          style={{ position: "absolute", top: 50, right: 20, padding: 8, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 50 }}
        >
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>

        {currentIndex > 0 && (
          <TouchableOpacity style={{ position: "absolute", left: 20, top: "50%" }} onPress={onPrev}>
            <Ionicons name="chevron-back-circle" size={40} color="white" />
          </TouchableOpacity>
        )}

        {currentIndex < images.length - 1 && (
          <TouchableOpacity style={{ position: "absolute", right: 20, top: "50%" }} onPress={onNext}>
            <Ionicons name="chevron-forward-circle" size={40} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
};

export default ImageGalleryModal;