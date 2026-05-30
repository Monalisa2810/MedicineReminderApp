import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useTheme } from "../utils/theme";
import { useAppContext } from "../context/AppContext";

export default function ReportScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { medicines, healthLogs, user } = useAppContext();

  // Basic stats
  const totalMeds = medicines.length;
  const takenMeds = medicines.filter(m => m.taken).length;
  const adherence = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 0;

  // Recent logs
  const recentLogs = healthLogs.slice(0, 5); // Last 5 logs

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen 
        options={{ 
          title: "Health Report",
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
        }} 
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 32, marginTop: 16 }}>
          <View style={[styles.reportIcon, { backgroundColor: colors.primaryLight }]}>
            <Text style={{ fontSize: 40 }}>📄</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Patient Health Summary</Text>
          <Text style={[styles.sub, { color: colors.sub }]}>For {user?.name || "Patient"}</Text>
          <Text style={[styles.sub, { color: colors.sub, fontSize: 11, marginTop: 2 }]}>
            Generated on {new Date().toLocaleDateString()}
          </Text>
        </View>

        {/* Adherence Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Medication Adherence</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.statValue, { color: adherence === 100 ? colors.primary : colors.warning }]}>
                {adherence}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.sub }]}>Daily Adherence</Text>
            </View>
            <View style={{ width: 1, height: 40, backgroundColor: colors.border, marginHorizontal: 16 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {takenMeds} / {totalMeds}
              </Text>
              <Text style={[styles.statLabel, { color: colors.sub }]}>Doses Taken Today</Text>
            </View>
          </View>
        </View>

        {/* Health Vitals Summary */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Vitals</Text>
        {recentLogs.length === 0 ? (
          <Text style={{ color: colors.sub, fontFamily: "Inter-Regular" }}>No health logs recorded recently.</Text>
        ) : (
          recentLogs.map((log) => (
            <View key={log.id} style={[styles.logRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.logDate, { color: colors.text }]}>
                  {new Date(log.date).toLocaleDateString()}
                </Text>
                {log.notes ? <Text style={[styles.logNotes, { color: colors.sub }]}>{log.notes}</Text> : null}
              </View>
              <View style={{ alignItems: "flex-end" }}>
                {log.bloodPressure ? <Text style={[styles.logVital, { color: colors.primary }]}>🩸 {log.bloodPressure} mmHg</Text> : null}
                {log.sugarLevel ? <Text style={[styles.logVital, { color: colors.warning }]}>🍬 {log.sugarLevel} mg/dL</Text> : null}
                {log.weight ? <Text style={[styles.logVital, { color: colors.text }]}>⚖️ {log.weight} kg</Text> : null}
              </View>
            </View>
          ))
        )}

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary, marginTop: 32 }]}
          onPress={() => window.print ? window.print() : alert("Printing is only supported on Web.")}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>🖨️ Print / Save PDF</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  reportIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { fontSize: 22, fontFamily: "Inter-ExtraBold", marginBottom: 4 },
  sub: { fontSize: 14, fontFamily: "Inter-SemiBold" },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  cardTitle: { fontSize: 16, fontFamily: "Inter-Bold" },
  statValue: { fontSize: 32, fontFamily: "Inter-ExtraBold", marginBottom: 4 },
  statLabel: { fontSize: 11, fontFamily: "Inter-SemiBold" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter-ExtraBold", marginBottom: 16 },
  logRow: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    alignItems: "center",
  },
  logDate: { fontSize: 14, fontFamily: "Inter-Bold", marginBottom: 4 },
  logNotes: { fontSize: 12, fontFamily: "Inter-Regular" },
  logVital: { fontSize: 12, fontFamily: "Inter-SemiBold", marginBottom: 2 },
  btn: {
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 16, fontFamily: "Inter-Bold" },
});
