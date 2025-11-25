import React from "react";
import { View, TouchableOpacity, Dimensions, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Import your screens
import HomeStackScreen from "./src/screens/HomeStackScreen";
import MapsScreen from "./src/screens/MapsScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

// TabBarItem component WITHOUT Animated
const TabBarItem = ({ route, isFocused, descriptors, onPress, onLongPress, tabCount }) => {
  const { options } = descriptors[route.key];

  const tabConfig = {
    iconFocused: options.tabBarIconFocused || "help",
    iconUnfocused: options.tabBarIconUnfocused || "help-outline",
    gradient: options.tabBarGradient || ["#667eea", "#764ba2"],
    pulseColor: options.tabBarPulseColor || "rgba(102, 126, 234, 0.3)"
  };

  const iconName = isFocused ? tabConfig.iconFocused : tabConfig.iconUnfocused;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel || route.name}
      testID={options.tabBarTestID}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.tabItem, { width: `${100 / tabCount}%` }]}
      activeOpacity={0.8}
    >
      <View style={styles.tabContent}>
        {/* Pulse Effect removed */}
        <View style={styles.iconContainer}>
          {isFocused ? (
            <LinearGradient
              colors={tabConfig.gradient}
              style={styles.gradientIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name={iconName} size={26} color="white" />
            </LinearGradient>
          ) : (
            <View style={styles.regularIcon}>
              <Ionicons name={iconName} size={26} color="#666" />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// CustomTabBar without Animated
function CustomTabBar({ state, descriptors, navigation }) {
  const tabCount = state.routes.length;
  const tabWidth = (width - 40) / tabCount;

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBarBackground}>
        <View style={styles.blurOverlay} />
      </View>

      {/* Active Tab Indicator without animation */}
      <View
        style={[
          styles.activeIndicator,
          {
            width: tabWidth - 20,
            left: state.index * tabWidth + 10,
          },
        ]}
      />

      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TabBarItem
            key={route.key}
            route={route}
            isFocused={isFocused}
            descriptors={descriptors}
            onPress={onPress}
            onLongPress={onLongPress}
            tabCount={tabCount}
          />
        );
      })}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    overflow: 'hidden',
  },
  tabBarBackground: { ...StyleSheet.absoluteFillObject },
  blurOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.92)' },
  activeIndicator: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#667eea',
    bottom: 0,
    borderRadius: 2,
  },
  tabItem: { justifyContent: "center", alignItems: "center", height: '100%' },
  tabContent: { justifyContent: 'center', alignItems: 'center', height: '100%' },
  iconContainer: { justifyContent: 'center', alignItems: 'center' },
  gradientIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  regularIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
});

// Main Tabs Component
export default function MainTabs() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{ headerShown: false, unmountOnBlur: false, lazy: true }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tab.Screen
          name="Home"
          component={HomeStackScreen}
          options={{
            tabBarAccessibilityLabel: "Home",
            tabBarIconFocused: "home",
            tabBarIconUnfocused: "home-outline",
            tabBarGradient: ["#667eea", "#764ba2"],
            tabBarPulseColor: "rgba(102, 126, 234, 0.3)"
          }}
        />
        <Tab.Screen
          name="Maps"
          component={MapsScreen}
          options={{
            tabBarAccessibilityLabel: "Explore",
            tabBarIconFocused: "map",
            tabBarIconUnfocused: "map-outline",
            tabBarGradient: ["#4facfe", "#00f2fe"],
            tabBarPulseColor: "rgba(79, 172, 254, 0.3)"
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarAccessibilityLabel: "Settings",
            tabBarIconFocused: "settings",
            tabBarIconUnfocused: "settings-outline",
            tabBarGradient: ["#43e97b", "#38f9d7"],
            tabBarPulseColor: "rgba(67, 233, 123, 0.3)"
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarAccessibilityLabel: "Profile",
            tabBarIconFocused: "person",
            tabBarIconUnfocused: "person-outline",
            tabBarGradient: ["#ff9a9e", "#fecfef"],
            tabBarPulseColor: "rgba(255, 154, 158, 0.3)"
          }}
        />
      </Tab.Navigator>
    </View>
  );
}
