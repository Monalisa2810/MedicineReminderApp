import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useTheme } from "../utils/theme";
import { useAppContext } from "../context/AppContext";

const DOCTORS = [
  { id: "1", name: "Dr. Sarah Jenkins", specialty: "Cardiologist", rating: "4.9", experience: "12 years", fee: "$150", image: "👩‍⚕️" },
  { id: "2", name: "Dr. Michael Chen", specialty: "General Physician", rating: "4.8", experience: "8 years", fee: "$80", image: "👨‍⚕️" },
  { id: "3", name: "Dr. Emily Stone", specialty: "Endocrinologist", rating: "4.7", experience: "15 years", fee: "$200", image: "👩‍⚕️" },
  { id: "4", name: "Dr. James Wilson", specialty: "Neurologist", rating: "4.9", experience: "20 years", fee: "$250", image: "👨‍⚕️" },
];

export default function DoctorsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { addAppointment, appointments, cancelAppointment } = useAppContext();

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [bookingDate, setBookingDate] = useState(new Date(Date.now() + 86400000 * 2)); // 2 days from now

  const handleBook = async () => {
    if (!selectedDoc) return;
    await addAppointment({
      doctorId: selectedDoc.id,
      doctorName: selectedDoc.name,
      specialty: selectedDoc.specialty,
      date: bookingDate.toISOString(),
      fee: selectedDoc.fee,
      status: "Upcoming",
    });
    Alert.alert("Appointment Confirmed", `Your appointment with ${selectedDoc.name} is booked.`);
    setSelectedDoc(null);
  };

  const handleCancel = (id) => {
    Alert.alert("Cancel Appointment", "Are you sure you want to cancel this appointment?", [
      { text: "No", style: "cancel" },
      { text: "Yes", style: "destructive", onPress: () => cancelAppointment(id) },
    ]);
  };

  const upcomingAppts = appointments.filter((a) => new Date(a.date) > new Date());

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen 
        options={{ 
          title: "Care Services",
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
        }} 
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Upcoming Appointments Section */}
        {upcomingAppts.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Appointments</Text>
            {upcomingAppts.map((appt) => (
              <View key={appt.id} style={[styles.apptCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.docName, { color: colors.text }]}>{appt.doctorName}</Text>
                  <Text style={[styles.docSpec, { color: colors.primary }]}>{appt.specialty}</Text>
                  <Text style={[styles.apptDate, { color: colors.sub }]}>
                    📅 {new Date(appt.date).toLocaleDateString()} at {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                {Platform.OS === 'web' ? (
                  <TouchableOpacity onPress={() => {
                    if (window.confirm("Cancel this appointment?")) cancelAppointment(appt.id);
                  }}>
                    <Text style={{ color: colors.danger, fontFamily: 'Inter-Bold', fontSize: 13 }}>Cancel</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => handleCancel(appt.id)}>
                    <Text style={{ color: colors.danger, fontFamily: 'Inter-Bold', fontSize: 13 }}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>Available Specialists</Text>

        {DOCTORS.map((doc) => (
          <View key={doc.id} style={[styles.docCard, { backgroundColor: colors.card, borderColor: selectedDoc?.id === doc.id ? colors.primary : colors.border }]}>
            <View style={{ flexDirection: "row" }}>
              <View style={[styles.docAvatar, { backgroundColor: colors.primaryLight }]}>
                <Text style={{ fontSize: 32 }}>{doc.image}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 16, justifyContent: "center" }}>
                <Text style={[styles.docName, { color: colors.text }]}>{doc.name}</Text>
                <Text style={[styles.docSpec, { color: colors.primary }]}>{doc.specialty}</Text>
                <View style={{ flexDirection: "row", marginTop: 4, gap: 12 }}>
                  <Text style={[styles.docInfo, { color: colors.sub }]}>⭐ {doc.rating}</Text>
                  <Text style={[styles.docInfo, { color: colors.sub }]}>💼 {doc.experience}</Text>
                  <Text style={[styles.docInfo, { color: colors.sub }]}>💳 {doc.fee}</Text>
                </View>
              </View>
            </View>

            {selectedDoc?.id === doc.id ? (
              <View style={styles.bookingAction}>
                <Text style={[styles.label, { color: colors.sub }]}>SELECT DATE & TIME</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="datetime-local"
                    value={new Date(bookingDate.getTime() - bookingDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                    onChange={(e) => {
                      if (e.target.value) setBookingDate(new Date(e.target.value));
                    }}
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      border: `1px solid ${colors.border}`,
                      backgroundColor: colors.inputBg,
                      color: colors.text,
                      fontFamily: "Inter-Regular",
                      width: "100%",
                      marginBottom: 12,
                    }}
                  />
                ) : (
                  <Text style={{ color: colors.text, marginBottom: 12 }}>
                    (Native date picker requires specific libraries, please mock via Web for now or assume auto-selection of +2 days)
                    {"\n\n"}Auto-selected: {bookingDate.toLocaleString()}
                  </Text>
                )}
                
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: colors.border, flex: 1 }]}
                    onPress={() => setSelectedDoc(null)}
                  >
                    <Text style={{ color: colors.text, fontFamily: "Inter-Bold" }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: colors.primary, flex: 2 }]}
                    onPress={handleBook}
                  >
                    <Text style={{ color: "#fff", fontFamily: "Inter-Bold" }}>Confirm Booking</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.bookBtn, { backgroundColor: colors.primaryLight }]}
                onPress={() => setSelectedDoc(doc)}
              >
                <Text style={[styles.bookBtnText, { color: colors.primary }]}>Book Consultation</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontFamily: "Inter-ExtraBold", marginBottom: 12 },
  apptCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  apptDate: { fontSize: 13, fontFamily: "Inter-SemiBold", marginTop: 4 },
  docCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  docAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  docName: { fontSize: 16, fontFamily: "Inter-Bold" },
  docSpec: { fontSize: 13, fontFamily: "Inter-SemiBold", marginTop: 2 },
  docInfo: { fontSize: 11, fontFamily: "Inter-SemiBold" },
  bookBtn: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  bookBtnText: { fontFamily: "Inter-Bold", fontSize: 14 },
  bookingAction: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  label: { fontSize: 11, fontFamily: "Inter-Bold", letterSpacing: 0.5, marginBottom: 8 },
  btn: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
});
