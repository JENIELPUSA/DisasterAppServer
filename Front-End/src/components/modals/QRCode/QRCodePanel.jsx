import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';

import logo from '../../../../assets/logo.png';

const ExpandedQRModal = ({
  qrExpanded,
  handleCloseExpandedQR,
  userProfile,
}) => {
  const { width: windowWidth } = Dimensions.get('window');
  
  const [flipped, setFlipped] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const qrCodeRef = useRef();
  const cardWidth = Math.min(windowWidth * 0.9, 400);
  const cardHeight = cardWidth * (2.125 / 3.375);

  const flipCard = () => {
    Animated.spring(flipAnimation, { 
      toValue: flipped ? 0 : 180, 
      friction: 8, 
      tension: 10, 
      useNativeDriver: true 
    }).start();
    setFlipped(!flipped);
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const getBase64FromAsset = async (asset) => {
    const response = await fetch(asset.uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const downloadID = async () => {
    try {
      setIsGeneratingPDF(true);
      const asset = Asset.fromModule(logo);
      await asset.downloadAsync();
      const logoBase64 = await getBase64FromAsset(asset);

      let qrBase64 = "";
      if (qrCodeRef.current) {
        await new Promise((resolve) => {
          qrCodeRef.current.toDataURL((data) => {
            qrBase64 = `data:image/png;base64,${data}`;
            resolve();
          });
        });
      }

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; display: flex; flex-direction: column; align-items: center; padding: 40px; background: #f0f0f0; }
              .card { 
                width: 3.375in; height: 2.125in; border: 2.5px solid #001f3f; border-radius: 12px; 
                position: relative; overflow: hidden; background: white; margin-bottom: 30px;
                -webkit-print-color-adjust: exact;
              }
              .header { text-align: center; margin-top: 10px; line-height: 1.1; }
              .rep { font-size: 7px; text-transform: uppercase; }
              .prov { font-size: 9px; font-weight: bold; }
              .logo-header { position: absolute; left: 15px; top: 10px; width: 45px; height: 45px; object-fit: contain; }
              .id-number-label { position: absolute; left: 105px; top: 62px; font-size: 8px; font-weight: bold; color: #333; }
              .banner { background: #001f3f; height: 45px; width: 100%; position: absolute; top: 75px; -webkit-print-color-adjust: exact; }
              
              /* 2x2 PICTURE BOX (Approx 0.85in for ID card scale) */
              .photo { 
                width: 0.85in; height: 0.85in; 
                background: #e1e1e1; position: absolute; left: 15px; top: 55px; 
                border-radius: 2px; border: 1px solid #ccc; z-index: 10; overflow: hidden; 
                display: flex; justify-content: center; align-items: center; 
              }
              
              .info { position: absolute; left: 105px; top: 88px; color: white; z-index: 10; font-weight: bold; text-transform: uppercase; font-size: 13px; }
              .qr-box-front { position: absolute; right: 15px; bottom: 12px; width: 85px; height: 50px; background: white; display: flex; justify-content: center; align-items: center; }
              .qr-box-front img { width: auto; height: 100%; object-fit: contain; }
              
              .sig-line-front { position: absolute; left: 105px; bottom: 25px; border-top: 1px solid #000; width: 120px; text-align: center; font-size: 7px; font-weight: bold; padding-top: 2px; }
              .sig-line-back { border-top: 1px solid #000; width: 100%; text-align: center; font-size: 7px; margin-top: 15px; font-weight: bold; padding-top: 2px; }

              .back-container { display: flex; height: 100%; width: 100%; }
              .back-left { width: 60%; padding: 15px; display: flex; flex-direction: column; justify-content: space-between; border-right: 1px solid #eee; }
              .back-right { width: 40%; background-image: radial-gradient(#d1d1d1 1px, transparent 1px); background-size: 10px 10px; display: flex; justify-content: center; align-items: center; }
              .instruction-title { color: #001f3f; font-size: 10px; font-weight: bold; border-bottom: 1.5px solid #001f3f; padding-bottom: 4px; margin-bottom: 8px; }
              .large-qr { width: 90px; height: 90px; background: white; padding: 5px; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="card">
              <img src="${logoBase64}" class="logo-header" />
              <div class="header">
                <div class="rep">Republic of the Philippines</div>
                <div class="prov">Province of Biliran</div>
                <div class="prov">Municipality of Naval</div>
              </div>
              <div class="id-number-label">ID No: ${userProfile?.userId || '0000'}</div>
              <div class="banner"></div>
              <div class="photo">
                ${userProfile?.profilePicture 
                  ? `<img src="${userProfile.profilePicture}" style="width:100%; height:100%; object-fit:cover;"/>` 
                  : `<span style="font-size: 30px; color: #999;">👤</span>`}
              </div>
              <div class="info">${userProfile?.name || 'RESIDENT NAME'}</div>
              <div class="sig-line-front">SIGNATURE OF EVACUEE</div>
              <div style="position: absolute; left: 105px; bottom: 10px; font-size: 6px; font-weight: bold; color: #666;">OFFICIAL EVACUATION ID</div>
              <div class="qr-box-front"><img src="${qrBase64}"/></div>
            </div>

            <div class="card">
              <div class="back-container">
                <div class="back-left">
                  <div>
                    <div class="instruction-title">IMPORTANT INFORMATION</div>
                    <p style="font-size: 8px; line-height: 1.2;">This ID is strictly for Evacuation Verification purposes. Present this to authorities during emergencies.</p>
                  </div>
                  <div class="footer-back">
                     <div style="font-size: 8px; color: #666; margin-bottom: 5px;">Date Issued: <b>01/14/2026</b></div>
                     <div class="sig-line-back">BARANGAY CAPTAIN</div>
                  </div>
                </div>
                <div class="back-right">
                   <div class="large-qr">
                      <img src="${qrBase64}" style="width: 100%; height: 100%;"/>
                   </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Download ID Card' });
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to generate PDF.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Modal animationType="fade" transparent={true} visible={qrExpanded} onRequestClose={handleCloseExpandedQR}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
        
        <TouchableOpacity style={{ position: 'absolute', top: 50, right: 25, zIndex: 50 }} onPress={handleCloseExpandedQR}>
          <Ionicons name="close" size={35} color="white" />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity activeOpacity={1} onPress={flipCard}>
            
            {/* FRONT CARD UI */}
            <Animated.View style={[{ transform: [{ rotateY: frontInterpolate }] }, { width: cardWidth, height: cardHeight, backfaceVisibility: 'hidden', backgroundColor: 'white', borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: '#001f3f' }]}>
              <View style={{ alignItems: 'center', paddingTop: 10 }}>
                <Text style={{ fontSize: 7, textTransform: 'uppercase' }}>Republic of the Philippines</Text>
                <Text style={{ fontSize: 9, fontWeight: 'bold' }}>Province of Biliran</Text>
                <Text style={{ fontSize: 9, fontWeight: 'bold' }}>Municipality of Naval</Text>
              </View>
              <Image source={logo} style={{ position: 'absolute', left: 15, top: 10, width: 45, height: 45 }} resizeMode="contain" />
              
              <Text style={{ position: 'absolute', left: 105, top: 62, fontSize: 8, fontWeight: 'bold', color: '#333' }}>ID No: {userProfile?.userId || '0000'}</Text>
              
              <View style={{ backgroundColor: '#001f3f', height: 45, position: 'absolute', top: 75, width: '100%', justifyContent: 'center', paddingLeft: 105 }}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13, textTransform: 'uppercase' }}>{userProfile?.name}</Text>
              </View>

              {/* 2x2 Picture Box UI (Equal width and height) */}
              <View style={{ position: 'absolute', top: 55, left: 15, width: 80, height: 80, backgroundColor: '#e1e1e1', borderRadius: 2, borderWidth: 1, borderColor: '#ccc', overflow: 'hidden', zIndex: 10, justifyContent: 'center', alignItems: 'center' }}>
                {userProfile?.profilePicture ? (
                  <Image source={{ uri: userProfile.profilePicture }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <Ionicons name="person" size={35} color="#999" />
                )}
              </View>

              <View style={{ position: 'absolute', left: 105, bottom: 25, borderTopWidth: 1, width: 120, alignItems: 'center' }}>
                <Text style={{ fontSize: 7, fontWeight: 'bold' }}>SIGNATURE OF EVACUEE</Text>
              </View>

              <View style={{ position: 'absolute', bottom: 12, right: 15, width: 85, height: 50, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                <QRCode value={userProfile?.qrData || "N/A"} size={45} getRef={(c) => (qrCodeRef.current = c)} />
              </View>
            </Animated.View>

            {/* BACK CARD UI */}
            <Animated.View style={[{ transform: [{ rotateY: backInterpolate }] }, { width: cardWidth, height: cardHeight, position: 'absolute', top: 0, backfaceVisibility: 'hidden', backgroundColor: 'white', borderRadius: 12, borderWidth: 2, borderColor: '#001f3f', overflow: 'hidden' }]}>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={{ width: '60%', padding: 15, justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ color: '#001f3f', fontWeight: 'bold', fontSize: 10, borderBottomWidth: 1.5, borderBottomColor: '#001f3f', paddingBottom: 4, marginBottom: 8 }}>IMPORTANT INFORMATION</Text>
                    <Text style={{ fontSize: 8, color: '#333', lineHeight: 11 }}>This ID is strictly for Evacuation Verification purposes. Present this to authorities during emergencies.</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 8, color: '#666' }}>Date Issued: <Text style={{fontWeight:'bold'}}>01/14/2026</Text></Text>
                    <View style={{ borderTopWidth: 1, width: '100%', alignItems: 'center', marginTop: 15 }}>
                      <Text style={{ fontSize: 7, fontWeight: 'bold' }}>BARANGAY CAPTAIN</Text>
                    </View>
                  </View>
                </View>

                <View style={{ width: '40%', backgroundColor: '#f9f9f9', justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#eee' }}>
                   <View style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.1, flexDirection: 'row', flexWrap: 'wrap' }}>
                      {Array(50).fill(0).map((_, i) => <View key={i} style={{ width: 10, height: 10, borderRightWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#000' }} />)}
                   </View>
                   <View style={{ backgroundColor: 'white', padding: 8, borderRadius: 8, elevation: 3 }}>
                      <QRCode value={userProfile?.qrData || "N/A"} size={80} />
                   </View>
                </View>
              </View>
            </Animated.View>

          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity 
          style={{ position: 'absolute', bottom: 40, right: 30, backgroundColor: '#1d4ed8', borderRadius: 50, paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', elevation: 5 }} 
          onPress={downloadID} 
          disabled={isGeneratingPDF}
        >
          {isGeneratingPDF ? <ActivityIndicator color="white" /> : (
            <>
              <Ionicons name="cloud-download-outline" size={24} color="white" />
              <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 10 }}>DOWNLOAD PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ExpandedQRModal;