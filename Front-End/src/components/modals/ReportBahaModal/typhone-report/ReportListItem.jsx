import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

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

const ReportListItem = React.memo(({ item, onPress }) => {
  const severity = getSeverityColor(item.severity);
  const hasMaterials = item.materialsUsed && item.materialsUsed.length > 0;
  const hasPhotos = (item.beforeMedia?.length > 0) || (item.afterMedia?.length > 0);
  const damageType = getDamageTypeIcon(item.damageType);

  return (
    <TouchableOpacity
      className="mx-5 my-2 bg-white rounded-xl shadow-sm border border-gray-100"
      activeOpacity={0.7}
      onPress={() => onPress(item)}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View className="p-4">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <MaterialIcons name="storm" size={18} color="#4B5563" />
              <Text className="ml-2 text-lg font-bold text-gray-900">
                Typhoon {item.typhoonName}
              </Text>
            </View>
            <View className="flex-row items-center">
              <MaterialIcons name="location-on" size={14} color="#9CA3AF" />
              <Text className="ml-1 text-sm text-gray-600 flex-1" numberOfLines={1}>
                {item.address || "No address provided"}
              </Text>
            </View>
          </View>
          
          <View className="items-end">
            <View
              className="px-3 py-1.5 rounded-full flex-row items-center"
              style={{ backgroundColor: severity.bg }}
            >
              <MaterialIcons name={severity.icon} size={14} color={severity.text} />
              <Text
                className="text-xs font-bold ml-1"
                style={{ color: severity.text }}
              >
                {severity.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Details Row */}
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center space-x-4">
            {/* Damage Type */}
            <View className="flex-row items-center">
              <MaterialIcons name={damageType.icon} size={14} color={damageType.color} />
              <Text className="ml-1 text-xs text-gray-500 capitalize">
                {item.damageType.replace('_', ' ')}
              </Text>
            </View>

            {/* Date */}
            <View className="flex-row items-center">
              <MaterialIcons name="access-time" size={14} color="#9CA3AF" />
              <Text className="ml-1 text-xs text-gray-500">
                {formatDate(item.createdAt)}
              </Text>
            </View>
          </View>

          {/* Icons */}
          <View className="flex-row items-center space-x-2">
            {hasMaterials && (
              <View className="flex-row items-center bg-green-50 px-2 py-1 rounded">
                <MaterialIcons name="construction" size={14} color="#10B981" />
                <Text className="text-xs text-green-700 ml-1 font-medium">
                  {item.materialsUsed.length}
                </Text>
              </View>
            )}
            {hasPhotos && (
              <View className="flex-row items-center bg-blue-50 px-2 py-1 rounded">
                <MaterialIcons name="photo-library" size={14} color="#3B82F6" />
                <Text className="text-xs text-blue-700 ml-1 font-medium">
                  {(item.beforeMedia?.length || 0) + (item.afterMedia?.length || 0)}
                </Text>
              </View>
            )}
            <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default ReportListItem;