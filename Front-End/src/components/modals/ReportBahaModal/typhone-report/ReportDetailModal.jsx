import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  Dimensions,
  Animated,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ImageGallery from './ImageGallery';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.85;

// Utility Functions
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'high':
      return { 
        bg: '#FEF2F2', 
        text: '#DC2626', 
        label: 'High',
        icon: 'warning',
        iconColor: '#DC2626'
      };
    case 'medium':
      return { 
        bg: '#FFFBEB', 
        text: '#D97706', 
        label: 'Medium',
        icon: 'warning',
        iconColor: '#D97706'
      };
    case 'low':
      return { 
        bg: '#F0FDF4', 
        text: '#16A34A', 
        label: 'Low',
        icon: 'check-circle',
        iconColor: '#16A34A'
      };
    default:
      return { 
        bg: '#F3F4F6', 
        text: '#6B7280', 
        label: 'Unknown',
        icon: 'help-outline',
        iconColor: '#6B7280'
      };
  }
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return { 
        bg: '#FEF3C7', 
        text: '#D97706', 
        icon: 'pending',
        iconColor: '#D97706'
      };
    case 'in-progress':
      return { 
        bg: '#DBEAFE', 
        text: '#2563EB', 
        icon: 'build',
        iconColor: '#2563EB'
      };
    case 'completed':
      return { 
        bg: '#D1FAE5', 
        text: '#059669', 
        icon: 'check-circle',
        iconColor: '#059669'
      };
    case 'verified':
      return { 
        bg: '#E0E7FF', 
        text: '#4F46E5', 
        icon: 'verified',
        iconColor: '#4F46E5'
      };
    default:
      return { 
        bg: '#F3F4F6', 
        text: '#6B7280', 
        icon: 'help-outline',
        iconColor: '#6B7280'
      };
  }
};

const getDamageTypeIcon = (damageType) => {
  switch (damageType?.toLowerCase()) {
    case 'roof_damage':
      return { icon: 'roofing', color: '#DC2626' };
    case 'foundation':
      return { icon: 'foundation', color: '#7C3AED' };
    case 'wall_damage':
      return { icon: 'wallpaper', color: '#EA580C' };
    case 'flood':
      return { icon: 'water-damage', color: '#0284C7' };
    default:
      return { icon: 'home-repair-service', color: '#6B7280' };
  }
};

