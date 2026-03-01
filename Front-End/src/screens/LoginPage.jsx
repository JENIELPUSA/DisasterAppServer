import React, { useState, useRef, useContext, useEffect } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  useWindowDimensions,
} from "react-native";
import CarouselSlide from "../components/Carousels/CarouselSlide";
import DotIndicator from "../components/Carousels/DotIndicator";
import NavigationButtons from "../components/Carousels/NavigationButton";
import LoginForm from "../components/LoginForm";
import { AuthContext } from "../contexts/AuthContext";
import { HouseholdContext } from "../contexts/HouseholdLeadContext/HouseholdContext";
import LoadingOverlay from "../ReusableComponent/LoadingOverlay";
import { BarangayDisplayContext } from "../contexts/BrgyContext/BarangayContext";
import { MunicipalityContext } from "../contexts/MunicipalityContext/MunicipalityContext";
import StatusModal from "../components/modals/SuccessFailed/SuccessFailedModal";

export default function LoginPage({ navigation }) {
  // Screen size adjustment
  const { width: screenWidth } = useWindowDimensions();

  // Contexts
  const { isBarangaysDropdown } = useContext(BarangayDisplayContext);
  
  // Kinuha ang isLoading at login function mula sa AuthContext
  const { login, signup, checkEmailAvailability, isLoading } = useContext(AuthContext);
  
  const { DropdowndataLead, fetchDropdownAllLead } = useContext(HouseholdContext);
  const { municipalities } = useContext(MunicipalityContext);

  // States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef(null);

  const [statusVisible, setStatusVisible] = useState(false);
  const [statusType, setStatusType] = useState("success");
  const [statusMessage, setStatusMessage] = useState("");

  // Timer Effect: Awtomatikong magbibilang kapag ang isLoading sa Context ay naging TRUE
  useEffect(() => {
    let timer;
    if (isLoading) {
      setSeconds(0);
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer); // Cleanup pagka-unmount o paghinto ng loading
  }, [isLoading]);

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
    id: 5,
    title: "Let's Get Started!",
    description: "Please sign in to your account to continue.",
    image: require("../../assets/SagipLogo.png"),
    gradientColors: ["#fff", "#fff"],
    gradientStart: { x: 0, y: 0 },
    gradientEnd: { x: 1, y: 1 },
    textColor: "#1F2937",
  };

  const handleLogin = async () => {
    if (!email || !password) return;

    try {
      // Tatawagin ang login mula sa context. 
      // Ang context na ang bahala mag-set ng isLoading(true) at isLoading(false)
      const result = await login(email, password);
      
      if (result.success) {
        setStatusType("success");
        setStatusMessage("Login Successful!");
        setTimeout(() => setStatusVisible(true), 500);
      } else {
        setStatusType("error");
        setStatusMessage(result.error || "❌ Invalid credentials.");
        setStatusVisible(true);
      }
    } catch (error) {
      console.error("Login Error:", error);
      setStatusType("error");
      setStatusMessage("An unexpected error occurred.");
      setStatusVisible(true);
    }
  };

  const goToSlide = (index) => {
    scrollViewRef.current?.scrollTo({ x: index * screenWidth, animated: true });
    setCurrentSlide(index);
  };

  const handleScroll = (event) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / screenWidth);
    if (index !== currentSlide) {
      setCurrentSlide(index);
    }
  };

  const isLastSlide = currentSlide === carouselSlides.length;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle={isLastSlide ? "dark-content" : "light-content"} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
        >
          {/* CAROUSEL PAGES */}
          {carouselSlides.map((slide) => (
            <View key={slide.id} style={{ width: screenWidth }}>
              <CarouselSlide slide={slide} />
            </View>
          ))}

          {/* LOGIN PAGE */}
          <View style={{ width: screenWidth }}>
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              handleLogin={handleLogin}
              fetchHouseholdLeadsForDropdown={fetchDropdownAllLead}
              isloading={isLoading} // Pinapasa ang isLoading state mula sa Context
              DropdowndataLead={DropdowndataLead}
              BarangaysDropdownData={isBarangaysDropdown}
              slide={loginSlide}
              signup={signup}
              checkEmailAvailability={checkEmailAvailability}
              navigation={navigation}
              municipalities={municipalities}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* NAVIGATION CONTROLS */}
      {!isLastSlide && (
        <>
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
        </>
      )}

      {/* OVERLAYS & MODALS */}
      {/* Gagamitin ang isLoading mula sa Context para ipakita ang overlay */}
      {isLoading && (
        <LoadingOverlay>
          <Text style={{ color: "#fff", fontSize: 16, marginTop: 10 }}>
            Logging in... {seconds}s
          </Text>
        </LoadingOverlay>
      )}

      <StatusModal
        visible={statusVisible}
        type={statusType}
        message={statusMessage}
        onClose={() => setStatusVisible(false)}
      />
    </View>
  );
}