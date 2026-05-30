import { useRef, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../utils/theme";

const MOODS = [
  { emoji: "😢", label: "Sad" },
  { emoji: "😐", label: "Okay" },
  { emoji: "🙂", label: "Good" },
  { emoji: "😃", label: "Great" },
  { emoji: "🤩", label: "Amazing" },
];

export default function HealthLogScreen({ logs, onSave }) {
  const { colors } = useTheme();
  const [mood, setMood] = useState("🙂 Good");
  const [bp, setBp] = useState("");
  const [temp, setTemp] = useState("");
  const [hr, setHr] = useState("");
  const [bs, setBs] = useState("");
  const [weight, setWeight] = useState("");
  const [symptoms, setSymptoms] = useState("");

  const saveScale = useRef(new Animated.Value(1)).current;

  const inputStyle = {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
    fontSize: 15,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
    color: colors.text,
    marginTop: 6,
    fontFamily: "Inter-Regular",
  };

  const handleSave = () => {
    // Animate save button
    Animated.sequence([
      Animated.spring(saveScale, { toValue: 0.95, useNativeDriver: true, tension: 200, friction: 5 }),
      Animated.spring(saveScale, { toValue: 1, useNativeDriver: true }),
    ]).start();

    const log = {
      id: Date.now(),
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      mood, bp, temp, hr, bs, weight, symptoms,
    };
    onSave(log);
    setBp(""); setTemp(""); setHr(""); setBs(""); setWeight(""); setSymptoms("");
    Alert.alert("Saved! 📊", "Your health log has been recorded.");
  };

  // Color-code vitals based on normal ranges
  const getVitalColor = (type, value) => {
    if (!value) return colors.text;
    const v = parseFloat(value);
    switch (type) {
      case "temp":
        return v > 100.4 ? colors.danger : v < 96.8 ? colors.warning : colors.success;
      case "hr":
        return v > 100 ? colors.danger : v < 60 ? colors.warning : colors.success;
      case "bs":
        return v > 140 ? colors.danger : v < 70 ? colors.warning : colors.success;
      default:
        return colors.text;
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Mood */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          How are you feeling? 💭
        </Text>
        <View style={styles.moodRow}>
          {MOODS.map((m) => {
            const isSelected = mood.includes(m.label);
            return (
              <TouchableOpacity
                key={m.label}
                style={[
                  styles.moodBtn,
                  {
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primaryLight : colors.card,
                    transform: [{ scale: isSelected ? 1.05 : 1 }],
                  },
                ]}
                onPress={() => setMood(`${m.emoji} ${m.label}`)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 24 }}>{m.emoji}</Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: "Inter-Bold",
                    color: isSelected ? colors.primary : colors.sub,
                  }}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Vitals */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Vital Signs</Text>
      <View style={styles.vitalsGrid}>
        {[
          { label: "❤️ Blood Pressure", val: bp, set: setBp, ph: "120/80", unit: "mmHg", key: "bp" },
          { label: "🌡 Temperature", val: temp, set: setTemp, ph: "98.6", unit: "°F", key: "temp" },
          { label: "💓 Heart Rate", val: hr, set: setHr, ph: "72", unit: "bpm", key: "hr" },
          { label: "🩸 Blood Sugar", val: bs, set: setBs, ph: "99", unit: "mg/dL", key: "bs" },
        ].map((v) => (
          <View
            key={v.label}
            style={[styles.vitalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={{ fontSize: 11, fontFamily: "Inter-Bold", color: colors.sub }}>
              {v.label}
            </Text>
            <TextInput
              style={{
                fontSize: 22,
                fontFamily: "Inter-ExtraBold",
                color: getVitalColor(v.key, v.val),
                marginTop: 8,
              }}
              placeholder={v.ph}
              placeholderTextColor={colors.sub}
              value={v.val}
              onChangeText={v.set}
              keyboardType="decimal-pad"
            />
            <Text style={{ fontSize: 11, color: colors.sub, marginTop: 2, fontFamily: "Inter-Regular" }}>
              {v.unit}
            </Text>
          </View>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.sub }]}>WEIGHT</Text>
      <TextInput
        style={inputStyle}
        placeholder="e.g. 70 kg"
        placeholderTextColor={colors.sub}
        value={weight}
        onChangeText={setWeight}
      />

      <Text style={[styles.label, { color: colors.sub }]}>SYMPTOMS / NOTES</Text>
      <TextInput
        style={[inputStyle, { minHeight: 80, textAlignVertical: "top" }]}
        placeholder="Any symptoms today..."
        placeholderTextColor={colors.sub}
        value={symptoms}
        onChangeText={setSymptoms}
        multiline
      />

      <Animated.View style={{ transform: [{ scale: saveScale }] }}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.success }]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>📊 Save Health Log</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Past Logs */}
      {logs.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 28 }]}>
            Recent Logs
          </Text>
          {logs.slice(0, 5).map((log) => (
            <View
              key={log.id}
              style={[styles.logEntry, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.logHeader}>
                <Text style={{ fontSize: 11, fontFamily: "Inter-Bold", color: colors.sub, letterSpacing: 0.5 }}>
                  {log.date?.toUpperCase?.() || log.date}
                </Text>
                <Text style={{ fontSize: 16 }}>{log.mood?.split(" ")[0] || "🙂"}</Text>
              </View>
              {[
                ["Mood", log.mood],
                log.bp && ["BP", log.bp + " mmHg"],
                log.temp && ["Temp", log.temp + "°F"],
                log.hr && ["Heart Rate", log.hr + " bpm"],
                log.bs && ["Blood Sugar", log.bs + " mg/dL"],
                log.weight && ["Weight", log.weight],
                log.symptoms && ["Notes", log.symptoms],
              ]
                .filter(Boolean)
                .map(([k, v]) => (
                  <View key={k} style={[styles.logRow, { borderBottomColor: colors.border }]}>
                    <Text style={{ fontSize: 12, color: colors.sub, fontFamily: "Inter-Regular" }}>{k}</Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Inter-Bold",
                        color: colors.text,
                        maxWidth: "55%",
                        textAlign: "right",
                      }}
                    >
                      {v}
                    </Text>
                  </View>
                ))}
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: "rgba(0,0,0,0.04)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontFamily: "Inter-Bold", marginBottom: 14 },
  moodRow: { flexDirection: "row", justifyContent: "space-between" },
  moodBtn: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    gap: 4,
  },
  sectionTitle: { fontSize: 17, fontFamily: "Inter-ExtraBold", marginBottom: 12, marginTop: 4 },
  vitalsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  vitalCard: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: "rgba(0,0,0,0.03)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  label: { fontSize: 11, fontFamily: "Inter-Bold", letterSpacing: 0.8, marginTop: 14, marginBottom: 2 },
  saveBtn: {
    borderRadius: 16,
    padding: 17,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter-Bold" },
  logEntry: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  logRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
});
