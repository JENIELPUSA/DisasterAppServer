import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  ScrollView, 
  Image, 
  Modal,
  Platform
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const { height, width } = Dimensions.get('window');

const IncidentSidebar = ({ show, onClose, report, onNavigate }) => {
  const [selectedImgIndex, setSelectedImgIndex] = useState(null); // Index na ang itatago natin
  const fullViewRef = useRef(null);

  if (!show || !report) return null;

  const isFlood = report.reportType === 'flood';
  const hasMedia = report.media && report.media.length > 0;

  const getRoadStatus = () => {
    if (report.severity?.toLowerCase() === 'high') return "Not Passable";
    return report.roadClosed ? 'Closed' : 'Passable';
  };

  // Handler para sa pagbubukas ng fullscreen sa tamang index
  const openImage = (index) => {
    setSelectedImgIndex(index);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      
      <View style={styles.sheet}>
        <View style={styles.handle} />
        
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: isFlood ? '#e0f2fe' : '#fef3c7' }]}>
             <FontAwesome5 
                name={isFlood ? 'water' : 'mountain'} 
                size={22} 
                color={report.severity === 'high' ? '#ef4444' : '#f59e0b'} 
             />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{report.reportType?.toUpperCase()}</Text>
            <Text style={styles.idText}>ID: {report.reportId || 'Pending'}</Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
          
          {hasMedia && (
            <View style={styles.mediaSection}>
              <Text style={styles.descLabel}>Evidence Photos ({report.media.length})</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.horizontalScroll}
              >
                {report.media.map((item, index) => (
                  <TouchableOpacity 
                    key={index}
                    activeOpacity={0.9} 
                    onPress={() => openImage(index)} // Ipasa ang index
                    style={styles.imageWrapper}
                  >
                    <Image source={{ uri: item.uri }} style={styles.thumbnail} resizeMode="cover" />
                    <View style={styles.zoomIconOverlay}>
                      <MaterialIcons name="fullscreen" size={18} color="#fff" />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={20} color="#3b82f6" />
            <Text style={styles.addressText}>{report.address}</Text>
          </View>

          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: report.severity === 'high' ? '#fee2e2' : '#ffedd5' }]}>
              <Text style={[styles.badgeText, { color: report.severity === 'high' ? '#ef4444' : '#b45309' }]}>
                {report.severity?.toUpperCase()} SEVERITY
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.statusText}>{report.status?.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.gridContainer}>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>{isFlood ? 'Water Level' : 'Type'}</Text>
              <Text style={styles.detailValue}>{isFlood ? report.waterLevel : report.landslideType}</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Road Status</Text>
              <Text style={[styles.detailValue, report.severity === 'high' && { color: '#ef4444' }]}>
                {getRoadStatus()}
              </Text>
            </View>
          </View>

          <View style={styles.gridContainer}>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Vehicles Stranded</Text>
              <Text style={styles.detailValue}>{report.vehiclesStranded ? 'Yes' : 'None'}</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Emergency</Text>
              <Text style={styles.detailValue}>{report.emergencyNeeded ? 'REQUIRED' : 'No'}</Text>
            </View>
          </View>

          <Text style={styles.descLabel}>Report Description</Text>
          <Text style={styles.descText}>{report.description || "No description provided."}</Text>

          <View style={styles.footerSpacer} />
        </ScrollView>

        {/* FIXED FOOTER */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.navigateBtn} onPress={() => onNavigate(report)}>
            <MaterialIcons name="directions" size={22} color="#fff" />
            <Text style={styles.navigateBtnText}>GET DIRECTIONS</Text>
          </TouchableOpacity>
          <Text style={styles.dateText}>Reported: {new Date(report.reportedAt).toLocaleString()}</Text>
        </View>
      </View>

      {/* FULLSCREEN SWIPEABLE MODAL */}
      <Modal 
        visible={selectedImgIndex !== null} 
        transparent={true} 
        onRequestClose={() => setSelectedImgIndex(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalCloseBtn} 
            onPress={() => setSelectedImgIndex(null)}
          >
            <MaterialIcons name="close" size={35} color="#fff" />
          </TouchableOpacity>
          
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: selectedImgIndex * width, y: 0 }} // Start sa pinindot na image
          >
            {report.media.map((item, index) => (
              <View key={index} style={styles.fullImageContainer}>
                <Image 
                  source={{ uri: item.uri }} 
                  style={styles.fullImage} 
                  resizeMode="contain" 
                />
                {/* Image Counter Indicator */}
                <View style={styles.imageCounter}>
                   <Text style={styles.counterText}>{index + 1} / {report.media.length}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, zIndex: 100, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, paddingTop: 15, maxHeight: height * 0.85, elevation: 15 },
  handle: { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, alignSelf: 'center', marginBottom: 15 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  iconContainer: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  title: { fontSize: 20, fontWeight: '900', color: '#111827' },
  idText: { color: '#6b7280', fontSize: 12 },
  
  scrollArea: { maxHeight: height * 0.5 },
  mediaSection: { marginBottom: 20 },
  horizontalScroll: { paddingRight: 20 },
  imageWrapper: { marginRight: 12, position: 'relative' },
  thumbnail: { width: 140, height: 100, borderRadius: 12, backgroundColor: '#f3f4f6' },
  zoomIconOverlay: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 4, padding: 2 },

  // Swipeable Modal Styles
  modalContainer: { flex: 1, backgroundColor: '#000' },
  modalCloseBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 5 },
  fullImageContainer: { width: width, height: height, justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: width, height: height * 0.8 },
  imageCounter: { position: 'absolute', bottom: 100, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20 },
  counterText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  infoRow: { flexDirection: 'row', marginBottom: 10, alignItems: 'center' },
  addressText: { marginLeft: 8, color: '#374151', flex: 1, fontSize: 14, fontWeight: '600' },
  badgeContainer: { flexDirection: 'row', gap: 8, marginBottom: 15 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, backgroundColor: '#f3f4f6' },
  badgeText: { fontSize: 10, fontWeight: '800' },
  statusText: { fontSize: 10, color: '#4b5563', fontWeight: '800' },
  gridContainer: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  detailBox: { flex: 1, backgroundColor: '#f8fafc', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#f1f5f9' },
  detailLabel: { fontSize: 9, color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  detailValue: { fontSize: 14, fontWeight: '800', color: '#0f172a', textTransform: 'capitalize' },
  descLabel: { fontSize: 12, fontWeight: '700', color: '#1e293b', marginBottom: 8, marginTop: 10 },
  descText: { color: '#475569', lineHeight: 20, fontSize: 14 },
  footerSpacer: { height: 30 },

  // Footer
  footer: { paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#f1f5f9', backgroundColor: '#fff', paddingBottom: Platform.OS === 'ios' ? 30 : 70 },
  navigateBtn: { backgroundColor: '#3b82f6', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 15, gap: 10 },
  navigateBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  dateText: { marginTop: 10, fontSize: 10, color: '#94a3b8', textAlign: 'center' }
});

export default IncidentSidebar;