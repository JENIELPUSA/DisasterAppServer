import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CameraView, useCameraPermissions } from "expo-camera"; // Siguraduhing naka-install ang expo-camera
import { EvacuationDisplayContext } from "../../../contexts/EvacuationContext/EvacuationContext";
import { TrackingEvacuatesContext } from "../../../contexts/TrackingContext/TrackingContext";
import Svg, { Path } from "react-native-svg";

const { width } = Dimensions.get("window");
const SCANNER_SIZE = width * 0.75;

export default function Scanner({ visible, onClose }) {
  const { EvacuationsMunicipal, fetchEvacuationsInMunicipality } = useContext(
    EvacuationDisplayContext,
  );
  const { addTrackingEvacuates } = useContext(TrackingEvacuatesContext);

  const [scanned, setScanned] = useState(false);
  const [selectedEvac, setSelectedEvac] = useState(null);
  const [scanMode, setScanMode] = useState("check_in");
  const [isEvacDropdownOpen, setIsEvacDropdownOpen] = useState(false);
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  
  // FIX 1: Permission handling
  const [permission, requestPermission] = useCameraPermissions();
  const translateY = useRef(new Animated.Value(0)).current;

  // FIX 2: Request permission automatically when modal opens
  useEffect(() => {
    if (visible) {
      fetchEvacuationsInMunicipality();
      if (!permission?.granted) {
        requestPermission();
      }
    }
  }, [visible]);

  useEffect(() => {
    if (visible && !scanned && permission?.granted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: SCANNER_SIZE,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [visible, scanned, permission]);

  const handleBarcodeScanned = async ({ data }) => {
    if (!selectedEvac) {
      Alert.alert("Abiso", "Pumili muna ng Evacuation Center.");
      return;
    }

    // Iwasan ang multiple scans habang nagpo-process
    if (scanned) return;
    
    setScanned(true);

    const payload = {
      scanType: scanMode,
      userId: data,
      evacuationId: selectedEvac._id,
      municipality: selectedEvac.municipality,
    };

    try {
      await addTrackingEvacuates(payload);
      console.log("📤 PAYLOAD SENT:", payload);
    } catch (error) {
      Alert.alert("Error", "Hindi ma-record ang scan. Subukan muli.");
      setScanned(false);
    }
  };

  if (!visible) return null;

  // FIX 3: Check permission status before rendering camera
  if (!permission) return <View className="flex-1 bg-slate-950" />;
  if (!permission.granted) {
    return (
      <Modal visible={visible}>
        <View className="flex-1 bg-slate-950 justify-center items-center p-6">
          <Text className="text-white text-center mb-4">Kailangan ng access sa camera para makapag-scan.</Text>
          <TouchableOpacity 
            onPress={requestPermission}
            className="bg-blue-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-bold">I-ALLOW CAMERA</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} className="mt-4">
            <Text className="text-slate-400">Bumalik</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <View className="flex-1 bg-slate-950">
        {/* --- HEADER & DROPDOWNS --- */}
        <View className="absolute top-0 left-0 right-0 z-50">
          <LinearGradient
            colors={["#020617", "transparent"]}
            className="pt-12 pb-10 px-6"
          >
            <View className="flex-row justify-between items-center mb-5">
              <TouchableOpacity
                onPress={onClose}
                className="w-10 h-10 bg-white/10 rounded-full items-center justify-center border border-white/20"
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </Svg>
              </TouchableOpacity>
              <View className="items-center">
                <Text className="text-white font-black text-xl tracking-widest uppercase">Scanner</Text>
                <Text className="text-blue-400 text-[10px] font-bold tracking-[3px]">VERIFY ENTRY</Text>
              </View>
              <View className="w-10" />
            </View>

            <View className="flex-row gap-x-2">
              <View className="w-32">
                <TouchableOpacity
                  onPress={() => {
                    setIsModeDropdownOpen(!isModeDropdownOpen);
                    setIsEvacDropdownOpen(false);
                  }}
                  className={`border rounded-2xl p-3 flex-row justify-between items-center ${scanMode === "check_in" ? "bg-emerald-950/30 border-emerald-500/50" : "bg-rose-950/30 border-rose-500/50"}`}
                >
                  <Text className={`font-bold text-[10px] ${scanMode === "check_in" ? "text-emerald-400" : "text-rose-400"}`}>
                    {scanMode === "check_in" ? "CHECK-IN" : "CHECK-OUT"}
                  </Text>
                  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                    <Path d="M7 10l5 5 5-5" stroke={scanMode === "check_in" ? "#10b981" : "#f43f5e"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </TouchableOpacity>

                {isModeDropdownOpen && (
                  <View className="bg-slate-900 border border-slate-700 rounded-2xl mt-1 absolute top-12 left-0 right-0 shadow-2xl z-">
                    <TouchableOpacity onPress={() => { setScanMode("check_in"); setIsModeDropdownOpen(false); }} className="p-4 border-b border-slate-800">
                      <Text className="text-emerald-400 font-bold text-[10px]">CHECK-IN</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setScanMode("check_out"); setIsModeDropdownOpen(false); }} className="p-4">
                      <Text className="text-rose-400 font-bold text-[10px]">CHECK-OUT</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View className="flex-1">
                <TouchableOpacity
                  onPress={() => {
                    setIsEvacDropdownOpen(!isEvacDropdownOpen);
                    setIsModeDropdownOpen(false);
                  }}
                  className="bg-slate-900 border border-slate-700 rounded-2xl p-3 flex-row justify-between items-center"
                >
                  <View className="flex-1 mr-2">
                    <Text className="text-white font-bold text-[11px]" numberOfLines={1}>
                      {selectedEvac ? selectedEvac.evacuationName : "Select Location..."}
                    </Text>
                  </View>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path d="M7 10l5 5 5-5" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </TouchableOpacity>

                {isEvacDropdownOpen && (
                  <View className="bg-slate-900 border border-slate-700 rounded-2xl mt-1 absolute top-12 left-0 right-0 shadow-2xl z- max-h-60 overflow-hidden">
                    <ScrollView bounces={false}>
                      {EvacuationsMunicipal?.map((evac, index) => (
                        <TouchableOpacity
                          key={evac._id}
                          onPress={() => { setSelectedEvac(evac); setIsEvacDropdownOpen(false); }}
                          className={`p-4 border-b border-slate-800 active:bg-slate-800 ${index === EvacuationsMunicipal.length - 1 ? "border-b-0" : ""}`}
                        >
                          <Text className="text-white text-[12px] font-bold">{evac.evacuationName}</Text>
                          <Text className="text-slate-500 text-[10px] mt-1" numberOfLines={1}>📍 {evac.location.address}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* --- CAMERA & OVERLAY --- */}
        {!scanned ? (
          <View className="flex-1">
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              onBarcodeScanned={handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
            />
            {/* Custom Overlay (Laser line and Corners) */}
            <View className="absolute inset-0 flex-col justify-center items-center pointer-events-none" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
              <View style={{ width: SCANNER_SIZE, height: SCANNER_SIZE }}>
                 {/* Corners */}
                <View className={`absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 rounded-tl-3xl ${scanMode === "check_in" ? "border-emerald-500" : "border-rose-500"}`} />
                <View className={`absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 rounded-tr-3xl ${scanMode === "check_in" ? "border-emerald-500" : "border-rose-500"}`} />
                <View className={`absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 rounded-bl-3xl ${scanMode === "check_in" ? "border-emerald-500" : "border-rose-500"}`} />
                <View className={`absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 rounded-br-3xl ${scanMode === "check_in" ? "border-emerald-500" : "border-rose-500"}`} />
                {/* Laser Line */}
                <Animated.View
                  style={{ transform: [{ translateY }] }}
                  className={`w-full h-1 shadow-lg ${scanMode === "check_in" ? "bg-emerald-400 shadow-emerald-500" : "bg-rose-400 shadow-rose-500"}`}
                />
              </View>
              <Text className="text-white font-bold mt-12 tracking-widest uppercase opacity-80">
                Ready to {scanMode === "check_in" ? "Check-In" : "Check-Out"}
              </Text>
            </View>
          </View>
        ) : (
          /* --- RESULT CARD --- */
          <View className="flex-1 justify-center items-center px-6">
            <View className="w-full bg-slate-900 rounded-[40px] border border-slate-800 overflow-hidden shadow-2xl">
              <LinearGradient
                colors={scanMode === "check_in" ? ["#10b981", "#059669"] : ["#f43f5e", "#e11d48"]}
                className="py-8 items-center"
              >
                <Text className="text-white font-black text-xl uppercase tracking-widest">
                  {scanMode === "check_in" ? "Check-In Success" : "Check-Out Success"}
                </Text>
              </LinearGradient>
              <View className="p-8 items-center">
                <Text className="text-white text-lg font-bold text-center">{selectedEvac?.evacuationName}</Text>
                <Text className="text-slate-500 text-xs text-center mb-8">{selectedEvac?.location.address}</Text>
                <TouchableOpacity
                  onPress={() => setScanned(false)}
                  className="bg-blue-600 w-full py-5 rounded-2xl items-center active:bg-blue-700"
                >
                  <Text className="text-white font-black uppercase tracking-widest">Scan Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}