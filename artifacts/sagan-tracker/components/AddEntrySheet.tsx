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
import {
  EntryType,
  OCCASION_SUGGESTIONS,
  RELATIONSHIP_SUGGESTIONS,
} from "@/types";

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface FormState {
  type: EntryType;
  date: string;
  occasion: string;
  eventId: string;
  amount: string;
  personName: string;
  relationshipTag: string;
  notes: string;
}

export function AddEntrySheet() {
  const colors = useColors();
  const { showAddEntry, setShowAddEntry, addEntry, events } = useSagan();

  const [form, setForm] = useState<FormState>({
    type: "received",
    date: todayStr(),
    occasion: "",
    eventId: "",
    amount: "",
    personName: "",
    relationshipTag: "",
    notes: "",
  });

  useEffect(() => {
    if (showAddEntry) {
      setForm({
        type: "received",
        date: todayStr(),
        occasion: "",
        eventId: "",
        amount: "",
        personName: "",
        relationshipTag: "",
        notes: "",
      });
    }
  }, [showAddEntry]);

  const set = (key: keyof FormState) => (val: string) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleSave = () => {
    if (!form.date || !form.occasion || !form.amount || !form.personName || !form.relationshipTag) {
      Alert.alert("Missing fields", "Please fill in all required fields.");
      return;
    }
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addEntry({
      type: form.type,
      date: form.date,
      occasion: form.occasion,
      eventId: form.eventId || undefined,
      amount: amt,
      personName: form.personName.trim(),
      relationshipTag: form.relationshipTag.trim(),
      notes: form.notes.trim() || undefined,
    });
    setShowAddEntry(false);
  };

  const isReceived = form.type === "received";

  return (
    <BottomSheet visible={showAddEntry} onClose={() => setShowAddEntry(false)}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.sheetTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Add Sagan
          </Text>

          <View style={[styles.toggle, { backgroundColor: colors.muted }]}>
            <Pressable
              style={[
                styles.toggleBtn,
                isReceived && { backgroundColor: colors.received },
              ]}
              onPress={() => set("type")("received")}
            >
              <Text
                style={[
                  styles.toggleText,
                  { fontFamily: "Inter_600SemiBold" },
                  isReceived
                    ? { color: "#fff" }
                    : { color: colors.mutedForeground },
                ]}
              >
                Received
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.toggleBtn,
                !isReceived && { backgroundColor: colors.given },
              ]}
              onPress={() => set("type")("given")}
            >
              <Text
                style={[
                  styles.toggleText,
                  { fontFamily: "Inter_600SemiBold" },
                  !isReceived
                    ? { color: "#fff" }
                    : { color: colors.mutedForeground },
                ]}
              >
                Given
              </Text>
            </Pressable>
          </View>

          <View style={styles.form}>
            <DateInput value={form.date} onChange={set("date")} label="Date" />

            <SuggestionInput
              label="Occasion"
              value={form.occasion}
              onChangeText={set("occasion")}
              suggestions={OCCASION_SUGGESTIONS}
              placeholder="e.g. Wedding, Diwali..."
              required
            />

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                Link to Event <Text style={{ color: colors.mutedForeground, fontWeight: "400" }}>(optional)</Text>
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventPills}>
                <Pressable
                  style={[
                    styles.pill,
                    {
                      backgroundColor: !form.eventId ? colors.primary : colors.muted,
                      borderColor: !form.eventId ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => set("eventId")("")}
                >
                  <Text style={[styles.pillText, { color: !form.eventId ? "#fff" : colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                    None
                  </Text>
                </Pressable>
                {events.map((ev) => (
                  <Pressable
                    key={ev.id}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: form.eventId === ev.id ? colors.primary : colors.muted,
                        borderColor: form.eventId === ev.id ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => set("eventId")(ev.id)}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        {
                          color: form.eventId === ev.id ? "#fff" : colors.mutedForeground,
                          fontFamily: "Inter_500Medium",
                        },
                      ]}
                    >
                      {ev.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                Amount (₹) <Text style={{ color: colors.destructive }}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
                value={form.amount}
                onChangeText={set("amount")}
                placeholder="0"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                {isReceived ? "Received From" : "Given To"} <Text style={{ color: colors.destructive }}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
                value={form.personName}
                onChangeText={set("personName")}
                placeholder="Full name"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            <SuggestionInput
              label="Relationship"
              value={form.relationshipTag}
              onChangeText={set("relationshipTag")}
              suggestions={RELATIONSHIP_SUGGESTIONS}
              placeholder="Uncle, Cousin, Friend..."
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
                  {
                    color: colors.foreground,
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
                value={form.notes}
                onChangeText={set("notes")}
                placeholder="Any additional notes..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.saveBtn,
              {
                backgroundColor: isReceived ? colors.received : colors.given,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={handleSave}
          >
            <Text style={[styles.saveBtnText, { fontFamily: "Inter_600SemiBold" }]}>
              Save Entry
            </Text>
          </Pressable>
          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
  },
  sheetTitle: {
    fontSize: 20,
    marginBottom: 18,
    marginTop: 4,
  },
  toggle: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: "center",
  },
  toggleText: {
    fontSize: 15,
  },
  form: {},
  field: {
    marginBottom: 16,
    zIndex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  textarea: {
    height: 88,
    paddingTop: 12,
  },
  eventPills: {
    flexDirection: "row",
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  pillText: {
    fontSize: 13,
  },
  saveBtn: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 17,
  },
});
