import 'dotenv/config';

export default {
  expo: {
    name: "Sagip_Bayan_DisasterApp",
    slug: "Sagip_Bayan_DisasterApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.jenielpusa.sagipbayan", // <-- lowercase at walang underscores
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: "metro",
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      frontendUrl: process.env.FRONTEND_URL,
      eas: {
        projectId: "2a56cdc4-7c35-47f7-bbf0-71bcaf21aba9",
      },
    },
    plugins: [
      "expo-video"
    ],
  },
};
