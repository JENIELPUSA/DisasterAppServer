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
import { HouseholdContext } from "../contexts/HouseholdLeadContext/HouseholdContext";
import LoadingOverlay from "../ReusableComponent/LoadingOverlay";
import { BarangayDisplayContext } from "../contexts/BrgyContext/BarangayContext";
import { MunicipalityContext } from "../contexts/MunicipalityContext/MunicipalityContext";
import StatusModal from "../components/modals/SuccessFailed/SuccessFailedModal";

export default function LoginPage({ navigation }) {
  const { isBarangaysDropdown } = useContext(BarangayDisplayContext);
  const { login, signup, checkEmailAvailability } = useContext(AuthContext);
  const { DropdowndataLead, fetchDropdownAllLead, loading } =
    useContext(HouseholdContext);

  const { municipalities } = useContext(MunicipalityContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef(null);
  const screenWidth = 360;

  const [statusVisible, setStatusVisible] = useState(false);
  const [statusType, setStatusType] = useState("success");
  const [statusMessage, setStatusMessage] = useState("");

  const handleLogin = async () => {
    if (!email || !password) return;
    setIsLoading(true);
    setSeconds(0);

    const timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);

    try {
      const result = await login(email, password);

      if (result.success) {
        setStatusType("success");
        setStatusMessage("✅ Your report has been successfully sent!");
        // Auto-reset after delay
        setTimeout(() => {
          setStatusVisible(true);
        }, 1000);
      } else {
        setStatusType("error");
        setStatusMessage(
          result.error || "❌ Sending was not successful."
        );
        setStatusVisible(true);
      }
    } finally {
      clearInterval(timer);
      setIsLoading(false);
    }
  };

  // Function para sa pag-close ng modal nang maayos
  const handleCloseModal = () => {
    setReportBahaModalVisible(false);
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
    id: 5,
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
            fetchHouseholdLeadsForDropdown={fetchDropdownAllLead}
            isloading={loading}
            DropdowndataLead={DropdowndataLead}
            BarangaysDropdownData={isBarangaysDropdown}
            slide={loginSlide}
            signup={signup}
            checkEmailAvailability={checkEmailAvailability}
            navigation={navigation}
            municipalities={municipalities}
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
      <StatusModal
        visible={statusVisible}
        type={statusType}
        message={statusMessage}
        onClose={() => {
          setStatusVisible(false);
          if (statusType === "success") {
            handleCloseModal();
          }
        }}
      />
    </View>
  );
}
