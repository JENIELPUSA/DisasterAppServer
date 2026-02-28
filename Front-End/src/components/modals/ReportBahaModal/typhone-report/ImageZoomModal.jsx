import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const ImageZoomModal = React.memo(({ visible, images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [isZoomed, setIsZoomed] = useState(false);
  const lastTap = useRef(null);

  // Reset zoom and position when modal opens/closes or image changes
  useEffect(() => {
    if (visible) {
      scale.setValue(1);
      translateX.setValue(0);
      translateY.setValue(0);
      setIsZoomed(false);
    }
  }, [visible, currentIndex]);

  // Pan responder for zoom and pan
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return isZoomed || Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (isZoomed) {
          translateX.setValue(gestureState.dx);
          translateY.setValue(gestureState.dy);
        } else {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (isZoomed) {
          Animated.spring(translateX, {
            toValue: gestureState.dx,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
          Animated.spring(translateY, {
            toValue: gestureState.dy,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
        } else {
          if (gestureState.dx > 100 && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
          } else if (gestureState.dx < -100 && currentIndex < images.length - 1) {
            setCurrentIndex(currentIndex + 1);
          }
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Double tap to zoom
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    
    if (lastTap.current && (now - lastTap.current) < DOUBLE_PRESS_DELAY) {
      if (!isZoomed) {
        Animated.spring(scale, {
          toValue: 2,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
        setIsZoomed(true);
      } else {
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        setIsZoomed(false);
      }
    } else {
      lastTap.current = now;
    }
  };

  const handleSwipeLeft = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSwipeRight = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!visible || !images || images.length === 0) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <View className="flex-1 bg-black">
        {/* Close Button */}
        <TouchableOpacity 
          className="absolute top-14 right-5 z-10 p-3 bg-black/30 rounded-full"
          onPress={onClose}
        >
          <MaterialIcons name="close" size={24} color="white" />
        </TouchableOpacity>

        {/* Image Counter */}
        <View className="absolute top-14 left-0 right-0 z-10 items-center">
          <View className="bg-black/50 px-4 py-2 rounded-full">
            <Text className="text-white text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </Text>
          </View>
        </View>

        {/* Main Image Container */}
        <View className="flex-1 justify-center items-center">
          <Animated.View
            style={{
              transform: [
                { scale: scale },
                { translateX: translateX },
                { translateY: translateY },
              ],
            }}
            {...panResponder.panHandlers}
          >
            <TouchableOpacity activeOpacity={1} onPress={handleDoubleTap}>
              <Image
                source={{ uri: images[currentIndex]?.uri }}
                style={{
                  width: SCREEN_WIDTH,
                  height: SCREEN_WIDTH,
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            {currentIndex > 0 && (
              <TouchableOpacity
                className="absolute left-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30"
                onPress={handleSwipeRight}
              >
                <MaterialIcons name="chevron-left" size={28} color="white" />
              </TouchableOpacity>
            )}
            {currentIndex < images.length - 1 && (
              <TouchableOpacity
                className="absolute right-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30"
                onPress={handleSwipeLeft}
              >
                <MaterialIcons name="chevron-right" size={28} color="white" />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <View className="absolute bottom-5 left-0 right-0">
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="px-5"
              contentContainerStyle={{ paddingHorizontal: 5 }}
            >
              {images.map((img, index) => (
                <TouchableOpacity
                  key={img._id || index}
                  className={`mr-3 rounded-lg overflow-hidden border-2 ${currentIndex === index ? 'border-white' : 'border-transparent'}`}
                  onPress={() => setCurrentIndex(index)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: img.uri }}
                    className="w-16 h-16"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
});

export default ImageZoomModal;