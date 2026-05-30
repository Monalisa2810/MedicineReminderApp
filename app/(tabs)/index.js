import React, { useRef, useEffect } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useRouter } from "expo-router";
import MedicineCard from "../../components/MedicineCard";
import { useTheme } from "../../utils/theme";
import { useAppContext } from "../../context/AppContext";

// Wrap Circle to strip out the web-incompatible 'collapsable' prop added by Animated
const WebSafeCircle = React.forwardRef(({ collapsable, ...props }, ref) => (
  <Circle {...props} ref={ref} />
));
const AnimatedCircle = Animated.createAnimatedComponent(WebSafeCircle);

function ProgressRing({ progress, size = 100, strokeWidth = 8 }) {
  const { colors } = useTheme();
  const animValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.spring(animValue, {
      toValue: progress,
      tension: 40,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeDashoffset = animValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>
      <View style={{ position: "absolute", alignItems: "center" }}>
        <Text style={{ fontSize: 24, fontFamily: "Inter-ExtraBold", color: colors.text }}>
          {Math.round(progress)}%
        </Text>
        <Text style={{ fontSize: 10, fontFamily: "Inter-SemiBold", color: colors.sub, marginTop: 1 }}>
          complete
        </Text>
      </View>
    </View>
  );
}

function AnimatedStatCard({ emoji, value, label, delay, colors }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, delay, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statNum, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.sub }]}>{label}</Text>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, medicines, appointments, toggleTaken, deleteMedicine } = useAppContext();
  
  const taken = medicines.filter((m) => m.taken).length;
  const total = medicines.length;
  const pct = total > 0 ? (taken / total) * 100 : 0;

  const upcomingAppt = appointments?.find((a) => new Date(a.date) > new Date());

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    if (h < 21) return "Good Evening";
    return "Good Night";
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const userName = user?.name?.split(" ")[0] || "there";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting & SOS */}
      <Animated.View
        style={[styles.greeting, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.greetTitle, { color: colors.text }]}>
            {getGreeting()}, {userName}! 👋
          </Text>
          <Text style={[styles.greetSub, { color: colors.sub }]}>{today}</Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity 
            style={[styles.sosBadge, { backgroundColor: colors.danger }]}
            onPress={() => router.push("/emergency")}
          >
            <Text style={{ color: '#fff', fontFamily: 'Inter-ExtraBold', fontSize: 13 }}>SOS</Text>
          </TouchableOpacity>
          <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
            <Text style={{ color: colors.primary, fontFamily: "Inter-ExtraBold", fontSize: 16 }}>
              {userName[0]?.toUpperCase() || "U"}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Hero Card with Progress Ring */}
      <Animated.View
        style={[styles.heroCard, { backgroundColor: colors.primary, opacity: fadeAnim }]}
      >
        <View style={styles.heroContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Today's Overview</Text>
            <Text style={styles.heroSub}>
              {total === 0
                ? "No medicines yet.\nAdd one to get started!"
                : taken === total
                  ? `All ${total} medicines taken! 🎉`
                  : `${taken} of ${total} medicines taken`}
            </Text>
            {total > 0 && taken < total && (
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>
                  {total - taken} remaining
                </Text>
              </View>
            )}
          </View>
          {total > 0 && (
            <View style={styles.ringContainer}>
              <ProgressRing progress={pct} size={90} strokeWidth={7} />
            </View>
          )}
        </View>
      </Animated.View>

      {/* Stats */}
      <View style={styles.statRow}>
        <AnimatedStatCard emoji="💊" value={total} label="Total Meds" delay={100} colors={colors} />
        <AnimatedStatCard emoji="✅" value={taken} label="Taken Today" delay={200} colors={colors} />
        <AnimatedStatCard emoji="⏳" value={total - taken} label="Remaining" delay={300} colors={colors} />
      </View>

      {/* Upcoming Appointment Widget */}
      {upcomingAppt && (
        <TouchableOpacity 
          style={[styles.apptWidget, { backgroundColor: colors.card, borderColor: colors.primary }]}
          onPress={() => router.push("/doctors")}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginRight: 12 }}>🗓️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontFamily: 'Inter-Bold', color: colors.primary, marginBottom: 2 }}>Upcoming Consultation</Text>
              <Text style={{ fontSize: 15, fontFamily: 'Inter-ExtraBold', color: colors.text }}>{upcomingAppt.doctorName}</Text>
              <Text style={{ fontSize: 12, fontFamily: 'Inter-SemiBold', color: colors.sub, marginTop: 2 }}>
                {new Date(upcomingAppt.date).toLocaleDateString()} at {new Date(upcomingAppt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Care Services Banner */}
      <TouchableOpacity 
        style={[styles.careBanner, { backgroundColor: colors.primaryLight }]}
        onPress={() => router.push("/doctors")}
        activeOpacity={0.8}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontFamily: 'Inter-ExtraBold', color: colors.primary, marginBottom: 4 }}>Need a doctor?</Text>
          <Text style={{ fontSize: 12, fontFamily: 'Inter-SemiBold', color: colors.primary, opacity: 0.8 }}>Book a specialist consultation now.</Text>
        </View>
        <View style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}>
          <Text style={{ color: '#fff', fontFamily: 'Inter-Bold', fontSize: 12 }}>Book Now</Text>
        </View>
      </TouchableOpacity>

      {/* Medicine List */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Today's Schedule
        </Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/medicines")}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        {medicines.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.emptyIcon}>
              <Text style={{ fontSize: 40 }}>💊</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No medicines yet
            </Text>
            <Text style={[styles.emptySub, { color: colors.sub }]}>
              Start by adding your first medicine reminder
            </Text>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/(tabs)/medicines")}
              activeOpacity={0.8}
            >
              <Text style={styles.addBtnText}>+ Add Medicine</Text>
            </TouchableOpacity>
          </View>
        ) : (
          medicines.slice(0, 3).map((m) => (
            <MedicineCard
              key={m.id}
              medicine={m}
              onToggle={toggleTaken}
              onDelete={deleteMedicine}
            />
          ))
        )}
      </View>

      {/* Refill alerts */}
      {medicines.filter((m) => m.pillsRemaining !== null && m.refillAt && m.pillsRemaining <= m.refillAt).length > 0 && (
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Text style={[styles.sectionTitle, { color: colors.danger, paddingHorizontal: 4, marginBottom: 10 }]}>
            ⚠️ Refill Needed
          </Text>
          {medicines
            .filter((m) => m.pillsRemaining !== null && m.refillAt && m.pillsRemaining <= m.refillAt)
            .map((m) => (
              <View
                key={m.id}
                style={[styles.refillCard, { backgroundColor: colors.dangerLight, borderColor: colors.danger + "30" }]}
              >
                <Text style={{ fontSize: 14, fontFamily: "Inter-SemiBold", color: colors.danger }}>
                  {m.name} — {m.pillsRemaining} pills left
                </Text>
              </View>
            ))}
        </View>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  greeting: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 56,
    paddingBottom: 8,
  },
  greetTitle: { fontSize: 22, fontFamily: "Inter-ExtraBold" },
  greetSub: { fontSize: 13, marginTop: 3, fontFamily: "Inter-Regular" },
  sosBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 22,
    padding: 22,
    shadowColor: "#4F6EF7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroTitle: { color: "#fff", fontSize: 19, fontFamily: "Inter-ExtraBold" },
  heroSub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 6,
    fontFamily: "Inter-Regular",
    lineHeight: 19,
  },
  heroBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  heroBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
  },
  ringContainer: {
    marginLeft: 12,
  },
  statRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "rgba(0,0,0,0.04)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  statEmoji: { fontSize: 22, marginBottom: 6 },
  statNum: { fontSize: 22, fontFamily: "Inter-ExtraBold" },
  statLabel: {
    fontSize: 10,
    fontFamily: "Inter-SemiBold",
    marginTop: 3,
    textAlign: "center",
  },
  apptWidget: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  careBanner: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  sectionTitle: { fontSize: 16, fontFamily: "Inter-ExtraBold" },
  seeAll: { fontSize: 13, fontFamily: "Inter-Bold" },
  emptyState: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: { fontSize: 17, fontFamily: "Inter-Bold", marginBottom: 6 },
  emptySub: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 18,
    fontFamily: "Inter-Regular",
    lineHeight: 19,
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
  addBtnText: { color: "#fff", fontFamily: "Inter-Bold", fontSize: 14 },
  refillCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
});