// Materials Used Component
const MaterialsUsedSection = React.memo(({ materials }) => {
  const totalCost = useMemo(() => 
    materials.reduce((sum, material) => sum + (material.cost || 0), 0),
    [materials]
  );

  if (!materials || materials.length === 0) {
    return (
      <View className="mb-6">
        <Text className="text-lg font-bold text-gray-900 mb-3 flex-row items-center">
          <MaterialIcons name="construction" size={20} color="#6B7280" />
          <Text className="ml-2">Materials Used</Text>
        </Text>
        <View className="bg-gray-50 p-5 rounded-xl border border-gray-100">
          <View className="flex-row items-center justify-center">
            <MaterialIcons name="inventory" size={24} color="#9CA3AF" />
            <Text className="ml-2 text-gray-500">No materials recorded</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-6">
      <Text className="text-lg font-bold text-gray-900 mb-3 flex-row items-center">
        <MaterialIcons name="construction" size={20} color="#6B7280" />
        <Text className="ml-2">Materials Used</Text>
      </Text>
      
      <View className="space-y-3">
        {materials.map((material, index) => (
          <View
            key={material._id || index}
            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <View className="flex-row items-center">
                  <MaterialIcons name="inventory" size={18} color="#4B5563" />
                  <Text className="ml-2 text-base font-semibold text-gray-900">
                    {material.name}
                  </Text>
                </View>
                <View className="ml-7 mt-2">
                  <View className="flex-row items-center">
                    <MaterialIcons name="format-list-numbered" size={14} color="#6B7280" />
                    <Text className="ml-2 text-sm text-gray-600">
                      Quantity: {material.quantity} {material.unit}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View className="bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-2 rounded-lg border border-blue-200">
                <Text className="text-base font-bold text-blue-700">
                  {formatCurrency(material.cost)}
                </Text>
              </View>
            </View>
            
            <View className="mt-3 pt-3 border-t border-gray-100">
              <View className="flex-row justify-between">
                <View className="flex-row items-center">
                  <MaterialIcons name="calculate" size={14} color="#059669" />
                  <Text className="ml-2 text-xs text-gray-500">
                    Unit Cost: {formatCurrency(material.cost / material.quantity)}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <MaterialIcons name="category" size={14} color="#8B5CF6" />
                  <Text className="ml-1 text-xs text-gray-500">
                    {material.category || 'Construction Material'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
        
        {/* Total Cost */}
        <View className="bg-gradient-to-r from-gray-900 to-gray-800 p-5 rounded-xl border border-gray-700">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <MaterialIcons name="calculate" size={24} color="white" />
              <Text className="ml-3 text-lg font-bold text-white">
                Total Cost
              </Text>
            </View>
            <View className="bg-white px-4 py-3 rounded-lg border border-gray-200">
              <Text className="text-xl font-bold text-green-700">
                {formatCurrency(totalCost)}
              </Text>
            </View>
          </View>
          <View className="mt-3 pt-3 border-t border-gray-700">
            <Text className="text-gray-300 text-sm">
              Total of {materials.length} material{materials.length > 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});

// Report Detail Modal
const ReportDetailModal = React.memo(({ visible, report, onClose }) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 70,
          friction: 12,
        }),
      ]).start(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      });
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
      backdropAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  }, [onClose]);

  if (!report) return null;

  const severity = getSeverityColor(report.severity);
  const status = getStatusColor(report.reportStatus);
  const damageType = getDamageTypeIcon(report.damageType);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      
      <View className="flex-1">
        <Animated.View
          className="absolute inset-0 bg-black"
          style={{ opacity: backdropAnim }}
        >
          <TouchableOpacity 
            className="flex-1" 
            activeOpacity={1} 
            onPress={handleClose} 
          />
        </Animated.View>

        <Animated.View
          className="absolute bottom-0 w-full bg-white"
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
              height: MODAL_HEIGHT,
            },
          ]}
        >
          {/* Header */}
          <View className="px-6 py-4 border-b border-gray-200">
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900">Damage Report</Text>
                <View className="flex-row items-center mt-1">
                  <MaterialIcons name="fingerprint" size={16} color="#6B7280" />
                  <Text className="ml-2 text-sm text-gray-500">{report.reportId}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                className="p-2 rounded-full bg-gray-100"
              >
                <MaterialIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            ref={scrollViewRef}
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          >
            <View className="p-6">
              {/* Basic Info Card */}
              <View className="mb-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200">
                <Text className="text-lg font-bold text-gray-900 mb-4 flex-row items-center">
                  <MaterialIcons name="info" size={20} color="#4B5563" />
                  <Text className="ml-2">Basic Information</Text>
                </Text>
                
                <View className="space-y-4">
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-sm text-gray-500">Typhoon Name</Text>
                      <View className="flex-row items-center mt-1">
                        <MaterialIcons name="storm" size={18} color="#3B82F6" />
                        <Text className="ml-2 text-base font-semibold text-gray-900">
                          {report.typhoonName}
                        </Text>
                      </View>
                    </View>
                    
                    <View>
                      <Text className="text-sm text-gray-500 text-right">Severity</Text>
                      <View
                        className="px-4 py-2 rounded-full mt-1 flex-row items-center"
                        style={{ backgroundColor: severity.bg }}
                      >
                        <MaterialIcons name={severity.icon} size={14} color={severity.text} />
                        <Text
                          className="font-bold ml-1"
                          style={{ color: severity.text }}
                        >
                          {severity.label}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-sm text-gray-500">Damage Type</Text>
                      <View className="flex-row items-center mt-1">
                        <MaterialIcons name={damageType.icon} size={18} color={damageType.color} />
                        <Text className="ml-2 text-base font-medium text-gray-900 capitalize">
                          {report.damageTypeLabel || report.damageType.replace('_', ' ')}
                        </Text>
                      </View>
                    </View>
                    
                    <View>
                      <Text className="text-sm text-gray-500 text-right">Post Type</Text>
                      <View className="flex-row items-center justify-end mt-1">
                        <MaterialIcons
                          name={report.statusPost === 'before' ? 'warning' : 'check-circle'}
                          size={18}
                          color={report.statusPost === 'before' ? '#DC2626' : '#059669'}
                        />
                        <Text className="ml-2 text-sm font-medium text-gray-900 capitalize">
                          {report.statusPost}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-sm text-gray-500">Report Status</Text>
                      <View className="flex-row items-center mt-1">
                        <MaterialIcons name={status.icon} size={18} color={status.text} />
                        <Text
                          className="ml-2 text-sm font-medium"
                          style={{ color: status.text }}
                        >
                          {report.reportStatus}
                        </Text>
                      </View>
                    </View>
                    
                    <View className="flex-row items-center">
                      <MaterialIcons name="person" size={16} color="#6B7280" />
                      <Text className="ml-2 text-sm text-gray-600">
                        {report.submitted ? 'Submitted' : 'Anonymous'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Image Galleries */}
              <ImageGallery
                title="📸 Before Typhoon Photos"
                images={report.beforeMedia}
                emptyMessage="No before photos available"
              />

              <ImageGallery
                title="🛠️ After Repair Photos"
                images={report.afterMedia}
                emptyMessage="No after photos available"
              />

              {/* Materials Used */}
              <MaterialsUsedSection materials={report.materialsUsed} />

              {/* Location Details */}
              <View className="mb-6">
                <Text className="text-lg font-bold text-gray-900 mb-3 flex-row items-center">
                  <MaterialIcons name="location-on" size={20} color="#6B7280" />
                  <Text className="ml-2">Location Details</Text>
                </Text>
                
                <View className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <View className="flex-row items-start mb-3">
                    <MaterialIcons name="place" size={20} color="#EF4444" />
                    <View className="ml-3 flex-1">
                      <Text className="text-sm text-gray-500 mb-1">Address</Text>
                      <Text className="text-base text-gray-900">{report.address}</Text>
                    </View>
                  </View>
                  
                  {report.description && report.description !== "No description" && (
                    <View className="flex-row items-start mt-3">
                      <MaterialIcons name="description" size={20} color="#8B5CF6" />
                      <View className="ml-3 flex-1">
                        <Text className="text-sm text-gray-500 mb-1">Description</Text>
                        <Text className="text-base text-gray-900">{report.description}</Text>
                      </View>
                    </View>
                  )}
                  
                  <View className="flex-row items-center mt-4 pt-3 border-t border-gray-200">
                    <MaterialIcons name="computer" size={16} color="#6B7280" />
                    <Text className="ml-2 text-sm text-gray-600">
                      IP: {report.location?.ipAddress || 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Timestamps */}
              <View className="mb-6">
                <Text className="text-lg font-bold text-gray-900 mb-3 flex-row items-center">
                  <MaterialIcons name="schedule" size={20} color="#6B7280" />
                  <Text className="ml-2">Timestamps</Text>
                </Text>
                
                <View className="space-y-3">
                  <View className="flex-row justify-between items-center bg-gray-50 p-4 rounded-xl">
                    <View className="flex-row items-center">
                      <MaterialIcons name="add-circle" size={18} color="#059669" />
                      <Text className="ml-2 text-sm text-gray-600">Created</Text>
                    </View>
                    <Text className="text-sm font-medium text-gray-900">
                      {formatDate(report.createdAt)}
                    </Text>
                  </View>
                  
                  <View className="flex-row justify-between items-center bg-gray-50 p-4 rounded-xl">
                    <View className="flex-row items-center">
                      <MaterialIcons name="update" size={18} color="#3B82F6" />
                      <Text className="ml-2 text-sm text-gray-600">Updated</Text>
                    </View>
                    <Text className="text-sm font-medium text-gray-900">
                      {formatDate(report.updatedAt)}
                    </Text>
                  </View>
                  
                  <View className="flex-row justify-between items-center bg-gray-50 p-4 rounded-xl">
                    <View className="flex-row items-center">
                      <MaterialIcons name="event" size={18} color="#8B5CF6" />
                      <Text className="ml-2 text-sm text-gray-600">Incident</Text>
                    </View>
                    <Text className="text-sm font-medium text-gray-900">
                      {formatDate(report.timestamp)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Additional Info */}
              <View className="flex-row space-x-3">
                {report.stillOccupied && (
                  <View className="flex-1 bg-red-50 p-4 rounded-xl border border-red-100">
                    <View className="flex-row items-center">
                      <MaterialIcons name="home" size={18} color="#DC2626" />
                      <Text className="ml-2 text-sm font-medium text-red-700">
                        Still Occupied
                      </Text>
                    </View>
                  </View>
                )}
                
                {report.emergencyNeeded && (
                  <View className="flex-1 bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <View className="flex-row items-center">
                      <MaterialIcons name="emergency" size={18} color="#D97706" />
                      <Text className="ml-2 text-sm font-medium text-amber-700">
                        Emergency Needed
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
});

export default ReportDetailModal;