import { useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../utils/theme";

export default function MedicineCard({ medicine, onToggle, onDelete, onEdit }) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkScale = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    Animated.sequence([
      Animated.spring(checkScale, {
        toValue: 1.3,
        useNativeDriver: true,
        tension: 200,
        friction: 5,
      }),
      Animated.spring(checkScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();
    onToggle(medicine.id);
  };

  const handleDelete = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDelete(medicine.id);
    });
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: medicine.taken ? colors.success + "30" : colors.border,
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim,
        },
      ]}
    >
      <View
        style={[styles.colorBar, { backgroundColor: medicine.color || colors.primary }]}
      />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.text }]}>
            {medicine.name}
          </Text>
          {medicine.pillsRemaining !== null && medicine.pillsRemaining !== undefined && (
            <View
              style={[
                styles.pillBadge,
                {
                  backgroundColor:
                    medicine.refillAt && medicine.pillsRemaining <= medicine.refillAt
                      ? colors.dangerLight
                      : colors.primaryLight,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Inter-Bold",
                  color:
                    medicine.refillAt && medicine.pillsRemaining <= medicine.refillAt
                      ? colors.danger
                      : colors.primary,
                }}
              >
                {medicine.pillsRemaining} pills
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.detail, { color: colors.sub }]}>
          {medicine.dosage} · {medicine.type} · 🕐 {medicine.time}
        </Text>
        {medicine.notes ? (
          <Text style={[styles.notes, { color: colors.sub }]}>
            📝 {medicine.notes}
          </Text>
        ) : null}
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: medicine.taken
                  ? colors.successLight
                  : colors.warningLight,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Inter-Bold",
                color: medicine.taken ? colors.success : colors.warning,
              }}
            >
              {medicine.taken ? "✓ Taken" : "⏰ Due"}
            </Text>
          </View>
          <Text
            style={[styles.freq, { color: colors.sub }]}
          >
            {medicine.frequency}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        {/* Check button */}
        <Animated.View style={{ transform: [{ scale: checkScale }] }}>
          <TouchableOpacity
            style={[
              styles.checkBtn,
              {
                backgroundColor: medicine.taken
                  ? colors.success
                  : "transparent",
                borderColor: medicine.taken ? colors.success : colors.border,
              },
            ]}
            onPress={handleToggle}
            activeOpacity={0.7}
          >
            <Text
              style={{
                color: medicine.taken ? "#fff" : colors.sub,
                fontSize: 16,
                fontFamily: "Inter-Bold",
              }}
            >
              ✓
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Edit button */}
        {onEdit && (
          <TouchableOpacity
            onPress={() => onEdit(medicine)}
            style={styles.actionBtn}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 15 }}>✏️</Text>
          </TouchableOpacity>
        )}

        {/* Delete button */}
        <TouchableOpacity
          onPress={handleDelete}
          style={styles.actionBtn}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 15 }}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "rgba(0,0,0,0.06)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  colorBar: { width: 5 },
  info: { flex: 1, padding: 14 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  name: { fontSize: 16, fontFamily: "Inter-Bold" },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  detail: { fontSize: 12, marginBottom: 4, fontFamily: "Inter-Regular" },
  notes: {
    fontSize: 11,
    fontStyle: "italic",
    marginBottom: 6,
    fontFamily: "Inter-Regular",
  },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  freq: { fontSize: 11, fontFamily: "Inter-Regular" },
  actions: {
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 10,
    gap: 6,
  },
  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
