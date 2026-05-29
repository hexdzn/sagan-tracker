import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface DateInputProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
}

function formatDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d} ${months[parseInt(m) - 1]} ${y}`;
}

function toDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function DateInput({ value, onChange, label = "Date" }: DateInputProps) {
  const colors = useColors();
  const [showPicker, setShowPicker] = useState(false);

  const dateObj = value ? toDate(value) : new Date();

  if (Platform.OS === "web") {
    return (
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
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
          value={value}
          onChangeText={onChange}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.mutedForeground}
        />
      </View>
    );
  }

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <Pressable
        onPress={() => setShowPicker(true)}
        style={[
          styles.input,
          styles.datePressable,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.dateText, { color: value ? colors.foreground : colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {value ? formatDisplay(value) : "Select date"}
        </Text>
        <Feather name="calendar" size={16} color={colors.mutedForeground} />
      </Pressable>

      {showPicker && (
        <Modal transparent animationType="fade" onRequestClose={() => setShowPicker(false)}>
          <Pressable style={styles.pickerBackdrop} onPress={() => setShowPicker(false)}>
            <View style={[styles.pickerContainer, { backgroundColor: colors.card }]}>
              <DateTimePicker
                value={dateObj}
                mode="date"
                display="spinner"
                onChange={(_, selected) => {
                  setShowPicker(false);
                  if (selected) onChange(toDateStr(selected));
                }}
                textColor={colors.foreground}
              />
              <Pressable
                style={[styles.doneBtn, { backgroundColor: colors.primary }]}
                onPress={() => setShowPicker(false)}
              >
                <Text style={[styles.doneBtnText, { fontFamily: "Inter_600SemiBold" }]}>Done</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 16,
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
  datePressable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 15,
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  pickerContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 32,
  },
  doneBtn: {
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  doneBtnText: {
    color: "#fff",
    fontSize: 16,
  },
});
