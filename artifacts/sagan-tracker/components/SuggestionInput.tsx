import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface SuggestionInputProps extends Omit<TextInputProps, "value" | "onChangeText"> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  suggestions: string[];
  required?: boolean;
}

export function SuggestionInput({
  label,
  value,
  onChangeText,
  suggestions,
  required,
  ...rest
}: SuggestionInputProps) {
  const colors = useColors();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(value.toLowerCase()) && s.toLowerCase() !== value.toLowerCase()
  );

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        {label}
        {required && <Text style={{ color: colors.destructive }}> *</Text>}
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
        value={value}
        onChangeText={(t) => {
          onChangeText(t);
          setShowSuggestions(t.length > 0);
        }}
        onFocus={() => setShowSuggestions(value.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        placeholderTextColor={colors.mutedForeground}
        {...rest}
      />
      {showSuggestions && filtered.length > 0 && (
        <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <FlatList
            data={filtered.slice(0, 5)}
            keyExtractor={(item) => item}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.suggestion,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => {
                  onChangeText(item);
                  setShowSuggestions(false);
                }}
              >
                <Text style={[styles.suggestionText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                  {item}
                </Text>
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 16,
    zIndex: 10,
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
  dropdown: {
    position: "absolute",
    top: 70,
    left: 0,
    right: 0,
    borderRadius: 10,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  suggestion: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  suggestionText: {
    fontSize: 15,
  },
});
