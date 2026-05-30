import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import MedicineCard from "../../components/MedicineCard";
import { useTheme } from "../../utils/theme";
import { useAppContext } from "../../context/AppContext";

export default function MedicineListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { medicines, toggleTaken, deleteMedicine } = useAppContext();

  const handleEdit = (medicine) => {
    router.push({
      pathname: "/add-medicine",
      params: { id: medicine.id },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
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
              onPress={() => router.push("/add-medicine")}
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
                onToggle={toggleTaken}
                onDelete={deleteMedicine}
                onEdit={handleEdit}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* Floating Action Button for adding more medicines when list is not empty */}
      {medicines.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/add-medicine")}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}
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
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4F6EF7",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  fabIcon: {
    color: "#fff",
    fontSize: 32,
    lineHeight: 34,
    marginTop: -2,
  },
});
