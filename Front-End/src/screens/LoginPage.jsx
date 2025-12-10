import React, { useState, useRef, useContext, useEffect } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
} from "react-native";
import CarouselSlide from "../components/Carousels/CarouselSlide";
import DotIndicator from "../components/Carousels/DotIndicator";
import NavigationButtons from "../components/Carousels/NavigationButton";
import LoginForm from "../components/LoginForm";
import { AuthContext } from "../contexts/AuthContext";
import LoadingOverlay from "../ReusableComponent/LoadingOverlay";

export default function LoginPage({ navigation }) {
  const { login, signup, checkEmailAvailability } = useContext(AuthContext); // Added signup and checkEmailAvailability

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  const scrollViewRef = useRef(null);
  const screenWidth = 360;

  const handleLogin = async () => {
    if (!email || !password) return;
    setIsLoading(true);
    setSeconds(0);

    const timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);

    try {
      await login(email, password);
    } finally {
      clearInterval(timer);
      setIsLoading(false);
    }
  };

  const carouselSlides = [
    {
      id: 1,
      title: "Welcome to Sagip Bayan",
      description:
        "Your reliable disaster management companion. Stay informed and prepared with real-time emergency alerts and life-saving information.",
      image: require("../../assets/sagip1.png"),
      gradientColors: ["#667eea", "#FC563C"],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 1, y: 1 },
      textColor: "#fff",
    },
    {
      id: 2,
      title: "Real-Time Emergency Alerts",
      description:
        "Receive instant notifications about disasters, weather warnings, evacuation notices, and emergency updates in your area.",
      image: require("../../assets/sagip2.png"),
      gradientColors: ["#f093fb", "#FC563C"],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 1, y: 1 },
      textColor: "#fff",
    },
    {
      id: 3,
      title: "Emergency Resources & Assistance",
      description:
        "Access vital resources, evacuation routes, emergency contacts, and relief assistance when you need it most.",
      image: require("../../assets/sagip3.png"),
      gradientColors: ["#4facfe", "#FC563C"],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 1, y: 1 },
      textColor: "#fff",
    },
    {
      id: 4,
      title: "Road Status Updates",
      description:
        "Stay informed with real-time road conditions. See which routes are passable or not to ensure safer and faster travel during emergencies.",
      image: require("../../assets/sagip5.png"),
      gradientColors: ["#4facfe", "#FC563C"],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 1, y: 1 },
      textColor: "#fff",
    },
  ];

  const loginSlide = {
    id: 4,
    title: "Let's Get Started!",
    description: "...",
    image: require("../../assets/SagipLogo.png"),
    gradientColors: ["#fff", "#fff"],
    gradientStart: { x: 0, y: 0 },
    gradientEnd: { x: 1, y: 1 },
    textColor: "#1F2937",
  };

  const goToSlide = (index) => {
    scrollViewRef.current?.scrollTo({ x: index * screenWidth, animated: true });
    setCurrentSlide(index);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar
        barStyle={
          currentSlide === carouselSlides.length
            ? "dark-content"
            : "light-content"
        }
      />

      {currentSlide < carouselSlides.length ? (
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          {carouselSlides.map((slide) => (
            <CarouselSlide key={slide.id} slide={slide} />
          ))}
        </ScrollView>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleLogin={handleLogin}
            isLoading={isLoading}
            slide={loginSlide}
            signup={signup} // PASS THE SIGNUP FUNCTION
            checkEmailAvailability={checkEmailAvailability} // PASS EMAIL CHECK FUNCTION
            navigation={navigation} // PASS NAVIGATION FOR REDIRECTS
          />
        </KeyboardAvoidingView>
      )}

      {isLoading && (
        <LoadingOverlay>
          <Text style={{ color: "#fff", fontSize: 16, marginTop: 10 }}>
            Logging in... {seconds}s
          </Text>
        </LoadingOverlay>
      )}

      <DotIndicator
        currentSlide={currentSlide}
        totalSlides={carouselSlides.length + 1}
        onDotPress={goToSlide}
      />
      <NavigationButtons
        currentSlide={currentSlide}
        totalSlides={carouselSlides.length + 1}
        onSkip={() => goToSlide(carouselSlides.length)}
        onNext={() => goToSlide(currentSlide + 1)}
      />
    </View>
  );
}