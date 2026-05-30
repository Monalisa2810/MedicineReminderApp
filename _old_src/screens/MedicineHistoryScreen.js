import { useEffect, useState, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Rect } from "react-native-svg";
import { useTheme } from "../utils/theme";
import { loadMedicineHistory } from "../utils/storage";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

function AdherenceChart({ data, colors }) {
  const barAnims = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = data.map((_, i) =>
      Animated.spring(barAnims[i], {
        toValue: 1,
        delay: i * 80,
        tension: 50,
        friction: 8,
        useNativeDriver: false,
      }),
    );
    Animated.stagger(50, animations).start();
  }, [data]);

  const maxVal = Math.max(...data.map((d) => d.total), 1);
  const barWidth = 28;
  const chartHeight = 120;

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartBars}>
        {data.map((d, i) => {
          const takenHeight = (d.taken / maxVal) * chartHeight;
          const missedHeight = ((d.total - d.taken) / maxVal) * chartHeight;

          return (
            <View key={d.day} style={styles.barGroup}>
              <View style={{ height: chartHeight, justifyContent: "flex-end" }}>
                {d.total > 0 ? (
                  <>
                    <Animated.View
                      style={{
                        width: barWidth,
                        height: barAnims[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, missedHeight],
                        }),
                        backgroundColor: colors.dangerLight,
                        borderTopLeftRadius: missedHeight > 0 && takenHeight === 0 ? 6 : 0,
                        borderTopRightRadius: missedHeight > 0 && takenHeight === 0 ? 6 : 0,
                      }}
                    />
                    <Animated.View
                      style={{
                        width: barWidth,
                        height: barAnims[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, takenHeight],
                        }),
                        backgroundColor: colors.success,
                        borderTopLeftRadius: 6,
                        borderTopRightRadius: 6,
                        borderBottomLeftRadius: 6,
                        borderBottomRightRadius: 6,
                      }}
                    />
                  </>
                ) : (
                  <View
                    style={{
                      width: barWidth,
                      height: 4,
                      backgroundColor: colors.border,
                      borderRadius: 2,
                    }}
                  />
                )}
              </View>
              <Text style={[styles.barLabel, { color: colors.sub }]}>{d.day}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.legendText, { color: colors.sub }]}>Taken</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.dangerLight }]} />
          <Text style={[styles.legendText, { color: colors.sub }]}>Missed</Text>
        </View>
      </View>
    </View>
  );
}

