import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { getCurrentUser, logoutUser } from '../utils/auth';
import {
  cancelNotification,
  registerForPushNotifications,
  scheduleMedicineNotification,
  scheduleRefillNotification,
} from '../utils/notifications';
import {
  getLastResetDate,
  loadHealthLogs,
  loadMedicines,
  saveHealthLogs,
  saveMedicineHistory,
  saveMedicines,
  setLastResetDate,
  loadAppointments,
  saveAppointments,
  loadEmergencyContacts,
  saveEmergencyContacts,
} from '../utils/storage';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [healthLogs, setHealthLogs] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);

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
        setAppointments(await loadAppointments());
        setEmergencyContacts(await loadEmergencyContacts());
      }
      setAuthChecked(true);
    })();
  }, [checkDailyReset]);

  // Web foreground notification check
  useEffect(() => {
    if (Platform.OS !== 'web' || medicines.length === 0) return;

    const checkAlarms = () => {
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;

      medicines.forEach((med) => {
        if (!med.taken && med.time === currentTime) {
          const lastAlertedKey = `alerted_${med.id}_${now.toDateString()}`;
          if (!sessionStorage.getItem(lastAlertedKey)) {
            sessionStorage.setItem(lastAlertedKey, 'true');
            window.alert(`💊 Time to take ${med.name} — ${med.dosage}\nNotes: ${med.notes || 'None'}`);
          }
        }
      });
    };

    // Check immediately upon mount or medicines change
    checkAlarms();

    const interval = setInterval(checkAlarms, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [medicines]);

  const login = async (u) => {
    setUser(u);
    await registerForPushNotifications();
    const meds = await loadMedicines();
    const finalMeds = await checkDailyReset(meds);
    setMedicines(finalMeds);
    setHealthLogs(await loadHealthLogs());
    setAppointments(await loadAppointments());
    setEmergencyContacts(await loadEmergencyContacts());
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setMedicines([]);
    setHealthLogs([]);
    setAppointments([]);
    setEmergencyContacts([]);
  };

  const addMedicine = async (med) => {
    const newMed = { ...med, id: Date.now().toString(), pillsRemaining: med.totalPills || null };
    const notifId = await scheduleMedicineNotification(newMed);
    newMed.notificationId = notifId;
    
    setMedicines((prev) => {
      const updated = [...prev, newMed];
      saveMedicines(updated);
      return updated;
    });
  };

  const editMedicine = async (id, updatedData) => {
    let finalUpdated = [];
    setMedicines((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, ...updatedData } : m));
      finalUpdated = updated;
      saveMedicines(updated);
      return updated;
    });
    
    const med = finalUpdated.find((m) => m.id === id);
    if (med && updatedData.time) {
      if (med.notificationId) await cancelNotification(med.notificationId);
      const newNotifId = await scheduleMedicineNotification(med);
      setMedicines((prev) => {
        const final = prev.map((m) => (m.id === id ? { ...m, notificationId: newNotifId } : m));
        saveMedicines(final);
        return final;
      });
    }
  };

  const toggleTaken = async (id) => {
    setMedicines((prev) => {
      const med = prev.find((m) => m.id === id);
      if (!med) return prev;
      const newTaken = !med.taken;
      
      let updated = prev.map((m) => (m.id === id ? { ...m, taken: newTaken } : m));
      
      if (newTaken && med.pillsRemaining !== null && med.pillsRemaining > 0) {
        updated = updated.map((m) =>
          m.id === id ? { ...m, pillsRemaining: m.pillsRemaining - 1 } : m
        );
        const updatedMed = updated.find((m) => m.id === id);
        if (updatedMed.refillAt && updatedMed.pillsRemaining <= updatedMed.refillAt) {
          scheduleRefillNotification(updatedMed);
        }
      }
      
      saveMedicines(updated);
      saveMedicineHistory({
        medicineId: id,
        medicineName: med.name,
        date: new Date().toDateString(),
        time: med.time,
        taken: newTaken,
        timestamp: Date.now(),
      });
      return updated;
    });
  };

  const deleteMedicine = async (id) => {
    setMedicines((prev) => {
      const med = prev.find((m) => m.id === id);
      if (med?.notificationId) {
        cancelNotification(med.notificationId);
      }
      const updated = prev.filter((m) => m.id !== id);
      saveMedicines(updated);
      return updated;
    });
  };

  const addHealthLog = async (log) => {
    const newLog = { ...log, id: Date.now() };
    const updated = [newLog, ...healthLogs];
    setHealthLogs(updated);
    await saveHealthLogs(updated);
  };

  const addAppointment = async (appt) => {
    const newAppt = { ...appt, id: Date.now().toString() };
    const updated = [...appointments, newAppt].sort((a, b) => new Date(a.date) - new Date(b.date));
    setAppointments(updated);
    await saveAppointments(updated);
  };

  const cancelAppointment = async (id) => {
    const updated = appointments.filter((a) => a.id !== id);
    setAppointments(updated);
    await saveAppointments(updated);
  };

  const saveContacts = async (contacts) => {
    setEmergencyContacts(contacts);
    await saveEmergencyContacts(contacts);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        authChecked,
        medicines,
        healthLogs,
        appointments,
        emergencyContacts,
        login,
        logout,
        addMedicine,
        editMedicine,
        toggleTaken,
        deleteMedicine,
        addHealthLog,
        addAppointment,
        cancelAppointment,
        saveContacts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
