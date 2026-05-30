import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function registerForPushNotifications() {
  if (Platform.OS === "web" || !Device.isDevice) return;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    alert("Enable notifications in Settings to get medicine reminders.");
  }
}

export async function scheduleMedicineNotification(medicine) {
  if (Platform.OS === "web") return null;
  const [hour, minute] = medicine.time.split(":").map(Number);
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: "💊 Medicine Reminder",
      body: `Time to take ${medicine.name} — ${medicine.dosage}`,
      sound: true,
      data: { medicineId: medicine.id },
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });
  return identifier;
}

export async function cancelNotification(identifier) {
  if (Platform.OS === "web") return;
  if (identifier) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }
}

export async function cancelAllNotifications() {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleRefillNotification(medicine) {
  if (Platform.OS === "web") {
    setTimeout(() => {
      window.alert(`💊 Refill Reminder: ${medicine.name} is running low! Only ${medicine.pillsRemaining} pills left.`);
    }, 500);
    return null;
  }
  
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: "💊 Refill Reminder",
      body: `${medicine.name} is running low! Only ${medicine.pillsRemaining} pills left.`,
      sound: true,
      data: { medicineId: medicine.id, type: "refill" },
    },
    trigger: {
      seconds: 5,
      repeats: false,
    },
  });
  return identifier;
}
