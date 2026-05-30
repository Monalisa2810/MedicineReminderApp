import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";

import AddMedicineScreen from "./screens/AddMedicineScreen";
import HealthLogScreen from "./screens/HealthLogScreen";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import MedicineHistoryScreen from "./screens/MedicineHistoryScreen";
import MedicineListScreen from "./screens/MedicineListScreen";
import RegisterScreen from "./screens/RegisterScreen";

import { getCurrentUser, logoutUser } from "./utils/auth";
import {
  cancelNotification,
  registerForPushNotifications,
  scheduleMedicineNotification,
  scheduleRefillNotification,
} from "./utils/notifications";
import {
  getLastResetDate,
  loadHealthLogs,
  loadMedicines,
  saveHealthLogs,
  saveMedicineHistory,
  saveMedicines,
  setLastResetDate,
} from "./utils/storage";
import { ThemeProvider, useTheme } from "./utils/theme";

SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

function AppContent() {
  const { dark, toggle, colors } = useTheme();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [healthLogs, setHealthLogs] = useState([]);

  const [fontsLoaded] = useFonts({
    "Inter-Regular": Inter_400Regular,
    "Inter-Medium": Inter_500Medium,
    "Inter-SemiBold": Inter_600SemiBold,
    "Inter-Bold": Inter_700Bold,
    "Inter-ExtraBold": Inter_800ExtraBold,
  });

  // ── Daily reset of 'taken' status ───────────────────────
  const checkDailyReset = useCallback(async (meds) => {
    const today = new Date().toDateString();
    const lastReset = await getLastResetDate();
    if (lastReset !== today) {
      const resetMeds = meds.map((m) => ({ ...m, taken: false }));
      setMedicines(resetMeds);
      await saveMedicines(resetMeds);
      await setLastResetDate(today);
      return resetMeds;
    }
    return meds;
  }, []);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (u) {
        setUser(u);
        await registerForPushNotifications();
        const meds = await loadMedicines();
        const finalMeds = await checkDailyReset(meds);
        setMedicines(finalMeds);
        setHealthLogs(await loadHealthLogs());
      }
      setAuthChecked(true);
    })();
  }, [checkDailyReset]);

  const onLayoutReady = useCallback(async () => {
    if (fontsLoaded && authChecked) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authChecked]);

  const handleLogin = async (u) => {
    setUser(u);
    await registerForPushNotifications();
    const meds = await loadMedicines();
    const finalMeds = await checkDailyReset(meds);
    setMedicines(finalMeds);
    setHealthLogs(await loadHealthLogs());
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logoutUser();
          setUser(null);
          setMedicines([]);
          setHealthLogs([]);
        },
      },
    ]);
  };

  // ── Medicine CRUD ───────────────────────────────────────
  const addMedicine = useCallback(
    async (med) => {
      const newMed = { ...med, id: Date.now(), pillsRemaining: med.totalPills || null };
      const notifId = await scheduleMedicineNotification(newMed);
      newMed.notificationId = notifId;
      const updated = [...medicines, newMed];
      setMedicines(updated);
      await saveMedicines(updated);
    },
    [medicines],
  );

  const editMedicine = useCallback(
    async (id, updatedData) => {
      const updated = medicines.map((m) => {
        if (m.id === id) {
          return { ...m, ...updatedData };
        }
        return m;
      });
      setMedicines(updated);
      await saveMedicines(updated);
      // Reschedule notification if time changed
      const med = updated.find((m) => m.id === id);
      if (med && updatedData.time) {
        await cancelNotification(med.notificationId);
        const newNotifId = await scheduleMedicineNotification(med);
        const final = updated.map((m) =>
          m.id === id ? { ...m, notificationId: newNotifId } : m,
        );
        setMedicines(final);
        await saveMedicines(final);
      }
    },
    [medicines],
  );

  const toggleTaken = useCallback(
    async (id) => {
      const med = medicines.find((m) => m.id === id);
      const newTaken = !med.taken;
      let updated = medicines.map((m) =>
        m.id === id ? { ...m, taken: newTaken } : m,
      );

      // Decrement pill count if marking as taken and has pill tracking
      if (newTaken && med.pillsRemaining !== null && med.pillsRemaining > 0) {
        updated = updated.map((m) =>
          m.id === id
            ? { ...m, pillsRemaining: m.pillsRemaining - 1 }
            : m,
        );
        const updatedMed = updated.find((m) => m.id === id);
        // Check refill threshold
        if (
          updatedMed.refillAt &&
          updatedMed.pillsRemaining <= updatedMed.refillAt
        ) {
          await scheduleRefillNotification(updatedMed);
        }
      }

      setMedicines(updated);
      await saveMedicines(updated);

      // Save to history
      await saveMedicineHistory({
        medicineId: id,
        medicineName: med.name,
        date: new Date().toDateString(),
        time: med.time,
        taken: newTaken,
        timestamp: Date.now(),
      });
    },
    [medicines],
  );

  const deleteMedicine = useCallback(
    async (id) => {
      const med = medicines.find((m) => m.id === id);
      if (med?.notificationId) {
        await cancelNotification(med.notificationId);
      }
      const updated = medicines.filter((m) => m.id !== id);
      setMedicines(updated);
      await saveMedicines(updated);
    },
    [medicines],
  );

  const addHealthLog = useCallback(
    async (log) => {
      const updated = [log, ...healthLogs];
      setHealthLogs(updated);
      await saveHealthLogs(updated);
    },
    [healthLogs],
  );

  if (!fontsLoaded || !authChecked) return null;

  // ── Tab bar icon component ──────────────────────────────
  const TabIcon = ({ emoji, focused }) => (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 44,
        height: 30,
        borderRadius: 15,
        backgroundColor: focused ? colors.primaryLight : "transparent",
      }}
    >
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
    </View>
  );

  // AUTH FLOW
  if (!user) {
    return (
      <View style={{ flex: 1 }} onLayout={onLayoutReady}>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" />
          <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
            </AuthStack.Screen>
            <AuthStack.Screen name="Register">
              {(props) => <RegisterScreen {...props} onLogin={handleLogin} />}
            </AuthStack.Screen>
          </AuthStack.Navigator>
        </NavigationContainer>
      </View>
    );
  }

  // ── Medicine Stack ──────────────────────────────────────
  function MedicinesStack() {
    return (
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: "Inter-Bold", fontSize: 17 },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="MedicinesList"
          options={({ navigation }) => ({
            title: "My Medicines",
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate("AddMedicine")}
                style={{
                  backgroundColor: colors.primaryLight,
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                }}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontFamily: "Inter-Bold",
                    fontSize: 13,
                  }}
                >
                  + Add
                </Text>
              </TouchableOpacity>
            ),
          })}
        >
          {(props) => (
            <MedicineListScreen
              {...props}
              medicines={medicines}
              onToggle={toggleTaken}
              onDelete={deleteMedicine}
              onEdit={(med) =>
                props.navigation.navigate("AddMedicine", { medicine: med })
              }
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="AddMedicine"
          options={({ route }) => ({
            title: route.params?.medicine ? "Edit Medicine" : "Add Medicine",
          })}
        >
          {(props) => (
            <AddMedicineScreen
              {...props}
              onSave={addMedicine}
              onEdit={editMedicine}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  // MAIN APP FLOW
  return (
    <View style={{ flex: 1 }} onLayout={onLayoutReady}>
      <NavigationContainer>
        <StatusBar barStyle={colors.statusBar} />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarStyle: {
              backgroundColor: colors.tabBar,
              borderTopColor: colors.tabBorder,
              height: 64,
              paddingBottom: 8,
              paddingTop: 4,
              elevation: 0,
              shadowOpacity: 0,
              borderTopWidth: 1,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.sub,
            tabBarLabelStyle: {
              fontFamily: "Inter-SemiBold",
              fontSize: 10,
              marginTop: 2,
            },
            tabBarIcon: ({ focused }) => {
              const icons = {
                Home: "🏠",
                Medicines: "💊",
                History: "📊",
                Health: "🩺",
                Profile: "👤",
              };
              return <TabIcon emoji={icons[route.name]} focused={focused} />;
            },
            headerStyle: {
              backgroundColor: colors.card,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: colors.text,
            headerTitleStyle: { fontFamily: "Inter-Bold", fontSize: 17 },
            headerShadowVisible: false,
          })}
        >
          <Tab.Screen name="Home" options={{ headerShown: false }}>
            {(props) => (
              <HomeScreen
                {...props}
                medicines={medicines}
                onToggle={toggleTaken}
                onDelete={deleteMedicine}
                user={user}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Medicines"
            component={MedicinesStack}
            options={{ headerShown: false }}
          />

          <Tab.Screen name="History" options={{ title: "History" }}>
            {(props) => (
              <MedicineHistoryScreen {...props} medicines={medicines} />
            )}
          </Tab.Screen>

          <Tab.Screen name="Health" options={{ title: "Health Log" }}>
            {(props) => (
              <HealthLogScreen
                {...props}
                logs={healthLogs}
                onSave={addHealthLog}
              />
            )}
          </Tab.Screen>

          <Tab.Screen name="Profile" options={{ title: "Profile" }}>
            {() => (
              <ProfileTab
                user={user}
                onLogout={handleLogout}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}

// ── Profile Tab ──────────────────────────────────────────
function ProfileTab({ user, onLogout }) {
  const { dark, toggle, colors } = useTheme();
  const scaleAnim = new Animated.Value(1);

  const animatePress = (callback) => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
    callback?.();
  };

  const menuItems = [
    ["👤", "Personal Info"],
    ["📞", "Emergency Contacts"],
    ["🩺", "My Doctor"],
    ["📄", "Health Reports"],
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 20 }}>
      {/* User Card */}
      <View
        style={{
          borderRadius: 20,
          padding: 24,
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          marginBottom: 20,
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: "rgba(255,255,255,0.2)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontFamily: "Inter-ExtraBold",
              color: "#fff",
            }}
          >
            {user.name ? user.name[0].toUpperCase() : "U"}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontFamily: "Inter-ExtraBold",
            }}
          >
            {user.name}
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: 13,
              fontFamily: "Inter-Regular",
              marginTop: 2,
            }}
          >
            {user.age ? `Age: ${user.age}` : ""}
            {user.blood ? ` · Blood: ${user.blood}` : ""}
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: 12,
              fontFamily: "Inter-Regular",
              marginTop: 2,
            }}
          >
            {user.email}
          </Text>
        </View>
      </View>

      {menuItems.map(([icon, label]) => (
        <TouchableOpacity
          key={label}
          activeOpacity={0.7}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            backgroundColor: colors.card,
            borderRadius: 14,
            padding: 16,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 20 }}>{icon}</Text>
          <Text
            style={{
              flex: 1,
              fontSize: 15,
              fontFamily: "Inter-SemiBold",
              color: colors.text,
            }}
          >
            {label}
          </Text>
          <Text style={{ color: colors.sub, fontSize: 18 }}>›</Text>
        </TouchableOpacity>
      ))}

      {/* Dark Mode Toggle */}
      <TouchableOpacity
        onPress={() => animatePress(toggle)}
        activeOpacity={0.7}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          backgroundColor: colors.card,
          borderRadius: 14,
          padding: 16,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text style={{ fontSize: 20 }}>{dark ? "☀️" : "🌙"}</Text>
        <Text
          style={{
            flex: 1,
            fontSize: 15,
            fontFamily: "Inter-SemiBold",
            color: colors.text,
          }}
        >
          {dark ? "Light Mode" : "Dark Mode"}
        </Text>
        <View
          style={{
            width: 48,
            height: 26,
            backgroundColor: dark ? colors.primary : colors.border,
            borderRadius: 13,
            padding: 3,
            justifyContent: "center",
          }}
        >
          <Animated.View
            style={{
              width: 20,
              height: 20,
              backgroundColor: "#fff",
              borderRadius: 10,
              marginLeft: dark ? 22 : 0,
              elevation: 3,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
            }}
          />
        </View>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        onPress={onLogout}
        activeOpacity={0.7}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          backgroundColor: colors.dangerLight,
          borderRadius: 14,
          padding: 16,
          marginTop: 4,
          borderWidth: 1,
          borderColor: dark ? "#3B1515" : "#FECACA",
        }}
      >
        <Text style={{ fontSize: 20 }}>🚪</Text>
        <Text
          style={{
            flex: 1,
            fontSize: 15,
            fontFamily: "Inter-SemiBold",
            color: colors.danger,
          }}
        >
          Sign Out
        </Text>
      </TouchableOpacity>

      <Text
        style={{
          textAlign: "center",
          color: colors.sub,
          fontSize: 12,
          fontFamily: "Inter-Regular",
          marginTop: 24,
        }}
      >
        MediCare v2.0.0 · Made with ❤️
      </Text>
    </View>
  );
}

// ── Root with ThemeProvider ───────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
