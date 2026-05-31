import DateTimePicker from "@react-native-community/datetimepicker";
import { useState, useEffect } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { useTheme } from "../utils/theme";
import { useAppContext } from "../context/AppContext";
import * as Notifications from "expo-notifications";

const COLORS = ["#4F6EF7", "#10B981", "#F59E0B", "#EF4444", "#7C5CF6", "#EC4899"];
const TYPES = ["💊 Tablet", "💉 Capsule", "🧪 Syrup", "💆 Drops", "🩹 Injection"];
const FREQS = ["Once Daily", "Twice Daily", "Three Times", "As Needed"];

export default function AddMedicineScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { medicines, addMedicine, editMedicine: updateMedicine } = useAppContext();
  
  const editMedicineId = params.id;
  const editMedicine = editMedicineId ? medicines.find(m => m.id === editMedicineId) : null;
  const isEditing = !!editMedicine;

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [type, setType] = useState("💊 Tablet");
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [freq, setFreq] = useState("Once Daily");
  const [color, setColor] = useState("#4F6EF7");
  const [notes, setNotes] = useState("");
  const [totalPills, setTotalPills] = useState("");
  const [refillAt, setRefillAt] = useState("");

  // Pre-fill when editing
  useEffect(() => {
    if (editMedicine) {
      setName(editMedicine.name || "");
      setDosage(editMedicine.dosage || "");
      setType(editMedicine.type || "💊 Tablet");
      setFreq(editMedicine.frequency || "Once Daily");
      setColor(editMedicine.color || "#4F6EF7");
      setNotes(editMedicine.notes || "");
      setTotalPills(editMedicine.totalPills?.toString() || "");
      setRefillAt(editMedicine.refillAt?.toString() || "");
      if (editMedicine.time) {
        const [h, m] = editMedicine.time.split(":").map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        setTime(d);
      }
    } else {
      // Clear form when adding a new medicine to avoid sticky state
      setName("");
      setDosage("");
      setType("💊 Tablet");
      setTime(new Date());
      setFreq("Once Daily");
      setColor("#4F6EF7");
      setNotes("");
      setTotalPills("");
      setRefillAt("");
    }
  }, [editMedicineId]);

  const fmt12 = (d) => {
    let h = d.getHours(),
      m = d.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert("Required", "Please enter a medicine name"); return; }
    if (!dosage.trim()) { Alert.alert("Required", "Please enter dosage"); return; }
    const hh = time.getHours().toString().padStart(2, "0");
    const mm = time.getMinutes().toString().padStart(2, "0");

    // Request permissions on native platforms
    if (Platform.OS !== 'web') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission required", "Please enable notifications to receive reminders.");
      }
    }

    const medData = {
      name: name.trim(),
      dosage: dosage.trim(),
      type,
      time: `${hh}:${mm}`,
      frequency: freq,
      color,
      notes: notes.trim(),
      taken: isEditing ? editMedicine.taken : false,
      totalPills: totalPills ? parseInt(totalPills) : null,
      refillAt: refillAt ? parseInt(refillAt) : null,
    };

    try {
      if (isEditing) {
        await updateMedicine(editMedicine.id, medData);
      } else {
        await addMedicine(medData);
      }
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", e.message || "Failed to save medicine");
    }
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen 
        options={{ 
          title: isEditing ? "Edit Medicine" : "Add Medicine",
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
        }} 
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Preview Card */}
        <View style={[styles.previewCard, { borderColor: color, backgroundColor: colors.card }]}>
          <View style={[styles.previewBar, { backgroundColor: color }]} />
          <View style={styles.previewInfo}>
            <Text style={[styles.previewName, { color: colors.text }]}>
              {name || "Medicine Name"}
            </Text>
            <Text style={[styles.previewDetail, { color: colors.sub }]}>
              {dosage || "Dosage"} · {type} · 🕐 {fmt12(time)}
            </Text>
            <View style={[styles.previewBadge, { backgroundColor: colors.warningLight }]}>
              <Text style={{ fontSize: 10, fontFamily: "Inter-Bold", color: colors.warning }}>⏰ Due</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.label, { color: colors.sub }]}>MEDICINE NAME</Text>
        <TextInput
          style={inputStyle}
          placeholder="e.g. Paracetamol"
          placeholderTextColor={colors.sub}
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.label, { color: colors.sub }]}>DOSAGE</Text>
        <TextInput
          style={inputStyle}
          placeholder="e.g. 500mg"
          placeholderTextColor={colors.sub}
          value={dosage}
          onChangeText={setDosage}
        />

        <Text style={[styles.label, { color: colors.sub }]}>TYPE</Text>
        <View style={styles.pillRow}>
          {TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.pillOpt,
                {
                  borderColor: type === t ? colors.primary : colors.border,
                  backgroundColor: type === t ? colors.primaryLight : colors.card,
                },
              ]}
              onPress={() => setType(t)}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Inter-SemiBold",
                  color: type === t ? colors.primary : colors.sub,
                }}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.sub }]}>REMINDER TIME</Text>
        {Platform.OS === "web" ? (
          <input
            type="time"
            value={time.toTimeString().slice(0, 5)}
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                const [h, m] = val.split(":");
                const d = new Date(time);
                d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
                setTime(d);
              }
            }}
            style={{
              padding: "13px",
              borderRadius: "14px",
              border: `1.5px solid ${colors.border}`,
              backgroundColor: colors.inputBg,
              color: colors.text,
              fontSize: "16px",
              fontFamily: "Inter-Regular",
              width: "100%",
              boxSizing: "border-box",
              marginBottom: "4px",
            }}
          />
        ) : (
          <>
            <TouchableOpacity style={inputStyle} onPress={() => setShowPicker(true)} activeOpacity={0.7}>
              <Text style={{ color: colors.text, fontSize: 16, padding: 2, fontFamily: "Inter-Regular" }}>
                🕐 {fmt12(time)}
              </Text>
            </TouchableOpacity>
            {showPicker && (
              <DateTimePicker
                value={time}
                mode="time"
                is24Hour={false}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(e, selected) => {
                  setShowPicker(false);
                  if (selected) setTime(selected);
                }}
              />
            )}
          </>
        )}

        <Text style={[styles.label, { color: colors.sub }]}>FREQUENCY</Text>
        <View style={styles.pillRow}>
          {FREQS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.pillOpt,
                {
                  borderColor: freq === f ? colors.primary : colors.border,
                  backgroundColor: freq === f ? colors.primaryLight : colors.card,
                },
              ]}
              onPress={() => setFreq(f)}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter-SemiBold",
                  color: freq === f ? colors.primary : colors.sub,
                }}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.sub }]}>COLOR TAG</Text>
        <View style={styles.colorRow}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorDot,
                {
                  backgroundColor: c,
                  borderWidth: color === c ? 3 : 0,
                  borderColor: colors.text,
                  transform: [{ scale: color === c ? 1.15 : 1 }],
                },
              ]}
              onPress={() => setColor(c)}
              activeOpacity={0.7}
            />
          ))}
        </View>

        {/* Refill Tracking */}
        <View style={[styles.refillSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.refillTitle, { color: colors.text }]}>📦 Refill Tracking</Text>
          <Text style={[styles.refillSub, { color: colors.sub }]}>
            Track your pill count and get alerts when running low
          </Text>

          <View style={styles.refillRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.sub, marginTop: 8 }]}>TOTAL PILLS</Text>
              <TextInput
                style={inputStyle}
                placeholder="e.g. 30"
                placeholderTextColor={colors.sub}
                value={totalPills}
                onChangeText={setTotalPills}
                keyboardType="numeric"
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.sub, marginTop: 8 }]}>ALERT AT</Text>
              <TextInput
                style={inputStyle}
                placeholder="e.g. 5"
                placeholderTextColor={colors.sub}
                value={refillAt}
                onChangeText={setRefillAt}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <Text style={[styles.label, { color: colors.sub }]}>NOTES (OPTIONAL)</Text>
        <TextInput
          style={[...inputStyle, { minHeight: 70, textAlignVertical: "top" }]}
          placeholder="e.g. Take after food"
          placeholderTextColor={colors.sub}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.bg }]}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>
            {isEditing ? "✏️ Update Medicine" : "💾 Save Reminder"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  previewCard: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
    overflow: "hidden",
  },
  previewBar: { width: 5 },
  previewInfo: { flex: 1, padding: 14 },
  previewName: { fontSize: 16, fontFamily: "Inter-Bold", marginBottom: 4 },
  previewDetail: { fontSize: 12, fontFamily: "Inter-Regular", marginBottom: 6 },
  previewBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, alignSelf: "flex-start" },
  label: {
    fontSize: 11,
    fontFamily: "Inter-Bold",
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    marginBottom: 4,
    fontFamily: "Inter-Regular",
  },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  pillOpt: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1.5,
  },
  colorRow: { flexDirection: "row", gap: 12, marginBottom: 4, marginTop: 4 },
  colorDot: { width: 34, height: 34, borderRadius: 17 },
  refillSection: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginTop: 20,
    marginBottom: 4,
  },
  refillTitle: { fontSize: 15, fontFamily: "Inter-Bold", marginBottom: 4 },
  refillSub: { fontSize: 12, fontFamily: "Inter-Regular" },
  refillRow: { flexDirection: "row" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
  },
  saveBtn: {
    borderRadius: 16,
    padding: 17,
    alignItems: "center",
    shadowColor: "#4F6EF7",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter-Bold" },
});