export default function MedicineHistoryScreen({ medicines }) {
  const { colors } = useTheme();
  const [history, setHistory] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const h = await loadMedicineHistory();
      setHistory(h);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    })();
  }, []);

  // Build 7-day chart data
  const chartData = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    const dayEntries = history.filter((h) => h.date === dateStr);
    const taken = dayEntries.filter((h) => h.taken).length;
    const total = dayEntries.length;
    chartData.push({
      day: dayNames[d.getDay()],
      date: dateStr,
      taken,
      total,
    });
  }

  // Calculate stats
  const totalEntries = history.length;
  const takenEntries = history.filter((h) => h.taken).length;
  const adherencePct = totalEntries > 0 ? Math.round((takenEntries / totalEntries) * 100) : 0;

  // Calculate streak
  let streak = 0;
  const today = new Date();
  for (let i = 0; i <= 90; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toDateString();
    const dayEntries = history.filter((h) => h.date === dateStr);
    if (dayEntries.length === 0) {
      if (i === 0) continue; // Today might not have entries yet
      break;
    }
    const allTaken = dayEntries.every((h) => h.taken);
    if (allTaken) streak++;
    else break;
  }

  // Recent history grouped by date
  const groupedHistory = {};
  history.slice(0, 30).forEach((h) => {
    if (!groupedHistory[h.date]) groupedHistory[h.date] = [];
    groupedHistory[h.date].push(h);
  });

  return (
    <Animated.View style={{ flex: 1, backgroundColor: colors.bg, opacity: fadeAnim }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{adherencePct}%</Text>
            <Text style={[styles.statLabel, { color: colors.sub }]}>Adherence</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.success }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: colors.sub }]}>Day Streak 🔥</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.warning }]}>{takenEntries}</Text>
            <Text style={[styles.statLabel, { color: colors.sub }]}>Doses Taken</Text>
          </View>
        </View>

        {/* Chart */}
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>
            Weekly Overview
          </Text>
          <Text style={[styles.chartSub, { color: colors.sub }]}>
            Last 7 days adherence
          </Text>
          <AdherenceChart data={chartData} colors={colors} />
        </View>

        {/* Timeline */}
        <Text style={[styles.timelineTitle, { color: colors.text }]}>
          Recent Activity
        </Text>

        {Object.keys(groupedHistory).length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>📊</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No history yet
            </Text>
            <Text style={[styles.emptySub, { color: colors.sub }]}>
              Mark medicines as taken to start{"\n"}building your adherence history
            </Text>
          </View>
        ) : (
          Object.entries(groupedHistory).map(([date, entries]) => (
            <View key={date} style={[styles.dayGroup, { borderColor: colors.border }]}>
              <View style={styles.dayHeader}>
                <View style={[styles.dayDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.dayDate, { color: colors.text }]}>{date}</Text>
                <Text style={[styles.dayCount, { color: colors.sub }]}>
                  {entries.filter((e) => e.taken).length}/{entries.length} taken
                </Text>
              </View>
              {entries.map((entry, idx) => (
                <View
                  key={`${entry.medicineId}-${idx}`}
                  style={[styles.entryRow, { borderBottomColor: colors.border }]}
                >
                  <View
                    style={[
                      styles.entryDot,
                      { backgroundColor: entry.taken ? colors.success : colors.danger },
                    ]}
                  />
                  <Text style={[styles.entryName, { color: colors.text }]}>
                    {entry.medicineName}
                  </Text>
                  <Text style={[styles.entryTime, { color: colors.sub }]}>
                    {entry.time}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter-Bold",
                      color: entry.taken ? colors.success : colors.danger,
                    }}
                  >
                    {entry.taken ? "✓" : "✗"}
                  </Text>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
  },
  statValue: { fontSize: 24, fontFamily: "Inter-ExtraBold", marginBottom: 4 },
  statLabel: { fontSize: 10, fontFamily: "Inter-SemiBold", textAlign: "center" },
  chartCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  chartTitle: { fontSize: 17, fontFamily: "Inter-Bold" },
  chartSub: { fontSize: 12, fontFamily: "Inter-Regular", marginTop: 2, marginBottom: 16 },
  chartContainer: { alignItems: "center" },
  chartBars: { flexDirection: "row", justifyContent: "space-between", width: "100%", paddingHorizontal: 8 },
  barGroup: { alignItems: "center", gap: 8 },
  barLabel: { fontSize: 11, fontFamily: "Inter-SemiBold" },
  legendRow: { flexDirection: "row", gap: 20, marginTop: 14 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, fontFamily: "Inter-SemiBold" },
  timelineTitle: { fontSize: 17, fontFamily: "Inter-ExtraBold", marginBottom: 14 },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
  },
  emptyTitle: { fontSize: 17, fontFamily: "Inter-Bold", marginBottom: 6 },
  emptySub: { fontSize: 13, fontFamily: "Inter-Regular", textAlign: "center", lineHeight: 19 },
  dayGroup: {
    marginBottom: 16,
    borderLeftWidth: 2,
    paddingLeft: 16,
    marginLeft: 6,
  },
  dayHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  dayDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: "absolute",
    left: -22,
  },
  dayDate: { fontSize: 14, fontFamily: "Inter-Bold", flex: 1 },
  dayCount: { fontSize: 12, fontFamily: "Inter-SemiBold" },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  entryDot: { width: 8, height: 8, borderRadius: 4 },
  entryName: { flex: 1, fontSize: 14, fontFamily: "Inter-SemiBold" },
  entryTime: { fontSize: 12, fontFamily: "Inter-Regular" },
});
