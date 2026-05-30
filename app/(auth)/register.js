import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { registerUser } from '../../utils/auth';
import { useAppContext } from '../../context/AppContext';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAppContext();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [age, setAge] = useState('');
  const [blood, setBlood] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (!name.trim()) { Alert.alert('Required', 'Please enter your full name'); return; }
    if (!email.trim()) { Alert.alert('Required', 'Please enter your email'); return; }
    if (!password.trim()) { Alert.alert('Required', 'Please enter a password'); return; }
    if (password.length < 6) { Alert.alert('Weak Password', 'Password must be at least 6 characters'); return; }
    if (password !== confirm) { Alert.alert('Mismatch', 'Passwords do not match'); return; }
    if (!age.trim()) { Alert.alert('Required', 'Please enter your age'); return; }

    setLoading(true);
    try {
      await registerUser(name.trim(), email.trim(), password, age.trim(), blood);
      const user = { name: name.trim(), email: email.trim(), age: age.trim(), blood };
      
      if (Platform.OS === 'web') {
        window.alert('Account Created! 🎉 Welcome to MediCare!');
        login(user);
      } else {
        Alert.alert('Account Created! 🎉', 'Welcome to MediCare!', [
          { text: 'Get Started', onPress: () => login(user) },
        ]);
      }
    } catch (e) {
      Alert.alert('Registration Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  const strengthPct = password.length === 0 ? 0 : password.length < 6 ? 33 : password.length < 10 ? 66 : 100;
  const strengthColor = password.length === 0 ? '#E2E8F5' : password.length < 6 ? '#EF4444' : password.length < 10 ? '#F59E0B' : '#10B981';
  const strengthLabel = password.length === 0 ? '' : password.length < 6 ? 'Weak' : password.length < 10 ? 'Medium' : 'Strong';

  const currentStep = name && email ? (password ? (blood ? 3 : 2) : 1) : 0;

  return (
    <LinearGradient colors={['#4F6EF7', '#7C5CF6', '#A78BFA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backText}>← Back to Login</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join MediCare and never miss a dose</Text>

            {/* Progress Steps */}
            <View style={styles.progressRow}>
              {['Personal', 'Security', 'Health'].map((step, i) => (
                <View key={step} style={styles.progressItem}>
                  <View style={[styles.progressDot, { backgroundColor: i <= currentStep ? '#fff' : 'rgba(255,255,255,0.3)' }]}>
                    <Text style={{ color: i <= currentStep ? '#4F6EF7' : 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'Inter-Bold' }}>
                      {i < currentStep ? '✓' : i + 1}
                    </Text>
                  </View>
                  {i < 2 && <View style={[styles.progressLine, { backgroundColor: i < currentStep ? '#fff' : 'rgba(255,255,255,0.2)' }]} />}
                  <Text style={[styles.progressLabel, { color: i <= currentStep ? '#fff' : 'rgba(255,255,255,0.5)' }]}>{step}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Form Card */}
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {/* Personal Info */}
            <Text style={styles.sectionTitle}>👤 Personal Information</Text>

            <Text style={styles.label}>FULL NAME</Text>
            <View style={styles.inputWrap}>
              <TextInput style={styles.input} placeholder="e.g. Alex Johnson" placeholderTextColor="#A0A8C0"
                value={name} onChangeText={setName} />
            </View>

            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <View style={styles.inputWrap}>
              <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor="#A0A8C0"
                value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>

            <Text style={styles.label}>AGE</Text>
            <View style={styles.inputWrap}>
              <TextInput style={styles.input} placeholder="e.g. 34" placeholderTextColor="#A0A8C0"
                value={age} onChangeText={setAge} keyboardType="numeric" maxLength={3} />
            </View>

            {/* Security */}
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionTitle}>🔒 Security</Text>

            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.inputWrap}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Min. 6 characters" placeholderTextColor="#A0A8C0"
                value={password} onChangeText={setPassword} secureTextEntry={!showPass} />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Text style={{ fontSize: 16 }}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            {password.length > 0 && (
              <View style={styles.strengthRow}>
                <View style={styles.strengthBarBg}>
                  <Animated.View style={[styles.strengthBarFill, { width: `${strengthPct}%`, backgroundColor: strengthColor }]} />
                </View>
                <Text style={[styles.strengthLabelText, { color: strengthColor }]}>{strengthLabel}</Text>
              </View>
            )}

            <Text style={styles.label}>CONFIRM PASSWORD</Text>
            <View style={[styles.inputWrap, confirm && { borderColor: confirm === password ? '#10B981' : '#EF4444' }]}>
              <TextInput style={styles.input} placeholder="Re-enter your password" placeholderTextColor="#A0A8C0"
                value={confirm} onChangeText={setConfirm} secureTextEntry={!showPass} />
            </View>
            {confirm.length > 0 && (
              <Text style={{ fontSize: 12, color: confirm === password ? '#10B981' : '#EF4444', marginTop: 4, fontFamily: 'Inter-SemiBold' }}>
                {confirm === password ? '✓ Passwords match' : '✗ Passwords do not match'}
              </Text>
            )}

            {/* Health */}
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionTitle}>🩺 Health Information</Text>
            <Text style={styles.label}>BLOOD GROUP</Text>
            <View style={styles.bloodGrid}>
              {BLOOD_TYPES.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[styles.bloodBtn, {
                    borderColor: blood === b ? '#EF4444' : '#E2E8F5',
                    backgroundColor: blood === b ? '#FEE2E2' : '#F8F9FF',
                  }]}
                  onPress={() => setBlood(b)}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: blood === b ? '#EF4444' : '#6B7494' }}>
                    {b}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Terms & Submit */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={{ color: '#fff', fontFamily: 'Inter-SemiBold' }}>Terms of Service</Text> and{' '}
              <Text style={{ color: '#fff', fontFamily: 'Inter-SemiBold' }}>Privacy Policy</Text>
            </Text>

            <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator color="#4F6EF7" />
              ) : (
                <Text style={styles.registerBtnText}>Create My Account 🎉</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={{ alignItems: 'center', marginTop: 16 }} onPress={() => router.back()}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontFamily: 'Inter-Regular' }}>
                Already have an account?{' '}
                <Text style={{ color: '#fff', fontFamily: 'Inter-Bold' }}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingTop: 52 },
  backBtn: { marginBottom: 20 },
  backText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontFamily: 'Inter-SemiBold' },
  title: { fontSize: 30, fontFamily: 'Inter-ExtraBold', color: '#fff', textShadowColor: 'rgba(0,0,0,0.1)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontFamily: 'Inter-Regular', marginBottom: 24 },
  progressRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 28 },
  progressItem: { alignItems: 'center', flexDirection: 'row', gap: 0 },
  progressDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  progressLine: { width: 40, height: 2, marginHorizontal: 4 },
  progressLabel: { fontSize: 10, fontFamily: 'Inter-SemiBold', position: 'absolute', bottom: -18, width: 60, textAlign: 'center', left: -15 },
  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 8,
  },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter-Bold', color: '#1A1F36', marginBottom: 14 },
  sectionDivider: { height: 1, backgroundColor: '#E2E8F5', marginVertical: 20 },
  label: { fontSize: 11, fontFamily: 'Inter-Bold', color: '#6B7494', letterSpacing: 0.8, marginBottom: 6, marginTop: 14 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F5',
    borderRadius: 14, backgroundColor: '#F8F9FF', paddingHorizontal: 4, marginBottom: 4,
  },
  input: { flex: 1, padding: 13, fontSize: 15, color: '#1A1F36', fontFamily: 'Inter-Regular' },
  eyeBtn: { padding: 10 },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6, marginBottom: 4 },
  strengthBarBg: { flex: 1, height: 4, backgroundColor: '#E2E8F5', borderRadius: 2, overflow: 'hidden' },
  strengthBarFill: { height: 4, borderRadius: 2 },
  strengthLabelText: { fontSize: 11, fontFamily: 'Inter-Bold', width: 50 },
  bloodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  bloodBtn: { width: '22%', paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, alignItems: 'center' },
  termsText: { fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 20, marginVertical: 16, fontFamily: 'Inter-Regular' },
  registerBtn: {
    backgroundColor: '#fff', borderRadius: 16, padding: 17, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 6,
  },
  registerBtnText: { color: '#4F6EF7', fontSize: 16, fontFamily: 'Inter-Bold' },
});
