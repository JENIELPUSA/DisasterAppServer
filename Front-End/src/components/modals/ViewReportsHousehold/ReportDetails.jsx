import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 40) / 2; // Kalkulasyon para sa pantay na 2 columns

const ReportDetail = ({ report, onBack, onOpenGallery }) => {
  const allBeforeAfterImages = [
    ...(report.beforeMedia?.map((i) => ({ ...i, label: "Before", type: 'before' })) || []),
    ...(report.afterMedia?.map((i) => ({ ...i, label: "After", type: 'after' })) || []),
  ];

  const hasNoAfterMedia = !report.afterMedia || report.afterMedia.length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 }}
      >
        {/* Header Section */}
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#0e7490" />
          <Text style={styles.backText}>Back to list</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{report.typhoonName}</Text>
        <Text style={styles.subtitle}>{report.damageType}</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}><Text style={styles.label}>Address: </Text>{report.address}</Text>
          <Text style={styles.infoText}><Text style={styles.label}>Severity: </Text>{report.severity}</Text>
        </View>

        {/* Materials Section */}
        <Text style={styles.sectionTitle}>Materials Used</Text>
        <View style={styles.materialsCard}>
          {report.materialsUsed?.length > 0 ? (
            report.materialsUsed.map((mat) => (
              <Text key={mat._id} style={styles.materialItem}>• {mat.name} ({mat.quantity} {mat.unit})</Text>
            ))
          ) : (
            <Text style={styles.emptyText}>No materials listed</Text>
          )}
        </View>

        {/* Before / After Grid Section */}
        <Text style={styles.sectionTitle}>Before / After Media</Text>
        {allBeforeAfterImages.length > 0 ? (
          <View style={styles.gridContainer}>
            {allBeforeAfterImages.map((item, index) => (
              <TouchableOpacity
                key={item._id || index.toString()}
                onPress={() => onOpenGallery(allBeforeAfterImages, index)}
                style={styles.imageWrapper}
              >
                <Image source={{ uri: item.uri }} style={styles.gridImage} />
                <View style={[
                  styles.badge, 
                  { backgroundColor: item.type === 'before' ? "#0e7490" : "#059669" }
                ]}>
                  <Text style={styles.badgeText}>{item.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No media available</Text>
        )}

        {/* Action Buttons */}
        {hasNoAfterMedia && (
          <View style={{ marginTop: 30 }}>
            <Text style={styles.actionHeader}>Damage Assessment Actions:</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#0e7490" }]}>
                <Ionicons name="construct-outline" size={20} color="white" />
                <Text style={styles.buttonText}>Partially Damaged</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#be123c" }]}>
                <Ionicons name="warning-outline" size={20} color="white" />
                <Text style={styles.buttonText}>Totally Damaged</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: { marginBottom: 15, flexDirection: "row", alignItems: "center" },
  backText: { marginLeft: 8, color: "#0e7490", fontWeight: "bold" },
  title: { fontSize: 26, fontWeight: "900", color: "#1e293b" },
  subtitle: { fontSize: 16, color: "#64748b", marginBottom: 12 },
  infoCard: { backgroundColor: "#f1f5f9", padding: 12, borderRadius: 8, marginBottom: 16 },
  infoText: { fontSize: 14, color: "#334155", marginBottom: 4 },
  label: { fontWeight: "bold" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10, color: "#334155" },
  materialsCard: { backgroundColor: "white", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 20 },
  materialItem: { fontSize: 14, color: "#475569", marginBottom: 4 },
  emptyText: { fontStyle: "italic", color: "#94a3b8" },
  
  // Grid Styles
  gridContainer: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between" 
  },
  imageWrapper: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH,
    marginBottom: 10,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gridImage: { width: "100%", height: "100%", objectFit: "cover" },
  badge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { color: "white", fontSize: 10, fontWeight: "bold" },

  actionHeader: { fontWeight: "bold", color: "#475569", marginBottom: 12 },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 13 }
});

export default ReportDetail;