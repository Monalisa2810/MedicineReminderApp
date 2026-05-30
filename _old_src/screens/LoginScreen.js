import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { loginUser } from "../utils/auth";

const { width } = Dimensions.get("window");

export default function LoginScreen({ navigation, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const iconFloat = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        tension: 50,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating pill animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconFloat, {
          toValue: -8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(iconFloat, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Required", "Please enter your email");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Required", "Please enter your password");
      return;
    }
    setLoading(true);
    try {
      const user = await loginUser(email.trim(), password);
      onLogin(user);
    } catch (e) {
      Alert.alert("Login Failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#4F6EF7", "#7C5CF6", "#A78BFA"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <Animated.View
            style={[
              styles.hero,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.heroIcon,
                { transform: [{ translateY: iconFloat }] },
              ]}
            >
              <Text style={{ fontSize: 48 }}>💊</Text>
            </Animated.View>
            <Text style={styles.appName}>MediCare</Text>
            <Text style={styles.appTagline}>
              Your personal medicine companion
            </Text>
          </Animated.View>

          {/* Card */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                transform: [{ scale: cardScale }],
              },
            ]}
          >
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSub}>Sign in to continue</Text>

            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <View
              style={[
                styles.inputWrap,
                emailFocused && styles.inputFocused,
              ]}
            >
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#A0A8C0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>

            <Text style={styles.label}>PASSWORD</Text>
            <View
              style={[
                styles.inputWrap,
                passFocused && styles.inputFocused,
              ]}
            >
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter your password"
                placeholderTextColor="#A0A8C0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
              />
              <TouchableOpacity
                onPress={() => setShowPass(!showPass)}
                style={styles.eyeBtn}
              >
                <Text style={{ fontSize: 16 }}>
                  {showPass ? "🙈" : "👁️"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#4F6EF7", "#7C5CF6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginBtnText}>Sign In →</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => navigation.navigate("Register")}
              activeOpacity={0.7}
            >
              <Text style={styles.registerBtnText}>Create New Account</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.Text style={[styles.footer, { opacity: fadeAnim }]}>
            MediCare v2.0.0 · Your health, our priority
          </Animated.Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingTop: 70, paddingBottom: 40 },
  hero: { alignItems: "center", marginBottom: 32 },
  heroIcon: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  appName: {
    fontSize: 36,
    fontFamily: "Inter-ExtraBold",
    color: "#fff",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  appTagline: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    marginTop: 6,
    fontFamily: "Inter-Regular",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: "Inter-ExtraBold",
    color: "#1A1F36",
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 14,
    color: "#6B7494",
    marginBottom: 24,
    fontFamily: "Inter-Regular",
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter-Bold",
    color: "#6B7494",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 14,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F5",
    borderRadius: 14,
    backgroundColor: "#F8F9FF",
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  inputFocused: {
    borderColor: "#4F6EF7",
    backgroundColor: "#FAFBFF",
    shadowColor: "#4F6EF7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: "#1A1F36",
    fontFamily: "Inter-Regular",
  },
  eyeBtn: { padding: 8 },
  forgotBtn: { alignSelf: "flex-end", marginTop: 8, marginBottom: 22 },
  forgotText: {
    color: "#4F6EF7",
    fontSize: 13,
    fontFamily: "Inter-SemiBold",
  },
  loginBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#4F6EF7",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  loginGradient: {
    padding: 17,
    alignItems: "center",
    borderRadius: 16,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter-Bold",
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  divider: { flex: 1, height: 1, backgroundColor: "#E2E8F5" },
  dividerText: {
    marginHorizontal: 14,
    color: "#A0A8C0",
    fontSize: 13,
    fontFamily: "Inter-Regular",
  },
  registerBtn: {
    borderWidth: 1.5,
    borderColor: "#4F6EF7",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  registerBtnText: {
    color: "#4F6EF7",
    fontSize: 15,
    fontFamily: "Inter-Bold",
  },
  footer: {
    textAlign: "center",
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 28,
    fontFamily: "Inter-Regular",
  },
});