import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ImageZoomModal from './ImageZoomModal';

const ImageGallery = React.memo(({ title, images, emptyMessage }) => {
  const [zoomModalVisible, setZoomModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const openImageZoom = useCallback((index) => {
    setSelectedImageIndex(index);
    setZoomModalVisible(true);
  }, []);

  // Facebook-style grid display logic
  const renderGrid = () => {
    const totalImages = images.length;
    
    // For 1 image - full width
    if (totalImages === 1) {
      return (
        <TouchableOpacity onPress={() => openImageZoom(0)}>
          <Image
            source={{ uri: images[0].uri }}
            style={styles.singleImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }
    
    // For 2 images - side by side
    if (totalImages === 2) {
      return (
        <View style={styles.twoImageContainer}>
          <TouchableOpacity 
            style={styles.twoImageItem}
            onPress={() => openImageZoom(0)}
          >
            <Image
              source={{ uri: images[0].uri }}
              style={styles.twoImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.twoImageItem}
            onPress={() => openImageZoom(1)}
          >
            <Image
              source={{ uri: images[1].uri }}
              style={styles.twoImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      );
    }
    
    // For 3 images - one big, two small
    if (totalImages === 3) {
      return (
        <View style={styles.threeImageContainer}>
          <TouchableOpacity 
            style={styles.threeImageMain}
            onPress={() => openImageZoom(0)}
          >
            <Image
              source={{ uri: images[0].uri }}
              style={styles.threeImageMain}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <View style={styles.threeImageSide}>
            <TouchableOpacity 
              style={styles.threeImageSmall}
              onPress={() => openImageZoom(1)}
            >
              <Image
                source={{ uri: images[1].uri }}
                style={styles.threeImageSmall}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.threeImageSmall}
              onPress={() => openImageZoom(2)}
            >
              <Image
                source={{ uri: images[2].uri }}
                style={styles.threeImageSmall}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    // For 4 images - 2x2 grid
    if (totalImages === 4) {
      return (
        <View style={styles.fourImageContainer}>
          {[0, 1, 2, 3].map((index) => (
            <TouchableOpacity 
              key={index}
              style={styles.fourImageItem}
              onPress={() => openImageZoom(index)}
            >
              <Image
                source={{ uri: images[index].uri }}
                style={styles.fourImage}
                resizeMode="cover"
              />
              {index === 3 && totalImages > 4 && (
                <View style={styles.moreOverlay}>
                  <Text style={styles.moreText}>+{totalImages - 4}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      );
    }
    
    // For 5+ images - show first 4 with overlay
    return (
      <View style={styles.fourImageContainer}>
        {[0, 1, 2, 3].map((index) => {
          if (index < 3) {
            return (
              <TouchableOpacity 
                key={index}
                style={styles.fourImageItem}
                onPress={() => openImageZoom(index)}
              >
                <Image
                  source={{ uri: images[index].uri }}
                  style={styles.fourImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            );
          }
          
          // Last grid item shows remaining count
          return (
            <TouchableOpacity 
              key={index}
              style={styles.fourImageItem}
              onPress={() => openImageZoom(3)}
            >
              <Image
                source={{ uri: images[3].uri }}
                style={styles.fourImage}
                resizeMode="cover"
              />
              <View style={styles.moreOverlay}>
                <Text style={styles.moreText}>+{totalImages - 3}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  if (!images || images.length === 0) {
    return (
      <View className="mb-6">
        <Text className="text-lg font-bold text-gray-900 mb-3 flex-row items-center">
          <MaterialIcons 
            name={title.includes('Before') ? 'photo-camera' : 'photo-library'} 
            size={20} 
            color="#6B7280" 
          />
          <Text className="ml-2">{title}</Text>
        </Text>
        <View className="bg-gray-50 p-6 rounded-xl border border-gray-100">
          <View className="items-center">
            <MaterialIcons name="no-photography" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-3 text-center">{emptyMessage}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <>
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-gray-900 flex-row items-center">
            <MaterialIcons 
              name={title.includes('Before') ? 'photo-camera' : 'photo-library'} 
              size={20} 
              color="#6B7280" 
            />
            <Text className="ml-2">{title}</Text>
          </Text>
          
          <View className="bg-gray-100 px-3 py-1 rounded-full">
            <Text className="text-gray-600 text-sm font-medium">
              {images.length} {images.length === 1 ? 'Photo' : 'Photos'}
            </Text>
          </View>
        </View>

        {/* Facebook-style Grid */}
        <View style={styles.gridContainer}>
          {renderGrid()}
        </View>

        {/* See All Photos Button - appears when there are more than 1 image */}
        {images.length > 1 && (
          <TouchableOpacity
            className="mt-3 bg-gray-50 py-2 rounded-lg border border-gray-200 items-center"
            activeOpacity={0.7}
            onPress={() => openImageZoom(0)}
          >
            <Text className="text-blue-500 font-semibold">
              See All Photos
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ImageZoomModal
        visible={zoomModalVisible}
        images={images}
        initialIndex={selectedImageIndex}
        onClose={() => setZoomModalVisible(false)}
      />
    </>
  );
});

// Styles for Facebook-like grid
const styles = StyleSheet.create({
  gridContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f2f5',
  },
  singleImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  twoImageContainer: {
    flexDirection: 'row',
    height: 200,
    gap: 2,
  },
  twoImageItem: {
    flex: 1,
  },
  twoImage: {
    width: '100%',
    height: '100%',
  },
  threeImageContainer: {
    flexDirection: 'row',
    height: 200,
    gap: 2,
  },
  threeImageMain: {
    flex: 2,
    height: '100%',
  },
  threeImageSide: {
    flex: 1,
    gap: 2,
  },
  threeImageSmall: {
    flex: 1,
    height: '50%',
  },
  fourImageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: 200,
  },
  fourImageItem: {
    width: '50%',
    height: '50%',
    padding: 1,
  },
  fourImage: {
    width: '100%',
    height: '100%',
  },
  moreOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ImageGallery;