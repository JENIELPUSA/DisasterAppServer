import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";

const Carousel = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselItems = data || [];
  const screenWidth = Dimensions.get("window").width;

  const scrollRef = useRef(null);

  // CARD WIDTH (90% of screen)
  const cardWidth = screenWidth * 0.9;
  const sidePadding = (screenWidth - cardWidth) / 2; // center alignment

  // AUTO SLIDE
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex =
        currentIndex === carouselItems.length - 1 ? 0 : currentIndex + 1;

      scrollRef.current?.scrollTo({
        x: nextIndex * cardWidth,
        animated: true,
      });

      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <View className="mb-6">
      <Text className="text-xl font-bold text-gray-800 mb-4 px-5">
        Disaster Preparedness Tips
      </Text>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={cardWidth}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: sidePadding, // THIS MAKES CARDS CENTER
        }}
        onScroll={(event) => {
          const contentOffset = event.nativeEvent.contentOffset.x;
          const newIndex = Math.round(contentOffset / cardWidth);
          setCurrentIndex(newIndex);
        }}
        scrollEventThrottle={16}
      >
        {carouselItems.map((item, index) => (
          <View
            key={item.id || index}
            style={{ width: cardWidth, marginRight: 16 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100"
          >
            <Image
              source={item.image}
              className="w-full h-48 rounded-t-2xl"
              resizeMode="cover"
            />

            <View className="p-4">
              <Text className="text-lg font-bold text-gray-800 mb-2">
                {item.title}
              </Text>
              <Text className="text-gray-600 text-sm">
                {item.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Indicators */}
      <View className="flex-row justify-center mt-4">
        {carouselItems.map((_, index) => (
          <View
            key={index}
            className={`w-2 h-2 rounded-full mx-1 ${
              index === currentIndex ? "bg-blue-600" : "bg-gray-300"
            }`}
          />
        ))}
      </View>
    </View>
  );
};

export default Carousel;
