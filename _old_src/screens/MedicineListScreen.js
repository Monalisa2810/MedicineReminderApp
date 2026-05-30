import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MedicineCard from "../components/MedicineCard";
import { useTheme } from "../utils/theme";

export default function MedicineListScreen({
  medicines,
  onToggle,
  onDelete,
  onEdit,
  navigation,
}) {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        {medicines.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primaryLight }]}>
              <Text style={{ fontSize: 48 }}>💊</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No medicines added
            </Text>
            <Text style={[styles.emptySub, { color: colors.sub }]}>
              Tap + Add in the top right to add your{"\n"}first medicine reminder
            </Text>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate("AddMedicine")}
              activeOpacity={0.8}
            >
              <Text style={styles.addBtnText}>+ Add Medicine</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={[styles.countText, { color: colors.sub }]}>
              {medicines.length} medicine{medicines.length !== 1 ? "s" : ""}
            </Text>
            {medicines.map((m) => (
              <MedicineCard
                key={m.id}
                medicine={m}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter-Bold", marginBottom: 8 },
  emptySub: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Inter-Regular",
    lineHeight: 20,
    marginBottom: 24,
  },
  addBtn: {
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 13,
    shadowColor: "#4F6EF7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnText: {
    color: "#fff",
    fontFamily: "Inter-Bold",
    fontSize: 14,
  },
  countText: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    marginBottom: 12,
    paddingLeft: 4,
  },
});
