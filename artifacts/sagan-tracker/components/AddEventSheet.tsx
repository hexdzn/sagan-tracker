import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { BottomSheet } from "@/components/BottomSheet";
import { DateInput } from "@/components/DateInput";
import { SuggestionInput } from "@/components/SuggestionInput";
import { useSagan } from "@/context/SaganContext";
import { useColors } from "@/hooks/useColors";
import { OCCASION_TYPES } from "@/types";

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AddEventSheet({ visible, onClose }: Props) {
  const colors = useColors();
  const { addEvent } = useSagan();
  const [name, setName] = useState("");
  const [date, setDate] = useState(todayStr());
  const [occasionType, setOccasionType] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (visible) {
      setName("");
      setDate(todayStr());
      setOccasionType("");
      setNotes("");
    }
  }, [visible]);

  const handleSave = () => {
    if (!name.trim() || !date || !occasionType) {
      Alert.alert("Missing fields", "Please fill in event name, date, and occasion type.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addEvent({ name: name.trim(), date, occasionType, notes: notes.trim() || undefined });
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Create Event
          </Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              Event Name <Text style={{ color: colors.destructive }}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border, fontFamily: "Inter_400Regular" },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Rahul's Wedding"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          <DateInput value={date} onChange={setDate} label="Date" />

          <SuggestionInput
            label="Occasion Type"
            value={occasionType}
            onChangeText={setOccasionType}
            suggestions={OCCASION_TYPES}
            placeholder="Wedding, Diwali..."
            required
          />

          <View style={[styles.field, { marginBottom: 4 }]}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              Notes <Text style={{ fontWeight: "400" }}>(optional)</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textarea,
                { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border, fontFamily: "Inter_400Regular" },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any notes..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.saveBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={handleSave}
          >
            <Text style={[styles.saveBtnText, { fontFamily: "Inter_600SemiBold" }]}>
              Create Event
            </Text>
          </Pressable>
          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },
  title: { fontSize: 20, marginBottom: 18, marginTop: 4 },
  field: { marginBottom: 16, zIndex: 1 },
  label: { fontSize: 12, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 },
  input: { height: 48, borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 14, fontSize: 15 },
  textarea: { height: 88, paddingTop: 12 },
  saveBtn: { marginTop: 8, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 17 },
});
