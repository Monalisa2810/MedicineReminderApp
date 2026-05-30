import { useState, useEffect } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useTheme } from "../utils/theme";
import { useAppContext } from "../context/AppContext";

export default function EmergencyScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { emergencyContacts, saveContacts } = useAppContext();

  const [contacts, setContacts] = useState(
    emergencyContacts.length > 0 ? emergencyContacts : [{ name: "", phone: "", relation: "" }]
  );

  const updateContact = (index, field, value) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
  };

  const addContactRow = () => {
    if (contacts.length >= 3) {
      Alert.alert("Limit Reached", "You can only add up to 3 emergency contacts.");
      return;
    }
    setContacts([...contacts, { name: "", phone: "", relation: "" }]);
  };

  const removeContactRow = (index) => {
    const updated = contacts.filter((_, i) => i !== index);
    setContacts(updated);
  };

  const handleSave = async () => {
    // Filter out empty rows
    const validContacts = contacts.filter((c) => c.name.trim() && c.phone.trim());
    await saveContacts(validContacts);
    Alert.alert("Saved", "Emergency contacts have been updated.");
    router.back();
  };

  const callEmergencyServices = () => {
    Linking.openURL("tel:911");
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen 
        options={{ 
          title: "Emergency SOS",
          headerStyle: { backgroundColor: colors.danger },
          headerTintColor: "#fff",
        }} 
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <TouchableOpacity
          style={[styles.sosButton, { backgroundColor: colors.danger }]}
          onPress={callEmergencyServices}
          activeOpacity={0.8}
        >
          <Text style={styles.sosEmoji}>🚨</Text>
          <Text style={styles.sosTitle}>Call Emergency Services</Text>
          <Text style={styles.sosSub}>Tap to instantly dial 911</Text>
        </TouchableOpacity>

        <View style={styles.headerRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Emergency Contacts</Text>
          <TouchableOpacity onPress={addContactRow}>
            <Text style={[styles.addText, { color: colors.primary }]}>+ Add Contact</Text>
          </TouchableOpacity>
        </View>

        {contacts.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.sub }]}>No contacts added yet.</Text>
        )}

        {contacts.map((contact, index) => (
          <View key={index} style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Contact {index + 1}</Text>
              <TouchableOpacity onPress={() => removeContactRow(index)}>
                <Text style={{ color: colors.danger, fontFamily: "Inter-SemiBold", fontSize: 13 }}>Remove</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: colors.sub }]}>NAME</Text>
            <TextInput
              style={inputStyle}
              placeholder="e.g. John Doe"
              placeholderTextColor={colors.sub}
              value={contact.name}
              onChangeText={(val) => updateContact(index, "name", val)}
            />

            <Text style={[styles.label, { color: colors.sub }]}>PHONE NUMBER</Text>
            <TextInput
              style={inputStyle}
              placeholder="e.g. 555-0198"
              placeholderTextColor={colors.sub}
              keyboardType="phone-pad"
              value={contact.phone}
              onChangeText={(val) => updateContact(index, "phone", val)}
            />

            <Text style={[styles.label, { color: colors.sub }]}>RELATION</Text>
            <TextInput
              style={inputStyle}
              placeholder="e.g. Spouse, Parent"
              placeholderTextColor={colors.sub}
              value={contact.relation}
              onChangeText={(val) => updateContact(index, "relation", val)}
            />

            {!!contact.phone && (
              <TouchableOpacity
                style={[styles.callBtn, { backgroundColor: colors.primaryLight }]}
                onPress={() => Linking.openURL(`tel:${contact.phone}`)}
              >
                <Text style={{ color: colors.primary, fontFamily: "Inter-Bold" }}>📞 Call {contact.name || "Contact"}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveBtnText}>💾 Save Contacts</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sosButton: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 24,
  },
  sosEmoji: { fontSize: 48, marginBottom: 8 },
  sosTitle: { fontSize: 22, fontFamily: "Inter-ExtraBold", color: "#fff", marginBottom: 4 },
  sosSub: { fontSize: 13, fontFamily: "Inter-SemiBold", color: "rgba(255,255,255,0.8)" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter-ExtraBold" },
  addText: { fontSize: 14, fontFamily: "Inter-Bold" },
  emptyText: { fontSize: 14, fontFamily: "Inter-Regular", marginBottom: 16 },
  contactCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  cardTitle: { fontSize: 15, fontFamily: "Inter-Bold" },
  label: { fontSize: 10, fontFamily: "Inter-Bold", letterSpacing: 0.8, marginBottom: 6, marginTop: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14, fontFamily: "Inter-Regular" },
  callBtn: { marginTop: 16, padding: 12, borderRadius: 12, alignItems: "center" },
  saveBtn: { borderRadius: 16, padding: 16, alignItems: "center", marginTop: 8 },
  saveBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter-Bold" },
});
