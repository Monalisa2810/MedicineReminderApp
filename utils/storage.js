import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Medicines ─────────────────────────────────────────────
export const saveMedicines = async (medicines) => {
  await AsyncStorage.setItem("medicines", JSON.stringify(medicines));
};

export const loadMedicines = async () => {
  const data = await AsyncStorage.getItem("medicines");
  return data ? JSON.parse(data) : [];
};

// ─── Health Logs ───────────────────────────────────────────
export const saveHealthLogs = async (logs) => {
  await AsyncStorage.setItem("healthLogs", JSON.stringify(logs));
};

export const loadHealthLogs = async () => {
  const data = await AsyncStorage.getItem("healthLogs");
  return data ? JSON.parse(data) : [];
};

// ─── Medicine History (Adherence) ──────────────────────────
export const saveMedicineHistory = async (entry) => {
  const history = await loadMedicineHistory();
  history.unshift(entry);
  // Keep last 90 days of history
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const trimmed = history.filter((h) => h.timestamp >= cutoff);
  await AsyncStorage.setItem("medicineHistory", JSON.stringify(trimmed));
};

export const loadMedicineHistory = async () => {
  const data = await AsyncStorage.getItem("medicineHistory");
  return data ? JSON.parse(data) : [];
};

// ─── Daily Reset Tracking ──────────────────────────────────
export const getLastResetDate = async () => {
  return await AsyncStorage.getItem("lastResetDate");
};

export const setLastResetDate = async (dateStr) => {
  await AsyncStorage.setItem("lastResetDate", dateStr);
};

// ─── Phase 2 Features ──────────────────────────────────────
export const saveAppointments = async (appointments) => {
  await AsyncStorage.setItem("appointments", JSON.stringify(appointments));
};

export const loadAppointments = async () => {
  const data = await AsyncStorage.getItem("appointments");
  return data ? JSON.parse(data) : [];
};

export const saveEmergencyContacts = async (contacts) => {
  await AsyncStorage.setItem("emergencyContacts", JSON.stringify(contacts));
};

export const loadEmergencyContacts = async () => {
  const data = await AsyncStorage.getItem("emergencyContacts");
  return data ? JSON.parse(data) : [];
};
